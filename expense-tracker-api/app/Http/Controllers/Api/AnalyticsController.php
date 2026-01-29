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
        // Ensure all selected non-aggregated columns are in GROUP BY for PG compatibility
        $categoryBreakdown = Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->whereBetween('date', [$startDate, $endDate])
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
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

        // Monthly trend (last 6 months)
        // This loop-based approach is already cross-compatible as it runs simple queries per month
        $monthlyTrend = collect(range(0, 5))->map(function ($i) use ($userId) {
            $date = now()->subMonths($i);
            $month = $date->format('M');
            $year = $date->year;
            $monthNum = $date->month;

            $income = Transaction::where('user_id', $userId)
                ->where('type', 'income')
                ->whereYear('date', $year)
                ->whereMonth('date', $monthNum)
                ->sum('amount');

            $expense = Transaction::where('user_id', $userId)
                ->where('type', 'expense')
                ->whereYear('date', $year)
                ->whereMonth('date', $monthNum)
                ->sum('amount');

            return [
                'month' => $month,
                'income' => $income,
                'expense' => $expense
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
