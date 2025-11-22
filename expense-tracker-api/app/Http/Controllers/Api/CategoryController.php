<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return Category::where('user_id', auth()->id())->get();
    }

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

    public function show(Category $category)
    {
        return $category;
    }

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
}
