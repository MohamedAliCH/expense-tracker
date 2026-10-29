<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Get all categories for authenticated user
     */
    public function index(Request $request)
    {
        return Category::where('user_id', auth()->id())
            ->orWhereNull('user_id')
            ->orderBy('is_system', 'desc')
            ->orderBy('name', 'asc')
            ->get();
    }

    /**
     * Store a new category
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $limits = $user->getLimits();
        $customCount = Category::where('user_id', $user->id)->count();
        if ($customCount >= $limits['max_categories']) {
            return response()->json([
                'error' => "You have reached your limit of {$limits['max_categories']} custom categories. Upgrade to Pro for unlimited categories."
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
            'color' => 'required|string|max:7',
            'emoji' => 'nullable|string|max:50'
        ]);

        $validated['user_id'] = auth()->id();
        $validated['is_system'] = false;

        $category = Category::create($validated);

        return response()->json($category, 201);
    }

    /**
     * Show a single category
     */
    public function show(Request $request, $id)
    {
        $category = Category::where('id', $id)
            ->where(function ($query) {
                $query->where('user_id', auth()->id())
                    ->orWhereNull('user_id');
            })
            ->firstOrFail();

        return response()->json($category);
    }

    /**
     * Update a category
     */
    public function update(Request $request, $id)
    {
        $category = Category::where('id', $id)
            ->where(function ($query) {
                $query->where('user_id', auth()->id())
                    ->orWhereNull('user_id');
            })
            ->firstOrFail();

        if ($category->is_system) {
            return response()->json([
                'error' => 'System categories cannot be modified'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:income,expense',
            'color' => 'sometimes|string|max:7',
            'emoji' => 'nullable|string|max:50',
        ]);

        $category->update($validated);
        return response()->json($category);
    }

    /**
     * Delete a category
     */
    public function destroy(Request $request, $id)
    {
        $category = Category::where('id', $id)
            ->where(function ($query) {
                $query->where('user_id', auth()->id())
                    ->orWhereNull('user_id');
            })
            ->firstOrFail();

        if ($category->is_system) {
            return response()->json([
                'error' => 'System categories cannot be deleted'
            ], 403);
        }

        if ($category->transactions()->count() > 0) {
            return response()->json([
                'error' => "Cannot delete category. It has associated transactions."
            ], 400);
        }

        if ($category->budgets()->count() > 0) {
            return response()->json([
                'error' => "Cannot delete category. It has associated budgets."
            ], 400);
        }

        $category->delete();
        return response()->json(['message' => 'Category deleted successfully']);
    }
}
