<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BudgetController extends Controller
{
    /* ELOQUENT VERSION (Commented out)
    public function index(Request $request)
    {
        try {
            // Use Eloquent for cross-database compatibility (SQLite/MySQL)
            $budgets = Budget::where('user_id', $request->user()->id)
                ->with('category')
                ->get();

            // Calculate spent amount manually
            $budgets->transform(function ($budget) {
                $spent = \App\Models\Transaction::where('user_id', $budget->user_id)
                    ->where('category_id', $budget->category_id)
                    ->where('type', 'expense')
                    ->whereYear('date', now()->year)
                    ->whereMonth('date', now()->month)
                    ->sum('amount');
                
                $budget->spent = $spent;
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
    */

    /**
     * Get all budgets with spending data
     * RAW SQL VERSION (Active)
     */
    public function index(Request $request)
    {
        try {
            $userId = $request->user()->id;
            
            $budgets = DB::select("
                SELECT 
                    b.id,
                    b.category_id,
                    b.amount,
                    b.period,
                    b.start_date,
                    b.created_at,
                    b.updated_at,
                    c.name as category_name,
                    c.color as category_color,
                    c.emoji as category_emoji,
                    COALESCE(SUM(t.amount), 0) as spent
                FROM budgets b
                LEFT JOIN categories c ON b.category_id = c.id
                LEFT JOIN transactions t ON t.category_id = b.category_id 
                    AND t.user_id = b.user_id 
                    AND t.type = 'expense'
                    AND DATE_FORMAT(t.date, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')
                WHERE b.user_id = ?
                GROUP BY b.id
                ORDER BY b.created_at DESC
            ", [$userId]);

            return response()->json($budgets);
        } catch (\Exception $e) {
            Log::error('Budget index error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch budgets'], 500);
        }
    }

    /* ELOQUENT VERSION (Commented out)
    public function store(Request $request)
    {
        try {
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
        } catch (\Exception $e) {
            Log::error('Budget store error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create budget'], 500);
        }
    }
    */

    /**
     * Store a new budget
     * RAW SQL VERSION (Active)
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'category_id' => 'required|exists:categories,id',
                'amount' => 'required|numeric|min:0.01',
                'period' => 'required|in:weekly,monthly,yearly',
                'start_date' => 'required|date'
            ]);

            $userId = $request->user()->id;

            // Check if budget already exists for this category
            $existing = DB::select("
                SELECT id FROM budgets 
                WHERE user_id = ? AND category_id = ?
            ", [$userId, $validated['category_id']]);

            if (!empty($existing)) {
                return response()->json(['error' => 'Budget already exists for this category'], 400);
            }

            DB::insert("
                INSERT INTO budgets 
                (user_id, category_id, amount, period, start_date, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            ", [
                $userId,
                $validated['category_id'],
                $validated['amount'],
                $validated['period'],
                $validated['start_date']
            ]);

            // Get the inserted budget with category info
            $budget = DB::select("
                SELECT 
                    b.*,
                    c.name as category_name,
                    c.color as category_color,
                    c.emoji as category_emoji,
                    0 as spent
                FROM budgets b
                LEFT JOIN categories c ON b.category_id = c.id
                WHERE b.user_id = ?
                ORDER BY b.id DESC
                LIMIT 1
            ", [$userId]);

            return response()->json($budget[0] ?? null, 201);
        } catch (\Exception $e) {
            Log::error('Budget store error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create budget'], 500);
        }
    }

    /* ELOQUENT VERSION (Commented out)
    public function show(Request $request, $id)
    {
        try {
            $budget = Budget::where('user_id', $request->user()->id)
                ->where('id', $id)
                ->with('category')
                ->first();

            if (!$budget) {
                return response()->json(['error' => 'Budget not found'], 404);
            }

            if ($budget->category) {
                $budget->category_name = $budget->category->name;
                $budget->category_color = $budget->category->color;
                $budget->category_emoji = $budget->category->emoji;
            }

            return response()->json($budget);
        } catch (\Exception $e) {
            Log::error('Budget show error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch budget'], 500);
        }
    }
    */

    /**
     * Show a single budget
     * RAW SQL VERSION (Active)
     */
    public function show(Request $request, $id)
    {
        try {
            $userId = $request->user()->id;

            $budget = DB::select("
                SELECT 
                    b.*,
                    c.name as category_name,
                    c.color as category_color,
                    c.emoji as category_emoji
                FROM budgets b
                LEFT JOIN categories c ON b.category_id = c.id
                WHERE b.id = ? AND b.user_id = ?
            ", [$id, $userId]);

            if (empty($budget)) {
                return response()->json(['error' => 'Budget not found'], 404);
            }

            return response()->json($budget[0]);
        } catch (\Exception $e) {
            Log::error('Budget show error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch budget'], 500);
        }
    }

    /* ELOQUENT VERSION (Commented out)
    public function update(Request $request, $id)
    {
        try {
            $budget = Budget::where('user_id', $request->user()->id)
                ->where('id', $id)
                ->first();

            if (!$budget) {
                return response()->json(['error' => 'Budget not found'], 404);
            }

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
        } catch (\Exception $e) {
            Log::error('Budget update error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update budget'], 500);
        }
    }
    */

    /**
     * Update a budget
     * RAW SQL VERSION (Active)
     */
    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'amount' => 'sometimes|numeric|min:0.01',
                'period' => 'sometimes|in:weekly,monthly,yearly',
                'start_date' => 'sometimes|date'
            ]);

            $userId = $request->user()->id;

            // Check if budget exists
            $exists = DB::select("
                SELECT id FROM budgets 
                WHERE id = ? AND user_id = ?
            ", [$id, $userId]);

            if (empty($exists)) {
                return response()->json(['error' => 'Budget not found'], 404);
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
                UPDATE budgets 
                SET " . implode(', ', $updates) . "
                WHERE id = ? AND user_id = ?
            ", $params);

            // Get updated budget
            $budget = DB::select("
                SELECT 
                    b.*,
                    c.name as category_name,
                    c.color as category_color,
                    c.emoji as category_emoji
                FROM budgets b
                LEFT JOIN categories c ON b.category_id = c.id
                WHERE b.id = ? AND b.user_id = ?
            ", [$id, $userId]);

            return response()->json($budget[0] ?? null);
        } catch (\Exception $e) {
            Log::error('Budget update error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update budget'], 500);
        }
    }

    /* ELOQUENT VERSION (Commented out)
    public function destroy(Request $request, $id)
    {
        try {
            $deleted = Budget::where('user_id', $request->user()->id)
                ->where('id', $id)
                ->delete();

            if ($deleted === 0) {
                return response()->json(['error' => 'Budget not found'], 404);
            }

            return response()->json(['message' => 'Budget deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Budget delete error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete budget'], 500);
        }
    }
    */

    /**
     * Delete a budget
     * RAW SQL VERSION (Active)
     */
    public function destroy(Request $request, $id)
    {
        try {
            $userId = $request->user()->id;

            $deleted = DB::delete("
                DELETE FROM budgets 
                WHERE id = ? AND user_id = ?
            ", [$id, $userId]);

            if ($deleted === 0) {
                return response()->json(['error' => 'Budget not found'], 404);
            }

            return response()->json(['message' => 'Budget deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Budget delete error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete budget'], 500);
        }
    }
}
