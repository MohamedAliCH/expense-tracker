<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\AccountLedgerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class TransactionController extends Controller
{
    /**
     * Get all transactions for authenticated user with filters
     */
    public function index(Request $request)
    {
        $query = Transaction::with(['category', 'account'])
            ->where('user_id', $request->user()->id)
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc');

        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->has('start_date') && $request->has('end_date') && $request->start_date && $request->end_date) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        } elseif ($request->has('start_date') && $request->start_date) {
            $query->where('date', '>=', $request->start_date);
        } elseif ($request->has('end_date') && $request->end_date) {
            $query->where('date', '<=', $request->end_date);
        }

        if ($request->has('category_id') && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('account_id') && $request->account_id !== 'all') {
            $query->where('account_id', $request->account_id);
        }

        if ($request->has('search') && trim($request->search) !== '') {
            $search = '%' . trim($request->search) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', $search)
                  ->orWhere('notes', 'like', $search);
            });
        }

        $perPage = min(max((int) $request->input('per_page', 500), 1), 1000);

        return response()->json($query->paginate($perPage));
    }

    /**
     * Show a single transaction scoped to the authenticated user
     */
    public function show(Request $request, string $id)
    {
        $transaction = Transaction::with(['category', 'account'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json($transaction);
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
            'category_id' => [
                'required',
                Rule::exists('categories', 'id')->where(function ($query) use ($request) {
                    $query->where('user_id', $request->user()->id)->orWhereNull('user_id');
                })
            ],
            'account_id' => [
                'required',
                Rule::exists('accounts', 'id')->where('user_id', $request->user()->id)
            ],
            'is_favorite' => 'sometimes|boolean',
            'notes' => 'sometimes|nullable|string',
            'is_recurring' => 'sometimes|boolean',
            'recurring_frequency' => 'sometimes|string|in:weekly,monthly,yearly',
            'receipt' => 'sometimes|nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:10240',
        ]);

        $validated['user_id'] = $request->user()->id;

        if ($request->hasFile('receipt')) {
            $path = $request->file('receipt')->store('receipts', 'public');
            $validated['receipt_path'] = $path;
        }

        DB::beginTransaction();
        try {
            $transaction = Transaction::create($validated);
            AccountLedgerService::applyTransaction($transaction);

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
    public function update(Request $request, string $id)
    {
        $transaction = Transaction::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'type' => 'sometimes|in:income,expense',
            'amount' => 'sometimes|numeric|min:0.01',
            'description' => 'sometimes|string|max:255',
            'date' => 'sometimes|date',
            'category_id' => [
                'sometimes',
                Rule::exists('categories', 'id')->where(function ($query) use ($request) {
                    $query->where('user_id', $request->user()->id)->orWhereNull('user_id');
                })
            ],
            'account_id' => [
                'sometimes',
                Rule::exists('accounts', 'id')->where('user_id', $request->user()->id)
            ],
            'is_favorite' => 'sometimes|boolean',
            'notes' => 'sometimes|nullable|string',
            'is_recurring' => 'sometimes|boolean',
            'recurring_frequency' => 'sometimes|string|in:weekly,monthly,yearly',
            'receipt' => 'sometimes|nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:10240',
        ]);

        if ($request->hasFile('receipt')) {
            // Delete old receipt file if present
            if ($transaction->receipt_path && Storage::disk('public')->exists($transaction->receipt_path)) {
                Storage::disk('public')->delete($transaction->receipt_path);
            }
            $path = $request->file('receipt')->store('receipts', 'public');
            $validated['receipt_path'] = $path;
        }

        DB::beginTransaction();
        try {
            // Reverse old balance change
            AccountLedgerService::applyTransaction($transaction, true);

            $transaction->update($validated);
            $transaction->refresh();

            // Apply new balance change
            AccountLedgerService::applyTransaction($transaction);

            DB::commit();
            return response()->json($transaction->load(['category', 'account']));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction update error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update transaction'], 500);
        }
    }

    /**
     * Upload or replace a receipt for an existing transaction
     */
    public function uploadReceipt(Request $request, string $id)
    {
        $transaction = Transaction::where('user_id', $request->user()->id)->findOrFail($id);

        $request->validate([
            'receipt' => 'required|file|mimes:jpeg,png,jpg,webp,pdf|max:10240',
        ]);

        if ($transaction->receipt_path && Storage::disk('public')->exists($transaction->receipt_path)) {
            Storage::disk('public')->delete($transaction->receipt_path);
        }

        $path = $request->file('receipt')->store('receipts', 'public');
        $transaction->update(['receipt_path' => $path]);

        return response()->json([
            'message' => 'Receipt uploaded successfully',
            'receipt_path' => $path,
            'receipt_url' => $transaction->receipt_url,
            'transaction' => $transaction->fresh(['category', 'account']),
        ]);
    }

    /**
     * Bulk import transactions from parsed CSV data
     */
    public function import(Request $request)
    {
        $validated = $request->validate([
            'transactions' => 'required|array|min:1|max:1000',
            'transactions.*.account_id' => [
                'required',
                Rule::exists('accounts', 'id')->where('user_id', $request->user()->id),
            ],
            'transactions.*.category_id' => [
                'required',
                Rule::exists('categories', 'id')->where(function ($query) use ($request) {
                    $query->where('user_id', $request->user()->id)->orWhereNull('user_id');
                }),
            ],
            'transactions.*.amount' => 'required|numeric|min:0.01',
            'transactions.*.type' => 'required|in:income,expense',
            'transactions.*.description' => 'required|string|max:255',
            'transactions.*.date' => 'required|date',
            'transactions.*.notes' => 'nullable|string',
        ]);

        $result = AccountLedgerService::importTransactions($request->user(), $validated['transactions']);

        return response()->json([
            'message' => "Successfully imported {$result['imported_count']} transactions",
            'imported_count' => $result['imported_count'],
        ]);
    }

    /**
     * Process due recurring transactions on demand
     */
    public function processRecurring(Request $request)
    {
        $processed = AccountLedgerService::processRecurringForUser($request->user());

        return response()->json([
            'message' => "Processed {$processed} recurring transactions",
            'processed_count' => $processed,
        ]);
    }

    /**
     * Delete a transaction
     */
    public function destroy(Request $request, string $id)
    {
        $transaction = Transaction::where('user_id', $request->user()->id)->findOrFail($id);

        DB::beginTransaction();
        try {
            // Delete receipt file if present
            if ($transaction->receipt_path && Storage::disk('public')->exists($transaction->receipt_path)) {
                Storage::disk('public')->delete($transaction->receipt_path);
            }

            // Reverse balance change before deletion
            AccountLedgerService::applyTransaction($transaction, true);

            $transaction->delete();
            DB::commit();
            return response()->json(['message' => 'Transaction deleted']);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Transaction deletion failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete transaction'], 500);
        }
    }
}
