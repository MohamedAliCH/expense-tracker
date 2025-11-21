<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function index()
    {
        return Budget::where('user_id', auth()->id())->with('category')->get();
    }

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

    public function show(Budget $budget)
    {
        $this->authorize('view', $budget);
        return $budget->load('category');
    }

    public function update(Request $request, Budget $budget)
    {
        $this->authorize('update', $budget);
        
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'amount' => 'sometimes|numeric|min:0',
            'period' => 'sometimes|in:weekly,monthly,yearly',
            'start_date' => 'sometimes|date',
        ]);

        $budget->update($validated);
        return $budget->load('category');
    }

    public function destroy(Budget $budget)
    {
        $this->authorize('delete', $budget);
        $budget->delete();
        return response()->json(['message' => 'Budget deleted']);
    }
}
