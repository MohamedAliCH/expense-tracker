<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth()->id();
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());

        // Total income and expenses
        // This query works in PG and MySQL
        $totals = Transaction::where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate])
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
        // Explicitly qualify transactions table columns to prevent PostgreSQL ambiguous column error
        $categoryBreakdown = Transaction::join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $userId)
            ->where('transactions.type', 'expense')
            ->whereBetween('transactions.date', [$startDate, $endDate])
            ->selectRaw('
                categories.id,
                categories.name,
                categories.color,
                SUM(transactions.amount) as total,
                COUNT(*) as count
            ')
            ->groupBy(['categories.id', 'categories.name', 'categories.color'])
            ->orderByDesc('total')
            ->get();

        // Daily spending trend (last 30 days)
        // 'date' is a keyword, so we cast it for safety and compatibility
        // PG requires the expression in GROUP BY or the column itself if it is a column
        // Assuming 'date' column is of type DATE or TIMESTAMP
        $dailyTrend = Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->where('date', '>=', now()->subDays(30))
            ->selectRaw('CAST(date AS DATE) as date_val, SUM(amount) as total')
            ->groupByRaw('CAST(date AS DATE)')
            ->orderBy('date_val')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date_val,
                    'total' => $item->total
                ];
            });

        // Monthly trend (last 6 months) - Optimized single SQL query
        $startDate6M = now()->subMonths(5)->startOfMonth();
        $rawMonthly = Transaction::where('user_id', $userId)
            ->where('date', '>=', $startDate6M)
            ->selectRaw("
                EXTRACT(YEAR FROM date)::integer as yr,
                EXTRACT(MONTH FROM date)::integer as mo,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
            ")
            ->groupByRaw("EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)")
            ->get()
            ->keyBy(function ($row) {
                return $row->yr . '-' . $row->mo;
            });

        $monthlyTrend = collect(range(0, 5))->map(function ($i) use ($rawMonthly) {
            $date = now()->subMonths($i);
            $key = $date->year . '-' . $date->month;
            $row = $rawMonthly->get($key);

            return [
                'month' => $date->format('M'),
                'income' => (float) ($row?->income ?? 0),
                'expense' => (float) ($row?->expense ?? 0),
            ];
        })->reverse()->values();

        return response()->json([
            'summary' => [
                'income' => (float) $income,
                'expense' => (float) $expense,
                'balance' => $income - $expense,
                'income_count' => $totals->get('income')?->count ?? 0,
                'expense_count' => $totals->get('expense')?->count ?? 0
            ],
            'category_breakdown' => $categoryBreakdown,
            'daily_trend' => $dailyTrend,
            'monthly_trend' => $monthlyTrend
        ]);
    }
}
