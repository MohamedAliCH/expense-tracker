<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TransactionController extends Controller
{
    /**
     * Get all transactions for authenticated user with filters
     */
    public function index(Request $request)
    {
        $query = Transaction::with(['category', 'account'])
            ->where('user_id', auth()->id())
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc');

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            // Using whereBetween is cleaner and DB-agnostic
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        
        // Filter by account
        if ($request->has('account_id')) {
             $query->where('account_id', $request->account_id);
        }

        return response()->json($query->get());
    }

    /**
     * Store a new transaction
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'date' => 'required|date',
            'category_id' => 'required|exists:categories,id',
            'account_id' => 'required|exists:accounts,id',
            'is_favorite' => 'sometimes|boolean',
            'notes' => 'sometimes|nullable|string'
        ]);

        $validated['user_id'] = auth()->id();

        DB::beginTransaction();
        try {
            $transaction = Transaction::create($validated);
            
            // Update account balance
            // Assuming Account model has helper methods or we do it manually
            // Let's do it manually via Eloquent relationship if possible, or direct update
            $account = $transaction->account;
            if ($transaction->type === 'income') {
                $account->increment('balance', $transaction->amount);
            } else {
                $account->decrement('balance', $transaction->amount);
            }
            
            DB::commit();
            return response()->json($transaction->load(['category', 'account']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction store error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create transaction'], 500);
        }
    }

    /**
     * Update a transaction
     */
    public function update(Request $request, $id)
    {
        $transaction = Transaction::where('user_id', auth()->id())->findOrFail($id);

        $validated = $request->validate([
            'type' => 'sometimes|in:income,expense',
            'amount' => 'sometimes|numeric|min:0.01',
            'description' => 'sometimes|string|max:255',
            'date' => 'sometimes|date',
            'category_id' => 'sometimes|exists:categories,id',
            'account_id' => 'sometimes|exists:accounts,id',
            'is_favorite' => 'sometimes|boolean',
            'notes' => 'sometimes|nullable|string'
        ]);

        DB::beginTransaction();
        try {
            // Reverse old balance change
            $oldAccount = $transaction->account;
            if ($transaction->type === 'income') {
                $oldAccount->decrement('balance', $transaction->amount);
            } else {
                $oldAccount->increment('balance', $transaction->amount);
            }

            $transaction->update($validated);
            
            // Reload to get new relations if changed (e.g. account_id)
            $transaction->refresh();

            // Apply new balance change
            $newAccount = $transaction->account;
            if ($transaction->type === 'income') {
                $newAccount->increment('balance', $transaction->amount);
            } else {
                $newAccount->decrement('balance', $transaction->amount);
            }

            DB::commit();
            return response()->json($transaction->load(['category', 'account']));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction update error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update transaction'], 500);
        }
    }

    /**
     * Delete a transaction
     */
    public function destroy(Request $request, $id)
    {
        $transaction = Transaction::where('user_id', auth()->id())->findOrFail($id);
        
        Log::info('Attempting to delete transaction: ' . $transaction->id);

        DB::beginTransaction();
        try {
            // Reverse balance change
            $account = $transaction->account;
            if ($account) {
                 if ($transaction->type === 'income') {
                    $account->decrement('balance', $transaction->amount);
                } else {
                    $account->increment('balance', $transaction->amount);
                }
            }

            $transaction->delete();
            DB::commit();
            return response()->json(['message' => 'Transaction deleted']);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Transaction deletion failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete transaction: ' . $e->getMessage()], 500);
        }
    }
}
