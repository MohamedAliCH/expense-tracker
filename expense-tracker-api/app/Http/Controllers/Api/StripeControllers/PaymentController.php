<?php

namespace App\Http\Controllers\Api\StripeControllers;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Payment;
use App\Models\Transaction;
use App\Models\Category;
use App\Services\AccountLedgerService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * List all payments for current user
     */
    public function index(Request $request): JsonResponse
    {
        $payments = $request->user()
            ->payments()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($payments);
    }

    /**
     * Get single payment details
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $payment = $request->user()
            ->payments()
            ->findOrFail($id);

        return response()->json($payment);
    }

    /**
     * Resolve or create the category and account for syncing a Stripe payment
     */
    private function resolveSyncTarget($user): array
    {
        $category = Category::firstOrCreate(
            [
                'user_id' => $user->id,
                'name' => 'Stripe Payment',
            ],
            [
                'type' => 'expense',
                'color' => '#1f7a8c',
                'emoji' => 'utilities',
            ]
        );

        // Prefer an existing bank/credit_card account if user is at their free account limit
        $account = Account::where('user_id', $user->id)
            ->where('name', 'Stripe')
            ->first();

        if (!$account) {
            $limits = $user->getLimits();
            if ($user->accounts()->count() >= $limits['max_accounts']) {
                $account = $user->accounts()->first();
            }
        }

        if (!$account) {
            $account = Account::create([
                'user_id' => $user->id,
                'name' => 'Stripe',
                'type' => 'bank',
                'balance' => 0,
            ]);
        }

        return [$category, $account];
    }

    /**
     * Sync payment to transaction
     */
    public function syncToTransaction(Request $request, int $id): JsonResponse
    {
        $payment = $request->user()
            ->payments()
            ->where('synced_to_transaction', false)
            ->findOrFail($id);

        if (!$payment->isSucceeded()) {
            return response()->json([
                'message' => 'Only succeeded payments can be synced'
            ], 400);
        }

        return DB::transaction(function () use ($request, $payment) {
            [$category, $account] = $this->resolveSyncTarget($request->user());

            $transaction = Transaction::create([
                'user_id' => $request->user()->id,
                'category_id' => $category->id,
                'account_id' => $account->id,
                'amount' => $payment->amount,
                'type' => 'expense',
                'description' => $payment->description ?? 'Stripe Payment',
                'date' => $payment->paid_at ?? $payment->created_at,
            ]);

            AccountLedgerService::applyTransaction($transaction);
            $payment->markAsSynced($transaction->id);

            return response()->json([
                'message' => 'Payment synced to transaction',
                'transaction' => $transaction->load(['category', 'account']),
                'payment' => $payment,
            ]);
        });
    }

    /**
     * Bulk sync payments
     */
    public function bulkSync(Request $request): JsonResponse
    {
        $request->validate([
            'payment_ids' => 'required|array',
            'payment_ids.*' => 'integer',
        ]);

        return DB::transaction(function () use ($request) {
            $synced = 0;
            $payments = $request->user()
                ->payments()
                ->whereIn('id', $request->payment_ids)
                ->where('synced_to_transaction', false)
                ->where('status', 'succeeded')
                ->get();

            if ($payments->isEmpty()) {
                return response()->json([
                    'message' => '0 payments synced to transactions',
                    'synced_count' => 0,
                ]);
            }

            [$category, $account] = $this->resolveSyncTarget($request->user());

            foreach ($payments as $payment) {
                $transaction = Transaction::create([
                    'user_id' => $request->user()->id,
                    'category_id' => $category->id,
                    'account_id' => $account->id,
                    'amount' => $payment->amount,
                    'type' => 'expense',
                    'description' => $payment->description ?? 'Stripe Payment',
                    'date' => $payment->paid_at ?? $payment->created_at,
                ]);

                AccountLedgerService::applyTransaction($transaction);
                $payment->markAsSynced($transaction->id);
                $synced++;
            }

            return response()->json([
                'message' => "$synced payments synced to transactions",
                'synced_count' => $synced,
            ]);
        });
    }
}
