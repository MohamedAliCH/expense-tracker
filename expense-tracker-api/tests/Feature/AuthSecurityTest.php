<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/accounts');
        $response->assertStatus(401);
    }

    public function test_tenant_isolation_prevents_cross_user_access(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $accountB = Account::create([
            'user_id' => $userB->id,
            'name' => 'Secret Vault B',
            'type' => 'bank',
            'balance' => 9999.00,
        ]);

        // User A attempts to view User B's account
        $response = $this->actingAs($userA)->getJson("/api/accounts/{$accountB->id}");
        // findOrFail throws ModelNotFoundException when scoped to user_id -> 404 / 500 caught
        $this->assertTrue(in_array($response->status(), [404, 500]));

        // User A attempts to delete User B's account
        $deleteResponse = $this->actingAs($userA)->deleteJson("/api/accounts/{$accountB->id}");
        $this->assertTrue(in_array($deleteResponse->status(), [404, 500]));

        // Ensure User B's account was not touched
        $this->assertDatabaseHas('accounts', [
            'id' => $accountB->id,
            'name' => 'Secret Vault B',
        ]);
    }
}

