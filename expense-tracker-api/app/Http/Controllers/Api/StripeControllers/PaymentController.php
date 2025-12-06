<?php

namespace App\Http\Controllers\Api\StripeControllers;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Transaction;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

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
     * Sync payment to transaction (create income transaction)
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

        // Find or create a "Stripe Payment" category
        $category = Category::firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'name' => 'Stripe Payment',
            ],
            [
                'type' => 'expense',
                'color' => '#635BFF', // Stripe purple
                'emoji' => '💳',
                'is_system' => false,
            ]
        );

        // Get or create a default account for Stripe payments
        $account = \App\Models\Account::firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'name' => 'Stripe',
            ],
            [
                'type' => 'bank',
                'balance' => 0,
                'currency' => 'EUR',
            ]
        );

        // Create transaction
        $transaction = Transaction::create([
            'user_id' => $request->user()->id,
            'category_id' => $category->id,
            'account_id' => $account->id,
            'amount' => $payment->amount,
            'type' => 'expense',
            'description' => $payment->description ?? 'Stripe Payment',
            'date' => $payment->paid_at ?? $payment->created_at,
        ]);

        // Mark payment as synced
        $payment->markAsSynced($transaction->id);

        return response()->json([
            'message' => 'Payment synced to transaction',
            'transaction' => $transaction,
            'payment' => $payment,
        ]);
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

        $synced = 0;
        $payments = $request->user()
            ->payments()
            ->whereIn('id', $request->payment_ids)
            ->where('synced_to_transaction', false)
            ->where('status', 'succeeded')
            ->get();

        foreach ($payments as $payment) {
            // Use the same logic as single sync
            $category = Category::firstOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'name' => 'Stripe Payment',
                ],
                [
                    'type' => 'expense',
                    'color' => '#635BFF',
                    'emoji' => '💳',
                    'is_system' => false,
                ]
            );

            // Get or create a default account
            $account = \App\Models\Account::firstOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'name' => 'Stripe',
                ],
                [
                    'type' => 'bank',
                    'balance' => 0,
                    'currency' => 'EUR',
                ]
            );

            $transaction = Transaction::create([
                'user_id' => $request->user()->id,
                'category_id' => $category->id,
                'account_id' => $account->id,
                'amount' => $payment->amount,
                'type' => 'expense',
                'description' => $payment->description ?? 'Stripe Payment',
                'date' => $payment->paid_at ?? $payment->created_at,
            ]);

            $payment->markAsSynced($transaction->id);
            $synced++;
        }

        return response()->json([
            'message' => "$synced payments synced to transactions",
            'synced_count' => $synced,
        ]);
    }
}