<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
// OLD ELOQUENT APPROACH - Commented Out
// use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    /**
     * Get all categories for authenticated user
     * NEW: Raw SQL approach with JOINs for transaction/budget counts
     */
    public function index(Request $request)
    {
        try {
            $userId = $request->user()->id;
            
            // Get system categories + user's custom categories
            $categories = DB::select("
                SELECT 
                    c.*,
                    COUNT(DISTINCT t.id) as transaction_count,
                    COUNT(DISTINCT b.id) as budget_count
                FROM categories c
                LEFT JOIN transactions t ON c.id = t.category_id AND t.user_id = ?
                LEFT JOIN budgets b ON c.id = b.category_id AND b.user_id = ?
                WHERE c.user_id IS NULL OR c.user_id = ?
                GROUP BY c.id
                ORDER BY c.is_system DESC, c.name ASC
            ", [$userId, $userId, $userId]);

            return response()->json($categories);
        } catch (\Exception $e) {
            Log::error('Category index error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch categories'], 500);
        }
    }

    /* OLD ELOQUENT VERSION:
    public function index()
    {
        return Category::where('user_id', auth()->id())->get();
    }
    */

    /**
     * Store a new category
     * NEW: Raw SQL with explicit INSERT
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'type' => 'required|in:income,expense',
                'color' => 'required|string|max:7',
                'emoji' => 'nullable|string|max:10'
            ]);

            $userId = $request->user()->id;

            DB::insert("
                INSERT INTO categories 
                (user_id, name, type, color, emoji, is_system, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 0, NOW(), NOW())
            ", [
                $userId,
                $validated['name'],
                $validated['type'],
                $validated['color'],
                $validated['emoji'] ?? null
            ]);

            // Get the inserted category
            $category = DB::select("
                SELECT * FROM categories 
                WHERE user_id = ?
                ORDER BY id DESC
                LIMIT 1
            ", [$userId]);

            return response()->json($category[0] ?? null, 201);
        } catch (\Exception $e) {
            Log::error('Category store error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create category'], 500);
        }
    }

    /* OLD ELOQUENT VERSION:
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7',
            'type' => 'required|in:income,expense',
            'emoji' => 'nullable|string|max:10',
        ]);

        $validated['user_id'] = auth()->id();
        $category = Category::create($validated);

        return response()->json($category, 201);
    }
    */

    /**
     * Show a single category
     * NEW: Raw SQL SELECT with user check
     */
    public function show(Request $request, $id)
    {
        try {
            $userId = $request->user()->id;

            $category = DB::select("
                SELECT * FROM categories 
                WHERE id = ? AND (user_id IS NULL OR user_id = ?)
            ", [$id, $userId]);

            if (empty($category)) {
                return response()->json(['error' => 'Category not found'], 404);
            }

            return response()->json($category[0]);
        } catch (\Exception $e) {
            Log::error('Category show error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch category'], 500);
        }
    }

    /* OLD ELOQUENT VERSION:
    public function show(Category $category)
    {
        return $category;
    }
    */

    /**
     * Update a category
     * NEW: Raw SQL with system category check
     */
    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'type' => 'sometimes|in:income,expense',
                'color' => 'sometimes|string|max:7',
                'emoji' => 'nullable|string|max:10'
            ]);

            $userId = $request->user()->id;

            // Check if category exists and is not system
            $category = DB::select("
                SELECT id, is_system FROM categories 
                WHERE id = ? AND (user_id IS NULL OR user_id = ?)
            ", [$id, $userId]);

            if (empty($category)) {
                return response()->json(['error' => 'Category not found'], 404);
            }

            if ($category[0]->is_system) {
                return response()->json(['error' => 'System categories cannot be modified'], 403);
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
                UPDATE categories 
                SET " . implode(', ', $updates) . "
                WHERE id = ? AND user_id = ?
            ", $params);

            // Get updated category
            $updated = DB::select("SELECT * FROM categories WHERE id = ?", [$id]);

            return response()->json($updated[0] ?? null);
        } catch (\Exception $e) {
            Log::error('Category update error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update category'], 500);
        }
    }

    /* OLD ELOQUENT VERSION:
    public function update(Request $request, Category $category)
    {
        // Prevent editing system categories
        if ($category->is_system) {
            return response()->json([
                'error' => 'System categories cannot be modified'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'color' => 'sometimes|string|max:7',
            'type' => 'sometimes|in:income,expense',
            'emoji' => 'nullable|string|max:10',
        ]);

        $category->update($validated);
        return $category;
    }
    */

    /**
     * Delete a category
     * NEW: Raw SQL with dependency checks
     */
    public function destroy(Request $request, $id)
    {
        try {
            $userId = $request->user()->id;

            // Check if category exists and is not system
            $category = DB::select("
                SELECT id, is_system, name FROM categories 
                WHERE id = ? AND (user_id IS NULL OR user_id = ?)
            ", [$id, $userId]);

            if (empty($category)) {
                return response()->json(['error' => 'Category not found'], 404);
            }

            if ($category[0]->is_system) {
                return response()->json(['error' => 'System categories cannot be deleted'], 403);
            }

            // Check for transactions
            $transactionCount = DB::select("
                SELECT COUNT(*) as count 
                FROM transactions 
                WHERE category_id = ? AND user_id = ?
            ", [$id, $userId]);

            if ($transactionCount[0]->count > 0) {
                return response()->json([
                    'error' => "Cannot delete category. It has {$transactionCount[0]->count} transaction(s) associated with it."
                ], 400);
            }

            // Check for budgets
            $budgetCount = DB::select("
                SELECT COUNT(*) as count 
                FROM budgets 
                WHERE category_id = ? AND user_id = ?
            ", [$id, $userId]);

            if ($budgetCount[0]->count > 0) {
                return response()->json([
                    'error' => "Cannot delete category. It has {$budgetCount[0]->count} budget(s) associated with it."
                ], 400);
            }

            // Delete category
            $deleted = DB::delete("
                DELETE FROM categories 
                WHERE id = ? AND user_id = ?
            ", [$id, $userId]);

            if ($deleted === 0) {
                return response()->json(['error' => 'Category not found or already deleted'], 404);
            }

            return response()->json(['message' => 'Category deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Category delete error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete category'], 500);
        }
    }

    /* OLD ELOQUENT VERSION:
    public function destroy(Category $category)
    {
        // Prevent deleting system categories
        if ($category->is_system) {
            return response()->json([
                'error' => 'System categories cannot be deleted'
            ], 403);
        }

        // Check for transactions using this category
        $transactionCount = $category->transactions()->count();
        if ($transactionCount > 0) {
            return response()->json([
                'error' => "Cannot delete category. It has {$transactionCount} transaction(s) associated with it."
            ], 400);
        }

        // Check for budgets using this category
        $budgetCount = $category->budgets()->count();
        if ($budgetCount > 0) {
            return response()->json([
                'error' => "Cannot delete category. It has {$budgetCount} budget(s) associated with it."
            ], 400);
        }

        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }
    */
}
