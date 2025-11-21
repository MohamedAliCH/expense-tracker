<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function index(Request $request)
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

        // Monthly trend (last 6 months)
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
                'income' => $income,
                'expense' => $expense,
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
