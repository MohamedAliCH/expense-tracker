<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionLedgerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Account $account;
    private Category $expenseCategory;
    private Category $incomeCategory;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->account = Account::create([
            'user_id' => $this->user->id,
            'name' => 'Primary Checking',
            'type' => 'bank',
            'balance' => 500.00,
        ]);

        $this->expenseCategory = Category::create([
            'user_id' => $this->user->id,
            'name' => 'Groceries',
            'type' => 'expense',
            'color' => '#1f7a8c',
            'is_system' => false,
        ]);

        $this->incomeCategory = Category::create([
            'user_id' => $this->user->id,
            'name' => 'Consulting',
            'type' => 'income',
            'color' => '#2a9d8f',
            'is_system' => false,
        ]);
    }

    public function test_expense_decrements_account_balance(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/transactions', [
                'type' => 'expense',
                'amount' => 75.50,
                'description' => 'Supermarket Run',
                'date' => '2026-10-29',
                'category_id' => $this->expenseCategory->id,
                'account_id' => $this->account->id,
            ]);

        $response->assertStatus(201);
        $this->account->refresh();
        $this->assertEquals(424.50, (float) $this->account->balance);
    }

    public function test_income_increments_account_balance(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/transactions', [
                'type' => 'income',
                'amount' => 250.00,
                'description' => 'Client Invoice',
                'date' => '2026-10-29',
                'category_id' => $this->incomeCategory->id,
                'account_id' => $this->account->id,
            ]);

        $response->assertStatus(201);
        $this->account->refresh();
        $this->assertEquals(750.00, (float) $this->account->balance);
    }

    public function test_updating_transaction_adjusts_balance(): void
    {
        // Log initial expense of $100 -> balance becomes $400
        $tx = Transaction::create([
            'user_id' => $this->user->id,
            'account_id' => $this->account->id,
            'category_id' => $this->expenseCategory->id,
            'type' => 'expense',
            'amount' => 100.00,
            'description' => 'Dinner',
            'date' => '2026-10-29',
        ]);
        $this->account->update(['balance' => 400.00]);

        // Update amount to $150 -> balance should become $350
        $response = $this->actingAs($this->user)
            ->putJson("/api/transactions/{$tx->id}", [
                'amount' => 150.00,
            ]);

        $response->assertStatus(200);
        $this->account->refresh();
        $this->assertEquals(350.00, (float) $this->account->balance);
    }

    public function test_deleting_transaction_restores_balance(): void
    {
        // An expense of $100 that brought balance from $500 to $400
        $tx = Transaction::create([
            'user_id' => $this->user->id,
            'account_id' => $this->account->id,
            'category_id' => $this->expenseCategory->id,
            'type' => 'expense',
            'amount' => 100.00,
            'description' => 'Hardware Purchase',
            'date' => '2026-10-29',
        ]);
        $this->account->update(['balance' => 400.00]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/transactions/{$tx->id}");

        $response->assertStatus(200);
        $this->account->refresh();
        $this->assertEquals(500.00, (float) $this->account->balance);
    }

    public function test_cannot_delete_account_with_associated_transactions(): void
    {
        Transaction::create([
            'user_id' => $this->user->id,
            'account_id' => $this->account->id,
            'category_id' => $this->expenseCategory->id,
            'type' => 'expense',
            'amount' => 50.00,
            'description' => 'Gas',
            'date' => '2026-10-29',
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/accounts/{$this->account->id}");

        $response->assertStatus(400)
            ->assertJsonStructure(['error']);

        $this->assertDatabaseHas('accounts', ['id' => $this->account->id]);
    }
}

