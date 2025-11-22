<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
// OLD ELOQUENT APPROACH - Commented Out
// use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BudgetController extends Controller
{
    /**
     * Get all budgets with spending data
     * NEW: Raw SQL with aggregated spending
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

    /* OLD ELOQUENT VERSION:
    public function index()
    {
        return Budget::where('user_id', auth()->id())->with('category')->get();
    }
    */

    /**
     * Store a new budget
     * NEW: Raw SQL with duplicate check
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

    /* OLD ELOQUENT VERSION:
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0',
            'period' => 'required|in:weekly,monthly,yearly',
            'start_date' => 'required|date',
        ]);

        $validated['user_id'] = auth()->id();
        $budget = Budget::create($validated);

        return response()->json($budget->load('category'), 201);
    }
    */

    /**
     * Show a single budget
     * NEW: Raw SQL SELECT
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

    /* OLD ELOQUENT VERSION:
    public function show(Budget $budget)
    {
        return $budget->load('category');
    }
    */

    /**
     * Update a budget
     * NEW: Raw SQL UPDATE
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

    /* OLD ELOQUENT VERSION:
    public function update(Request $request, Budget $budget)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'amount' => 'sometimes|numeric|min:0',
            'period' => 'sometimes|in:weekly,monthly,yearly',
            'start_date' => 'sometimes|date',
        ]);

        $budget->update($validated);
        return $budget->load('category');
    }
    */

    /**
     * Delete a budget
     * NEW: Raw SQL DELETE
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

    /* OLD ELOQUENT VERSION:
    public function destroy(Budget $budget)
    {
        $budget->delete();
        return response()->json(['message' => 'Budget deleted']);
    }
    */
}
