<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    // Get all transactions with filters
    public function index(Request $request)
    {
        $query = Transaction::with(['category', 'account'])
            ->where('user_id', auth()->id())
            ->orderBy('date', 'desc');

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->dateRange($request->start_date, $request->end_date);
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        return response()->json($query->get());
    }

    // Create new transaction
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'date' => 'required|date',
            'category_id' => 'required|exists:categories,id',
            'account_id' => 'required|exists:accounts,id'
        ]);

        $validated['user_id'] = auth()->id();

        DB::beginTransaction();
        try {
            $transaction = Transaction::create($validated);
            
            // Update account balance
            $transaction->account->updateBalance($transaction);
            
            DB::commit();
            return response()->json($transaction->load(['category', 'account']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create transaction'], 500);
        }
    }

    // Update transaction
    public function update(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'type' => 'sometimes|in:income,expense',
            'amount' => 'sometimes|numeric|min:0.01',
            'description' => 'sometimes|string|max:255',
            'date' => 'sometimes|date',
            'category_id' => 'sometimes|exists:categories,id',
            'account_id' => 'sometimes|exists:accounts,id'
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

            // Apply new balance change
            $transaction->account->updateBalance($transaction);

            DB::commit();
            return response()->json($transaction->load(['category', 'account']));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to update transaction'], 500);
        }
    }

    // Delete transaction
    public function destroy(Transaction $transaction)
    {
        \Illuminate\Support\Facades\Log::info('Attempting to delete transaction: ' . $transaction->id);

        DB::beginTransaction();
        try {
            // Reverse balance change
            if ($transaction->account) {
                if ($transaction->type === 'income') {
                    $transaction->account->decrement('balance', $transaction->amount);
                } else {
                    $transaction->account->increment('balance', $transaction->amount);
                }
            }

            $transaction->delete();
            DB::commit();
            return response()->json(['message' => 'Transaction deleted']);
        } catch (\Throwable $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Transaction deletion failed: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json(['error' => 'Failed to delete transaction: ' . $e->getMessage()], 500);
        }
    }

    // Get analytics/statistics
    public function analytics(Request $request)
    {
        $userId = auth()->id();
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());

        // Total income and expenses
        $totals = Transaction::where('user_id', $userId)
            ->dateRange($startDate, $endDate)
            ->selectRaw('
                type,
                SUM(amount) as total,
                COUNT(*) as count
            ')
            ->groupBy('type')
            ->get()
            ->keyBy('type');

        $income = $totals->get('income')?->total ?? 0;
        $expense = $totals->get('expense')?->total ?? 0;

        // Spending by category
        $categoryBreakdown = Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->dateRange($startDate, $endDate)
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->selectRaw('
                categories.id,
                categories.name,
                categories.color,
                SUM(transactions.amount) as total,
                COUNT(*) as count
            ')
            ->groupBy('categories.id', 'categories.name', 'categories.color')
            ->orderByDesc('total')
            ->get();

        // Daily spending trend (last 30 days)
        $dailyTrend = Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->where('date', '>=', now()->subDays(30))
            ->selectRaw('DATE(date) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'summary' => [
                'income' => $income,
                'expense' => $expense,
                'balance' => $income - $expense,
                'income_count' => $totals->get('income')?->count ?? 0,
                'expense_count' => $totals->get('expense')?->count ?? 0
            ],
            'category_breakdown' => $categoryBreakdown,
            'daily_trend' => $dailyTrend
        ]);
    }
}
