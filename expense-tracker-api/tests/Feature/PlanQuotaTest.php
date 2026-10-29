<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlanQuotaTest extends TestCase
{
    use RefreshDatabase;

    public function test_free_user_cannot_exceed_account_quota(): void
    {
        $user = User::factory()->create(['is_premium' => false]);

        // User already has 2 accounts (max allowed on free tier)
        Account::create(['user_id' => $user->id, 'name' => 'Account 1', 'type' => 'wallet', 'balance' => 0]);
        Account::create(['user_id' => $user->id, 'name' => 'Account 2', 'type' => 'bank', 'balance' => 0]);

        // Attempting to create 3rd account must fail with 403
        $response = $this->actingAs($user)->postJson('/api/accounts', [
            'name' => 'Account 3',
            'type' => 'wallet',
            'balance' => 10,
        ]);

        $response->assertStatus(403)
            ->assertJsonStructure(['error']);
    }

    public function test_free_user_cannot_exceed_budget_quota(): void
    {
        $user = User::factory()->create(['is_premium' => false]);

        $cat1 = Category::create(['user_id' => $user->id, 'name' => 'Cat 1', 'type' => 'expense', 'color' => '#1f7a8c']);
        $cat2 = Category::create(['user_id' => $user->id, 'name' => 'Cat 2', 'type' => 'expense', 'color' => '#2a9d8f']);
        $cat3 = Category::create(['user_id' => $user->id, 'name' => 'Cat 3', 'type' => 'expense', 'color' => '#d97724']);
        $cat4 = Category::create(['user_id' => $user->id, 'name' => 'Cat 4', 'type' => 'expense', 'color' => '#bc4749']);

        // Create 3 budgets (limit)
        Budget::create(['user_id' => $user->id, 'category_id' => $cat1->id, 'amount' => 100, 'period' => 'monthly', 'start_date' => '2026-10-01']);
        Budget::create(['user_id' => $user->id, 'category_id' => $cat2->id, 'amount' => 100, 'period' => 'monthly', 'start_date' => '2026-10-01']);
        Budget::create(['user_id' => $user->id, 'category_id' => $cat3->id, 'amount' => 100, 'period' => 'monthly', 'start_date' => '2026-10-01']);

        // 4th budget must fail with 403
        $response = $this->actingAs($user)->postJson('/api/budgets', [
            'category_id' => $cat4->id,
            'amount' => 150,
            'period' => 'monthly',
            'start_date' => '2026-10-01',
        ]);

        $response->assertStatus(403)
            ->assertJsonStructure(['error']);
    }

    public function test_pro_user_can_bypass_quotas(): void
    {
        $proUser = User::factory()->create([
            'is_premium' => true,
            'premium_expires_at' => now()->addYear(),
        ]);

        // Pro user can create 3rd, 4th accounts without 403
        Account::create(['user_id' => $proUser->id, 'name' => 'Vault 1', 'type' => 'wallet', 'balance' => 0]);
        Account::create(['user_id' => $proUser->id, 'name' => 'Vault 2', 'type' => 'bank', 'balance' => 0]);

        $response = $this->actingAs($proUser)->postJson('/api/accounts', [
            'name' => 'Vault 3',
            'type' => 'credit_card',
            'balance' => 0,
        ]);

        $response->assertStatus(201);
    }
}

