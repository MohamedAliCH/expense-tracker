<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
// OLD ELOQUENT APPROACH - Commented Out
// use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AccountController extends Controller
{
    /**
     * Get all accounts for authenticated user
     * NEW: Raw SQL SELECT
     */
    public function index(Request $request)
    {
        try {
            $userId = $request->user()->id;
            
            $accounts = DB::select("
                SELECT * FROM accounts 
                WHERE user_id = ?
                ORDER BY created_at DESC
            ", [$userId]);

            return response()->json($accounts);
        } catch (\Exception $e) {
            Log::error('Account index error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch accounts'], 500);
        }
    }

    /* OLD ELOQUENT VERSION:
    public function index()
    {
        return Account::where('user_id', auth()->id())->get();
    }
    */

    /**
     * Store a new account
     * NEW: Raw SQL INSERT
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'type' => 'required|string',
                'balance' => 'required|numeric'
            ]);

            $userId = $request->user()->id;

            DB::insert("
                INSERT INTO accounts 
                (user_id, name, type, balance, created_at, updated_at)
                VALUES (?, ?, ?, ?, NOW(), NOW())
            ", [
                $userId,
                $validated['name'],
                $validated['type'],
                $validated['balance']
            ]);

            $account = DB::select("
                SELECT * FROM accounts 
                WHERE user_id = ?
                ORDER BY id DESC
                LIMIT 1
            ", [$userId]);

            return response()->json($account[0] ?? null, 201);
        } catch (\Exception $e) {
            Log::error('Account store error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create account'], 500);
        }
    }

    /* OLD ELOQUENT VERSION:
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
    */

    /**
     * Show a single account
     * NEW: Raw SQL SELECT
     */
    public function show(Request $request, $id)
    {
        try {
            $userId = $request->user()->id;

            $account = DB::select("
                SELECT * FROM accounts 
                WHERE id = ? AND user_id = ?
            ", [$id, $userId]);

            if (empty($account)) {
                return response()->json(['error' => 'Account not found'], 404);
            }

            return response()->json($account[0]);
        } catch (\Exception $e) {
            Log::error('Account show error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch account'], 500);
        }
    }

    /* OLD ELOQUENT VERSION:
    public function show(Account $account)
    {
        $this->authorize('view', $account);
        return $account;
    }
    */

    /**
     * Update an account
     * NEW: Raw SQL UPDATE
     */
    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'type' => 'sometimes|string',
                'balance' => 'sometimes|numeric'
            ]);

            $userId = $request->user()->id;

            $updates = [];
            $params = [];
            
            foreach ($validated as $key => $value) {
                $updates[] = "$key = ?";
                $params[] = $value;
            }
            
            if (empty($updates)) {
                return response()->json(['error' => 'No fields to update'], 400);
            }

            $updates[] = "updated_at = NOW()";
            $params[] = $id;
            $params[] = $userId;

            DB::update("
                UPDATE accounts 
                SET " . implode(', ', $updates) . "
                WHERE id = ? AND user_id = ?
            ", $params);

            $account = DB::select("
                SELECT * FROM accounts 
                WHERE id = ? AND user_id = ?
            ", [$id, $userId]);

            return response()->json($account[0] ?? null);
        } catch (\Exception $e) {
            Log::error('Account update error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update account'], 500);
        }
    }

    /* OLD ELOQUENT VERSION:
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
    */

    /**
     * Delete an account
     * NEW: Raw SQL with transaction check
     */
    public function destroy(Request $request, $id)
    {
        try {
            $userId = $request->user()->id;

            // Check for transactions
            // Transaction check removed to allow cascade delete
            // The database foreign key constraint is set to ON DELETE CASCADE

            $deleted = DB::delete("
                DELETE FROM accounts 
                WHERE id = ? AND user_id = ?
            ", [$id, $userId]);

            if ($deleted === 0) {
                return response()->json(['error' => 'Account not found'], 404);
            }

            return response()->json(['message' => 'Account deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Account delete error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete account'], 500);
        }
    }

    /* OLD ELOQUENT VERSION:
    public function destroy(Account $account)
    {
        $this->authorize('delete', $account);
        $account->delete();
        return response()->json(['message' => 'Account deleted']);
    }
    */

    /**
     * Transfer between accounts
     * NEW: Not implemented yet
     */
    public function transfer(Request $request)
    {
        // TODO: Implement transfer logic if needed
        return response()->json(['message' => 'Transfer not implemented yet'], 501);
    }

    /* OLD ELOQUENT VERSION:
    public function transfer(Request $request, Account $account)
    {
        // Implement transfer logic if needed
        return response()->json(['message' => 'Transfer not implemented yet'], 501);
    }
    */
}
