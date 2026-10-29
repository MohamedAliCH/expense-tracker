<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AccountLedgerService
{
    /**
     * Apply or reverse a transaction's effect on its parent account balance
     * within an active database transaction using row-level locking.
     */
    public static function applyTransaction(Transaction $transaction, bool $reverse = false): void
    {
        if (!$transaction->account_id) {
            return;
        }

        $account = Account::where('id', $transaction->account_id)
            ->lockForUpdate()
            ->first();

        if (!$account) {
            return;
        }

        $amount = (float) $transaction->amount;
        $isIncome = $transaction->type === 'income';

        if ($reverse) {
            $account->balance += $isIncome ? -$amount : $amount;
        } else {
            $account->balance += $isIncome ? $amount : -$amount;
        }

        $account->save();
    }

    /**
     * Execute an atomic account-to-account transfer with dual ledger entries
     */
    public static function transfer(
        User $user,
        int $fromAccountId,
        int $toAccountId,
        float $amount,
        ?string $description = null,
        ?string $date = null
    ): array {
        if ($fromAccountId === $toAccountId) {
            throw ValidationException::withMessages([
                'to_account_id' => ['Source and destination accounts must be different.'],
            ]);
        }

        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'amount' => ['Transfer amount must be greater than zero.'],
            ]);
        }

        return DB::transaction(function () use ($user, $fromAccountId, $toAccountId, $amount, $description, $date) {
            // Lock both accounts in consistent order to prevent deadlocks
            $firstId = min($fromAccountId, $toAccountId);
            $secondId = max($fromAccountId, $toAccountId);

            Account::where('id', $firstId)->where('user_id', $user->id)->lockForUpdate()->firstOrFail();
            Account::where('id', $secondId)->where('user_id', $user->id)->lockForUpdate()->firstOrFail();

            $fromAccount = Account::where('id', $fromAccountId)->where('user_id', $user->id)->firstOrFail();
            $toAccount = Account::where('id', $toAccountId)->where('user_id', $user->id)->firstOrFail();

            // Find or create Transfer Categories
            $outCategory = Category::firstOrCreate(
                ['user_id' => $user->id, 'name' => 'Transfer Out'],
                ['type' => 'expense', 'color' => '#4a6fa5', 'emoji' => 'arrows-left-right', 'is_system' => false]
            );

            $inCategory = Category::firstOrCreate(
                ['user_id' => $user->id, 'name' => 'Transfer In'],
                ['type' => 'income', 'color' => '#2a9d8f', 'emoji' => 'arrows-left-right', 'is_system' => false]
            );

            $txDate = $date ? Carbon::parse($date)->toDateString() : now()->toDateString();
            $customMemo = $description ? " ({$description})" : "";

            // 1. Expense transaction from source account
            $outTx = Transaction::create([
                'user_id' => $user->id,
                'account_id' => $fromAccount->id,
                'category_id' => $outCategory->id,
                'amount' => $amount,
                'type' => 'expense',
                'description' => "Transfer to {$toAccount->name}{$customMemo}",
                'date' => $txDate,
                'notes' => "Inter-account transfer to {$toAccount->name}",
            ]);

            // 2. Income transaction into destination account
            $inTx = Transaction::create([
                'user_id' => $user->id,
                'account_id' => $toAccount->id,
                'category_id' => $inCategory->id,
                'amount' => $amount,
                'type' => 'income',
                'description' => "Transfer from {$fromAccount->name}{$customMemo}",
                'date' => $txDate,
                'notes' => "Inter-account transfer from {$fromAccount->name}",
            ]);

            // Apply ledger updates
            self::applyTransaction($outTx);
            self::applyTransaction($inTx);

            return [
                'from_account' => $fromAccount->fresh(),
                'to_account' => $toAccount->fresh(),
                'transactions' => [
                    $outTx->load(['account', 'category']),
                    $inTx->load(['account', 'category']),
                ],
            ];
        });
    }

    /**
     * Bulk import normalized transactions within a database transaction
     */
    public static function importTransactions(User $user, array $rows): array
    {
        return DB::transaction(function () use ($user, $rows) {
            $created = [];

            foreach ($rows as $row) {
                $amount = (float) ($row['amount'] ?? 0);
                if ($amount <= 0) {
                    continue;
                }

                $type = in_array(strtolower($row['type'] ?? ''), ['income', 'expense'], true)
                    ? strtolower($row['type'])
                    : 'expense';

                $tx = Transaction::create([
                    'user_id' => $user->id,
                    'account_id' => $row['account_id'],
                    'category_id' => $row['category_id'],
                    'amount' => $amount,
                    'type' => $type,
                    'description' => trim($row['description'] ?? 'Imported Transaction'),
                    'date' => Carbon::parse($row['date'] ?? now())->toDateString(),
                    'notes' => $row['notes'] ?? 'Imported via CSV',
                ]);

                self::applyTransaction($tx);
                $created[] = $tx;
            }

            return [
                'imported_count' => count($created),
                'transactions' => $created,
            ];
        });
    }

    /**
     * Process due recurring transactions for a specific user
     */
    public static function processRecurringForUser(User $user): int
    {
        $today = Carbon::today();
        $processed = 0;

        $recurring = Transaction::where('user_id', $user->id)
            ->where('is_recurring', true)
            ->get();

        foreach ($recurring as $template) {
            $lastRun = $template->last_recurred_at
                ? Carbon::parse($template->last_recurred_at)
                : Carbon::parse($template->date);

            $frequency = $template->recurring_frequency ?? 'monthly';
            $isDue = false;

            if ($frequency === 'weekly' && $lastRun->diffInDays($today) >= 7) {
                $isDue = true;
            } elseif ($frequency === 'yearly' && $lastRun->diffInMonths($today) >= 12) {
                $isDue = true;
            } elseif ($frequency === 'monthly' && ($lastRun->diffInMonths($today) >= 1 || ($lastRun->month !== $today->month && $today->day >= min($lastRun->day, 28)))) {
                $isDue = true;
            }

            if ($isDue) {
                DB::transaction(function () use ($template, $today, &$processed) {
                    $newTx = Transaction::create([
                        'user_id' => $template->user_id,
                        'account_id' => $template->account_id,
                        'category_id' => $template->category_id,
                        'amount' => $template->amount,
                        'type' => $template->type,
                        'description' => $template->description,
                        'date' => $today->toDateString(),
                        'notes' => "Automated recurring instance of #{$template->id}",
                        'is_recurring' => false,
                    ]);

                    self::applyTransaction($newTx);
                    $template->update(['last_recurred_at' => $today->toDateString()]);
                    $processed++;
                });
            }
        }

        return $processed;
    }

    /**
     * Process due recurring transactions across all users
     */
    public static function processAllRecurring(): int
    {
        $total = 0;
        User::chunk(50, function ($users) use (&$total) {
            foreach ($users as $user) {
                $total += self::processRecurringForUser($user);
            }
        });
        return $total;
    }
}
