<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function index()
    {
        return Account::where('user_id', auth()->id())->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'balance' => 'required|numeric',
            'type' => 'required|string',
        ]);

        $validated['user_id'] = auth()->id();
        $account = Account::create($validated);

        return response()->json($account, 201);
    }

    public function show(Account $account)
    {
        $this->authorize('view', $account);
        return $account;
    }

    public function update(Request $request, Account $account)
    {
        $this->authorize('update', $account);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'balance' => 'sometimes|numeric',
            'type' => 'sometimes|string',
        ]);

        $account->update($validated);
        return $account;
    }

    public function destroy(Account $account)
    {
        $this->authorize('delete', $account);
        $account->delete();
        return response()->json(['message' => 'Account deleted']);
    }

    public function transfer(Request $request, Account $account)
    {
        // Implement transfer logic if needed
        return response()->json(['message' => 'Transfer not implemented yet'], 501);
    }
}
