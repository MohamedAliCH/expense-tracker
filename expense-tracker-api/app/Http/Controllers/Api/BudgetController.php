<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class BudgetController extends Controller
{
    /**
     * Get all budgets with spending data respecting both period window and start_date
     */
    public function index(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $budgets = Budget::where('user_id', $userId)
                ->with('category')
                ->orderBy('created_at', 'desc')
                ->get();

            $earliestWindow = min(
                now()->startOfYear()->toDateString(),
                now()->startOfWeek()->toDateString()
            );

            $expenses = Transaction::where('user_id', $userId)
                ->where('type', 'expense')
                ->where('date', '>=', $earliestWindow)
                ->get(['category_id', 'date', 'amount']);

            $weekStart = now()->startOfWeek()->toDateString();
            $weekEnd = now()->endOfWeek()->toDateString();
            $monthStart = now()->startOfMonth()->toDateString();
            $monthEnd = now()->endOfMonth()->toDateString();
            $yearStart = now()->startOfYear()->toDateString();
            $yearEnd = now()->endOfYear()->toDateString();

            $budgets->transform(function ($budget) use ($expenses, $weekStart, $weekEnd, $monthStart, $monthEnd, $yearStart, $yearEnd) {
                if ($budget->period === 'yearly') {
                    $periodStart = $yearStart;
                    $periodEnd = $yearEnd;
                } elseif ($budget->period === 'weekly') {
                    $periodStart = $weekStart;
                    $periodEnd = $weekEnd;
                } else {
                    $periodStart = $monthStart;
                    $periodEnd = $monthEnd;
                }

                $budgetStart = $budget->start_date
                    ? Carbon::parse($budget->start_date)->toDateString()
                    : $periodStart;

                $effectiveStart = max($periodStart, $budgetStart);

                $spent = $expenses
                    ->where('category_id', $budget->category_id)
                    ->filter(function ($tx) use ($effectiveStart, $periodEnd) {
                        $txDate = Carbon::parse($tx->date)->toDateString();
                        return $txDate >= $effectiveStart && $txDate <= $periodEnd;
                    })
                    ->sum('amount');

                $budget->spent = round((float) $spent, 2);

                if ($budget->category) {
                    $budget->category_name = $budget->category->name;
                    $budget->category_color = $budget->category->color;
                    $budget->category_emoji = $budget->category->emoji;
                }
                return $budget;
            });

            return response()->json($budgets);
        } catch (\Exception $e) {
            Log::error('Budget index error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch budgets'], 500);
        }
    }

    /**
     * Store a new budget
     */
    public function store(Request $request)
    {
        $limits = $request->user()->getLimits();
        if ($request->user()->budgets()->count() >= $limits['max_budgets']) {
            return response()->json([
                'error' => "You have reached your limit of {$limits['max_budgets']} budgets. Upgrade to Pro for unlimited budgets."
            ], 403);
        }

        $validated = $request->validate([
            'category_id' => [
                'required',
                Rule::exists('categories', 'id')->where(function ($query) use ($request) {
                    $query->where('user_id', $request->user()->id)->orWhereNull('user_id');
                })
            ],
            'amount' => 'required|numeric|min:0.01',
            'period' => 'required|in:weekly,monthly,yearly',
            'start_date' => 'required|date'
        ]);

        $validated['user_id'] = $request->user()->id;

        // Check for existing budget
        $exists = Budget::where('user_id', $validated['user_id'])
            ->where('category_id', $validated['category_id'])
            ->exists();

        if ($exists) {
            return response()->json(['error' => 'Budget already exists for this category'], 400);
        }

        $budget = Budget::create($validated);

        // Load category for response
        $budget->load('category');

        // Add flattened fields for frontend
        if ($budget->category) {
            $budget->category_name = $budget->category->name;
            $budget->category_color = $budget->category->color;
            $budget->category_emoji = $budget->category->emoji;
        }
        $budget->spent = 0;

        return response()->json($budget, 201);
    }

    /**
     * Show a single budget
     */
    public function show(Request $request, string $id)
    {
        $budget = Budget::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->with('category')
            ->firstOrFail();

        if ($budget->category) {
            $budget->category_name = $budget->category->name;
            $budget->category_color = $budget->category->color;
            $budget->category_emoji = $budget->category->emoji;
        }

        return response()->json($budget);
    }

    /**
     * Update a budget
     */
    public function update(Request $request, string $id)
    {
        $budget = Budget::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'amount' => 'sometimes|numeric|min:0.01',
            'period' => 'sometimes|in:weekly,monthly,yearly',
            'start_date' => 'sometimes|date'
        ]);

        $budget->update($validated);

        // Load category for response
        $budget->load('category');

        if ($budget->category) {
            $budget->category_name = $budget->category->name;
            $budget->category_color = $budget->category->color;
            $budget->category_emoji = $budget->category->emoji;
        }

        return response()->json($budget);
    }

    /**
     * Delete a budget
     */
    public function destroy(Request $request, string $id)
    {
        $budget = Budget::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $budget->delete();
        return response()->json(['message' => 'Budget deleted successfully']);
    }
}
