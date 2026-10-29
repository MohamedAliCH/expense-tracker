<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AccountController extends Controller
{
    /**
     * Normalize legacy or capitalized account type strings into canonical types.
     */
    private function normalizeType(?string $type): ?string
    {
        if ($type === null) {
            return null;
        }
        $normalized = strtolower(trim(str_replace([' ', '-'], '_', $type)));
        if (in_array($normalized, ['savings', 'cash'], true)) {
            return 'wallet';
        }
        if ($normalized === 'checking') {
            return 'bank';
        }
        return $normalized;
    }

    /**
     * Get all accounts for authenticated user
     */
    public function index(Request $request)
    {
        try {
            return response()->json(
                Account::where('user_id', $request->user()->id)
                    ->orderBy('created_at', 'desc')
                    ->get()
            );
        } catch (\Exception $e) {
            Log::error('Account index error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch accounts'], 500);
        }
    }

    /**
     * Store a new account
     */
    public function store(Request $request)
    {
        $limits = $request->user()->getLimits();
        if ($request->user()->accounts()->count() >= $limits['max_accounts']) {
            return response()->json([
                'error' => "You have reached your limit of {$limits['max_accounts']} accounts. Upgrade to Pro for unlimited accounts."
            ], 403);
        }

        if ($request->has('type')) {
            $request->merge(['type' => $this->normalizeType($request->input('type'))]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:wallet,bank,credit_card',
            'balance' => 'required|numeric'
        ]);

        try {
            $validated['user_id'] = $request->user()->id;
            $account = Account::create($validated);

            return response()->json($account, 201);
        } catch (\Exception $e) {
            Log::error('Account store error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create account'], 500);
        }
    }

    /**
     * Show a single account
     */
    public function show(Request $request, string $id)
    {
        $account = Account::where('user_id', $request->user()->id)->findOrFail($id);
        return response()->json($account);
    }

    /**
     * Update an account (metadata only; balance is strictly ledger-controlled)
     */
    public function update(Request $request, string $id)
    {
        $account = Account::where('user_id', $request->user()->id)->findOrFail($id);

        if ($request->has('type')) {
            $request->merge(['type' => $this->normalizeType($request->input('type'))]);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|in:wallet,bank,credit_card',
        ]);

        try {
            $account->update($validated);
            return response()->json($account);
        } catch (\Exception $e) {
            Log::error('Account update error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update account'], 500);
        }
    }

    /**
     * Delete an account
     */
    public function destroy(Request $request, string $id)
    {
        $account = Account::where('user_id', $request->user()->id)->findOrFail($id);

        // Prevent accidental deletion if account has active ledger transactions
        if ($account->transactions()->count() > 0) {
            return response()->json([
                'error' => 'Cannot delete account with existing transactions. Please delete or reassign its transactions first.'
            ], 400);
        }

        try {
            $account->delete();
            return response()->json(['message' => 'Account deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Account delete error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete account'], 500);
        }
    }

    /**
     * Transfer between accounts
     */
    public function transfer(Request $request)
    {
        $validated = $request->validate([
            'from_account_id' => 'required|integer',
            'to_account_id' => 'required|integer|different:from_account_id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:255',
            'date' => 'nullable|date',
        ]);

        $result = \App\Services\AccountLedgerService::transfer(
            $request->user(),
            (int) $validated['from_account_id'],
            (int) $validated['to_account_id'],
            (float) $validated['amount'],
            $validated['description'] ?? null,
            $validated['date'] ?? null
        );

        return response()->json([
            'message' => 'Transfer completed successfully',
            'from_account' => $result['from_account'],
            'to_account' => $result['to_account'],
            'transactions' => $result['transactions'],
        ]);
    }
}
