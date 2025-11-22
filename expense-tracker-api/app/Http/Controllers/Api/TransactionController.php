<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
// OLD ELOQUENT APPROACH - Commented Out
// use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TransactionController extends Controller
{
    /**
     * Get all transactions for authenticated user with filters
     * NEW: Raw SQL approach with explicit JOINs
     */
    public function index(Request $request)
    {
        try {
            $userId = $request->user()->id;
            
            // Base query with JOINs
            $sql = "
                SELECT 
                    t.id,
                    t.type,
                    t.amount,
                    t.description,
                    t.date,
                    t.category_id,
                    t.account_id,
                    t.created_at,
                    t.updated_at,
                    c.name as category_name,
                    c.color as category_color,
                    c.emoji as category_emoji,
                    a.name as account_name
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                LEFT JOIN accounts a ON t.account_id = a.id
                WHERE t.user_id = ?
            ";
            
            $params = [$userId];
            
            // Apply filters
            if ($request->has('type')) {
                $sql .= " AND t.type = ?";
                $params[] = $request->type;
            }
            
            if ($request->has('category_id')) {
                $sql .= " AND t.category_id = ?";
                $params[] = $request->category_id;
            }
            
            if ($request->has('start_date') && $request->has('end_date')) {
                $sql .= " AND t.date BETWEEN ? AND ?";
                $params[] = $request->start_date;
                $params[] = $request->end_date;
            }
            
            $sql .= " ORDER BY t.date DESC, t.created_at DESC";

            $transactions = DB::select($sql, $params);

            return response()->json($transactions);
        } catch (\Exception $e) {
            Log::error('Transaction index error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch transactions'], 500);
        }
    }

    /* OLD ELOQUENT VERSION:
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
    */

    /**
     * Store a new transaction
     * NEW: Raw SQL with manual balance update
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'type' => 'required|in:income,expense',
                'amount' => 'required|numeric|min:0.01',
                'category_id' => 'required|exists:categories,id',
                'account_id' => 'required|exists:accounts,id',
                'description' => 'required|string|max:255',
                'date' => 'required|date'
            ]);

            $userId = $request->user()->id;

            DB::beginTransaction();

            // Insert transaction
            DB::insert("
                INSERT INTO transactions 
                (user_id, type, amount, category_id, account_id, description, date, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ", [
                $userId,
                $validated['type'],
                $validated['amount'],
                $validated['category_id'],
                $validated['account_id'],
                $validated['description'],
                $validated['date']
            ]);

            // Update account balance
            if ($validated['type'] === 'income') {
                DB::update("
                    UPDATE accounts 
                    SET balance = balance + ? 
                    WHERE id = ? AND user_id = ?
                ", [$validated['amount'], $validated['account_id'], $userId]);
            } else {
                DB::update("
                    UPDATE accounts 
                    SET balance = balance - ? 
                    WHERE id = ? AND user_id = ?
                ", [$validated['amount'], $validated['account_id'], $userId]);
            }

            // Get the inserted transaction
            $transaction = DB::select("
                SELECT 
                    t.*,
                    c.name as category_name,
                    c.color as category_color,
                    c.emoji as category_emoji,
                    a.name as account_name
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                LEFT JOIN accounts a ON t.account_id = a.id
                WHERE t.user_id = ?
                ORDER BY t.id DESC
                LIMIT 1
            ", [$userId]);

            DB::commit();
            return response()->json($transaction[0] ?? null, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction store error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create transaction'], 500);
        }
    }

    /* OLD ELOQUENT VERSION:
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
    */

    /**
     * Update a transaction
     * NEW: Raw SQL with balance reversal and re-application
     */
    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'type' => 'sometimes|in:income,expense',
                'amount' => 'sometimes|numeric|min:0.01',
                'category_id' => 'sometimes|exists:categories,id',
                'account_id' => 'sometimes|exists:accounts,id',
                'description' => 'sometimes|string|max:255',
                'date' => 'sometimes|date'
            ]);

            $userId = $request->user()->id;

            DB::beginTransaction();

            // Get old transaction data
            $oldTransaction = DB::select("
                SELECT * FROM transactions 
                WHERE id = ? AND user_id = ?
            ", [$id, $userId]);

            if (empty($oldTransaction)) {
                DB::rollBack();
                return response()->json(['error' => 'Transaction not found'], 404);
            }

            $old = $oldTransaction[0];

            // Reverse old balance change
            if ($old->type === 'income') {
                DB::update("UPDATE accounts SET balance = balance - ? WHERE id = ?", [$old->amount, $old->account_id]);
            } else {
                DB::update("UPDATE accounts SET balance = balance + ? WHERE id = ?", [$old->amount, $old->account_id]);
            }

            // Build dynamic update query
            $updates = [];
            $params = [];
            
            foreach ($validated as $key => $value) {
                $updates[] = "$key = ?";
                $params[] = $value;
            }
            
            $updates[] = "updated_at = NOW()";
            $params[] = $id;
            $params[] = $userId;

            DB::update("
                UPDATE transactions 
                SET " . implode(', ', $updates) . "
                WHERE id = ? AND user_id = ?
            ", $params);

            // Get updated transaction
            $newTransaction = DB::select("
                SELECT * FROM transactions 
                WHERE id = ? AND user_id = ?
            ", [$id, $userId]);

            $new = $newTransaction[0];

            // Apply new balance change
            if ($new->type === 'income') {
                DB::update("UPDATE accounts SET balance = balance + ? WHERE id = ?", [$new->amount, $new->account_id]);
            } else {
                DB::update("UPDATE accounts SET balance = balance - ? WHERE id = ?", [$new->amount, $new->account_id]);
            }

            // Get final transaction with relations
            $transaction = DB::select("
                SELECT 
                    t.*,
                    c.name as category_name,
                    c.color as category_color,
                    c.emoji as category_emoji,
                    a.name as account_name
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                LEFT JOIN accounts a ON t.account_id = a.id
                WHERE t.id = ? AND t.user_id = ?
            ", [$id, $userId]);

            DB::commit();
            return response()->json($transaction[0] ?? null);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction update error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update transaction'], 500);
        }
    }

    /* OLD ELOQUENT VERSION:
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
    */

    /**
     * Delete a transaction
     * NEW: Raw SQL with balance reversal
     */
    public function destroy(Request $request, $id)
    {
        try {
            $userId = $request->user()->id;

            Log::info('Attempting to delete transaction: ' . $id);

            DB::beginTransaction();

            // Get transaction data before deleting
            $transaction = DB::select("
                SELECT * FROM transactions 
                WHERE id = ? AND user_id = ?
            ", [$id, $userId]);

            if (empty($transaction)) {
                DB::rollBack();
                return response()->json(['error' => 'Transaction not found'], 404);
            }

            $trans = $transaction[0];

            // Reverse balance change
            if ($trans->type === 'income') {
                DB::update("
                    UPDATE accounts 
                    SET balance = balance - ? 
                    WHERE id = ?
                ", [$trans->amount, $trans->account_id]);
            } else {
                DB::update("
                    UPDATE accounts 
                    SET balance = balance + ? 
                    WHERE id = ?
                ", [$trans->amount, $trans->account_id]);
            }

            // Delete transaction
            $deleted = DB::delete("
                DELETE FROM transactions 
                WHERE id = ? AND user_id = ?
            ", [$id, $userId]);

            if ($deleted === 0) {
                DB::rollBack();
                return response()->json(['error' => 'Transaction not found'], 404);
            }

            DB::commit();
            return response()->json(['message' => 'Transaction deleted successfully']);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Transaction deletion failed: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json(['error' => 'Failed to delete transaction'], 500);
        }
    }

    /* OLD ELOQUENT VERSION:
    public function destroy(Transaction $transaction)
    {
        Log::info('Attempting to delete transaction: ' . $transaction->id);

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
            Log::error('Transaction deletion failed: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json(['error' => 'Failed to delete transaction: ' . $e->getMessage()], 500);
        }
    }
    */

    /**
     * Get analytics/statistics
     * NEW: Raw SQL for analytics queries
     */
    public function analytics(Request $request)
    {
        try {
            $userId = $request->user()->id;
            $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
            $endDate = $request->input('end_date', now()->endOfMonth()->format('Y-m-d'));

            // Total income and expenses
            $totals = DB::select("
                SELECT 
                    type,
                    SUM(amount) as total,
                    COUNT(*) as count
                FROM transactions
                WHERE user_id = ? 
                    AND date BETWEEN ? AND ?
                GROUP BY type
            ", [$userId, $startDate, $endDate]);

            $income = 0;
            $expense = 0;
            $incomeCount = 0;
            $expenseCount = 0;

            foreach ($totals as $row) {
                if ($row->type === 'income') {
                    $income = (float) $row->total;
                    $incomeCount = $row->count;
                } else {
                    $expense = (float) $row->total;
                    $expenseCount = $row->count;
                }
            }

            // Spending by category
            $categoryBreakdown = DB::select("
                SELECT 
                    c.id,
                    c.name,
                    c.color,
                    SUM(t.amount) as total,
                    COUNT(*) as count
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                WHERE t.user_id = ? 
                    AND t.type = 'expense'
                    AND t.date BETWEEN ? AND ?
                GROUP BY c.id, c.name, c.color
                ORDER BY total DESC
            ", [$userId, $startDate, $endDate]);

            // Daily spending trend (last 30 days)
            $dailyTrend = DB::select("
                SELECT 
                    DATE(date) as date, 
                    SUM(amount) as total
                FROM transactions
                WHERE user_id = ? 
                    AND type = 'expense'
                    AND date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY DATE(date)
                ORDER BY date
            ", [$userId]);

            return response()->json([
                'summary' => [
                    'income' => $income,
                    'expense' => $expense,
                    'balance' => $income - $expense,
                    'income_count' => $incomeCount,
                    'expense_count' => $expenseCount
                ],
                'category_breakdown' => $categoryBreakdown,
                'daily_trend' => $dailyTrend
            ]);
        } catch (\Exception $e) {
            Log::error('Analytics error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch analytics'], 500);
        }
    }

    /* OLD ELOQUENT VERSION:
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
    */
}
