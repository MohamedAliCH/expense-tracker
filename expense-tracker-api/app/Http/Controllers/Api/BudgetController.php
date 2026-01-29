<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BudgetController extends Controller
{
    /**
     * Get all budgets with spending data
     */
    public function index(Request $request)
    {
        try {
            $budgets = Budget::where('user_id', $request->user()->id)
                ->with('category')
                ->orderBy('created_at', 'desc')
                ->get();

            // Calculate spent amount
            $budgets->transform(function ($budget) {
                // Determine date range for "current period" specific to this budget
                // For simplicity assuming monthly budgets track current month
                // You can expand this logic based on $budget->period
                
                $spent = Transaction::where('user_id', $budget->user_id)
                    ->where('category_id', $budget->category_id)
                    ->where('type', 'expense')
                    ->whereYear('date', now()->year)
                    ->whereMonth('date', now()->month)
                    ->sum('amount');
                
                $budget->spent = (float) $spent;
                
                // Add flattened category fields for frontend compatibility
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
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
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
    public function show(Request $request, $id)
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
    public function update(Request $request, $id)
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
    public function destroy(Request $request, $id)
    {
        $budget = Budget::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $budget->delete();
        return response()->json(['message' => 'Budget deleted successfully']);
    }
}
