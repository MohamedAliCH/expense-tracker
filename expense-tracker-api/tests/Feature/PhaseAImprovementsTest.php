<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PhaseAImprovementsTest extends TestCase
{
    use RefreshDatabase;

    public function test_transaction_show_returns_owner_transaction_and_blocks_idor(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();

        $account = Account::create([
            'user_id' => $owner->id,
            'name' => 'Main Checking',
            'type' => 'bank',
            'balance' => 1000,
        ]);

        $category = Category::create([
            'user_id' => $owner->id,
            'name' => 'Dining',
            'type' => 'expense',
            'color' => '#d97724',
            'emoji' => 'dining',
        ]);

        $tx = Transaction::create([
            'user_id' => $owner->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
            'amount' => 45.00,
            'type' => 'expense',
            'date' => now()->toDateString(),
            'description' => 'Harbor Lunch',
        ]);

        $this->actingAs($owner)
            ->getJson("/api/transactions/{$tx->id}")
            ->assertStatus(200)
            ->assertJsonFragment(['description' => 'Harbor Lunch']);

        $this->actingAs($intruder)
            ->getJson("/api/transactions/{$tx->id}")
            ->assertStatus(404);
    }

    public function test_account_validation_returns_422_and_disallows_direct_balance_mutation(): void
    {
        $user = User::factory()->create(['is_premium' => true]);

        // Missing required fields or invalid type should return 422, not 500
        $this->actingAs($user)
            ->postJson('/api/accounts', [
                'name' => '',
                'type' => 'invalid_type',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'type', 'balance']);

        $account = Account::create([
            'user_id' => $user->id,
            'name' => 'Checking',
            'type' => 'bank',
            'balance' => 500.00,
        ]);

        // Attempting to overwrite balance via PUT /api/accounts/{id} must not mutate balance
        $this->actingAs($user)
            ->putJson("/api/accounts/{$account->id}", [
                'name' => 'Renamed Checking',
                'type' => 'bank',
                'balance' => 999999.99,
            ])
            ->assertStatus(200)
            ->assertJsonFragment(['name' => 'Renamed Checking']);

        $this->assertEquals(500.00, (float) $account->fresh()->balance);
    }

    public function test_budget_index_spent_respects_budget_start_date(): void
    {
        $user = User::factory()->create(['is_premium' => true]);

        $account = Account::create([
            'user_id' => $user->id,
            'name' => 'Checking',
            'type' => 'bank',
            'balance' => 2000,
        ]);

        $category = Category::create([
            'user_id' => $user->id,
            'name' => 'Groceries',
            'type' => 'expense',
            'color' => '#d97724',
            'emoji' => 'groceries',
        ]);

        $monthStart = Carbon::now()->startOfMonth();
        $midMonth = $monthStart->copy()->addDays(10);

        // Expense BEFORE budget start_date (in the same month)
        Transaction::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
            'amount' => 100.00,
            'type' => 'expense',
            'date' => $monthStart->toDateString(),
            'description' => 'Early Month Groceries',
        ]);

        // Expense ON/AFTER budget start_date
        Transaction::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
            'amount' => 65.50,
            'type' => 'expense',
            'date' => $midMonth->toDateString(),
            'description' => 'Mid Month Groceries',
        ]);

        Budget::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 400.00,
            'period' => 'monthly',
            'start_date' => $midMonth->toDateString(),
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/budgets')
            ->assertStatus(200);

        $budgets = $response->json();
        $this->assertCount(1, $budgets);
        $this->assertEquals(65.50, (float) $budgets[0]['spent']);
    }

    public function test_stripe_payment_sync_updates_account_ledger_and_idempotency(): void
    {
        $user = User::factory()->create([
            'is_premium' => false,
            'stripe_customer_id' => 'cus_test_123',
        ]);

        // Pre-fill 2 accounts (free tier limit = 2)
        $checking = Account::create([
            'user_id' => $user->id,
            'name' => 'Checking',
            'type' => 'bank',
            'balance' => 300.00,
        ]);
        Account::create([
            'user_id' => $user->id,
            'name' => 'Wallet',
            'type' => 'wallet',
            'balance' => 100.00,
        ]);

        // Idempotent updateOrCreate check for Payment
        Payment::updateOrCreate(
            ['stripe_payment_id' => 'pi_unique_999'],
            [
                'user_id' => $user->id,
                'stripe_customer_id' => 'cus_test_123',
                'amount' => 25.00,
                'currency' => 'usd',
                'status' => 'succeeded',
                'description' => 'Pro Subscription',
                'paid_at' => now(),
            ]
        );
        $payment = Payment::updateOrCreate(
            ['stripe_payment_id' => 'pi_unique_999'],
            [
                'user_id' => $user->id,
                'stripe_customer_id' => 'cus_test_123',
                'amount' => 25.00,
                'currency' => 'usd',
                'status' => 'succeeded',
                'description' => 'Pro Subscription',
                'paid_at' => now(),
            ]
        );

        $this->assertEquals(1, Payment::where('stripe_payment_id', 'pi_unique_999')->count());

        // Sync payment to transaction -> should reuse existing account (since at free quota) and deduct 25.00
        $this->actingAs($user)
            ->postJson("/api/payments/{$payment->id}/sync")
            ->assertStatus(200);

        $this->assertEquals(275.00, (float) $checking->fresh()->balance);
        $this->assertTrue($payment->fresh()->synced_to_transaction);
    }
}

