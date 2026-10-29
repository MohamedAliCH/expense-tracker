<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Services\AccountLedgerService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdvancedFeaturesTest extends TestCase
{
    use RefreshDatabase;

    public function test_transfer_moves_funds_between_accounts_and_creates_paired_transactions(): void
    {
        $user = User::factory()->create();

        $checking = Account::create([
            'user_id' => $user->id,
            'name' => 'Checking',
            'type' => 'bank',
            'balance' => 1500.00,
        ]);

        $savings = Account::create([
            'user_id' => $user->id,
            'name' => 'Savings Vault',
            'type' => 'wallet',
            'balance' => 2000.00,
        ]);

        $response = $this->actingAs($user)->postJson('/api/accounts/transfer', [
            'from_account_id' => $checking->id,
            'to_account_id' => $savings->id,
            'amount' => 500.00,
            'description' => 'Monthly Savings Allocation',
        ]);

        $response->assertStatus(200);

        $this->assertEquals(1000.00, (float) $checking->fresh()->balance);
        $this->assertEquals(2500.00, (float) $savings->fresh()->balance);

        $this->assertEquals(2, Transaction::where('user_id', $user->id)->count());

        $outTx = Transaction::where('account_id', $checking->id)->first();
        $this->assertEquals('expense', $outTx->type);
        $this->assertEquals(500.00, (float) $outTx->amount);

        $inTx = Transaction::where('account_id', $savings->id)->first();
        $this->assertEquals('income', $inTx->type);
        $this->assertEquals(500.00, (float) $inTx->amount);
    }

    public function test_transfer_blocks_invalid_source_and_same_account(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $acc1 = Account::create([
            'user_id' => $user->id,
            'name' => 'Checking',
            'type' => 'bank',
            'balance' => 500.00,
        ]);

        $otherAcc = Account::create([
            'user_id' => $otherUser->id,
            'name' => 'Stolen Account',
            'type' => 'bank',
            'balance' => 100.00,
        ]);

        // Same account transfer blocked
        $this->actingAs($user)->postJson('/api/accounts/transfer', [
            'from_account_id' => $acc1->id,
            'to_account_id' => $acc1->id,
            'amount' => 50.00,
        ])->assertStatus(422);

        // Cross-user transfer blocked
        $this->actingAs($user)->postJson('/api/accounts/transfer', [
            'from_account_id' => $acc1->id,
            'to_account_id' => $otherAcc->id,
            'amount' => 50.00,
        ])->assertStatus(404);
    }

    public function test_bulk_csv_import_updates_balances_atomically(): void
    {
        $user = User::factory()->create();

        $account = Account::create([
            'user_id' => $user->id,
            'name' => 'Checking',
            'type' => 'bank',
            'balance' => 1000.00,
        ]);

        $cat = Category::create([
            'user_id' => $user->id,
            'name' => 'Groceries',
            'type' => 'expense',
            'color' => '#d97724',
            'emoji' => 'groceries',
        ]);

        $rows = [
            [
                'account_id' => $account->id,
                'category_id' => $cat->id,
                'amount' => 75.50,
                'type' => 'expense',
                'description' => 'Supermarket Provision',
                'date' => now()->toDateString(),
            ],
            [
                'account_id' => $account->id,
                'category_id' => $cat->id,
                'amount' => 25.00,
                'type' => 'expense',
                'description' => 'Bakery run',
                'date' => now()->toDateString(),
            ],
        ];

        $response = $this->actingAs($user)->postJson('/api/transactions/import', [
            'transactions' => $rows,
        ]);

        $response->assertStatus(200);
        $this->assertEquals(2, $response->json('imported_count'));
        $this->assertEquals(899.50, (float) $account->fresh()->balance);
    }

    public function test_recurring_transaction_generates_due_instance(): void
    {
        $user = User::factory()->create();

        $account = Account::create([
            'user_id' => $user->id,
            'name' => 'Checking',
            'type' => 'bank',
            'balance' => 3000.00,
        ]);

        $cat = Category::create([
            'user_id' => $user->id,
            'name' => 'Rent',
            'type' => 'expense',
            'color' => '#c85a32',
            'emoji' => 'housing',
        ]);

        // Recurring transaction created 35 days ago (due)
        $tx = Transaction::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $cat->id,
            'amount' => 1200.00,
            'type' => 'expense',
            'description' => 'Monthly Rent',
            'date' => Carbon::now()->subDays(35)->toDateString(),
            'is_recurring' => true,
            'recurring_frequency' => 'monthly',
            'last_recurred_at' => Carbon::now()->subDays(35)->toDateString(),
        ]);
        AccountLedgerService::applyTransaction($tx);

        $this->assertEquals(1800.00, (float) $account->fresh()->balance);

        // Process recurring
        $processed = AccountLedgerService::processRecurringForUser($user);
        $this->assertEquals(1, $processed);

        // Account balance deducted again by 1200
        $this->assertEquals(600.00, (float) $account->fresh()->balance);
        $this->assertEquals(2, Transaction::where('user_id', $user->id)->count());
    }
}

