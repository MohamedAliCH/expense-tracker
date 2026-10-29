<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Category;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\Budget;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiAdvisorTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'email' => 'ai_test@example.com',
            'is_premium' => true,
        ]);

        $checking = Account::create([
            'user_id' => $this->user->id,
            'name' => 'Main Checking',
            'type' => 'checking',
            'balance' => 3500.00,
            'currency' => 'USD',
            'is_active' => true,
        ]);

        $catFood = Category::create([
            'user_id' => $this->user->id,
            'name' => 'Food & Dining',
            'type' => 'expense',
            'color' => '#E05A47',
        ]);

        $catSalary = Category::create([
            'user_id' => $this->user->id,
            'name' => 'Salary',
            'type' => 'income',
            'color' => '#0F766E',
        ]);

        // Transactions this month
        Transaction::create([
            'user_id' => $this->user->id,
            'account_id' => $checking->id,
            'category_id' => $catSalary->id,
            'amount' => 4500.00,
            'type' => 'income',
            'date' => now()->startOfMonth()->toDateString(),
            'description' => 'Monthly Salary Payroll',
        ]);

        Transaction::create([
            'user_id' => $this->user->id,
            'account_id' => $checking->id,
            'category_id' => $catFood->id,
            'amount' => 350.00,
            'type' => 'expense',
            'date' => now()->toDateString(),
            'description' => 'Supermarket Groceries',
        ]);

        Budget::create([
            'user_id' => $this->user->id,
            'category_id' => $catFood->id,
            'amount' => 500.00,
            'period' => 'monthly',
            'start_date' => now()->startOfMonth()->toDateString(),
        ]);
    }

    public function test_ai_analysis_returns_structured_heuristic_data(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/ai/analysis?refresh=true');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'headline',
                    'score',
                    'diagnosis',
                    'anomalies',
                    'recommendations',
                    'forecast',
                    'provider_used',
                    'snapshot' => [
                        'current_month' => [
                            'income',
                            'expense',
                            'net',
                            'savings_rate_percent',
                        ],
                        'total_liquid_balance',
                        'top_categories',
                    ],
                ],
            ]);

        $data = $response->json('data');
        $this->assertEquals(4500.00, $data['snapshot']['current_month']['income']);
        $this->assertEquals(350.00, $data['snapshot']['current_month']['expense']);
        $this->assertNotEmpty($data['recommendations']);
    }

    public function test_ai_query_responds_grounded_in_data(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/ai/query', [
                'prompt' => 'How much did I spend on food this month?',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'answer',
                    'provider_used',
                    'prompt',
                ],
            ]);

        $this->assertStringContainsString('350', $response->json('data.answer'));
    }

    public function test_ai_auto_categorize_matches_pattern(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/ai/categorize', [
                'description' => 'Whole Foods Market grocery haul',
                'amount' => 84.50,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'category_name' => 'Food & Dining',
                ],
            ]);
    }

    public function test_ai_batch_categorize_for_csv(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/ai/categorize', [
                'items' => [
                    ['description' => 'Whole Foods Market', 'amount' => 50],
                    ['description' => 'Monthly Salary Payroll', 'amount' => 4500],
                ],
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    ['category_id', 'category_name'],
                    ['category_id', 'category_name'],
                ],
            ]);
    }

    public function test_ai_query_is_rate_limited(): void
    {
        // Execute queries up to throttle limit
        for ($i = 0; $i < 15; $i++) {
            $this->actingAs($this->user, 'sanctum')
                ->postJson('/api/ai/query', ['prompt' => 'Query #' . $i]);
        }

        // 16th query should be blocked by rate limiter
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/ai/query', ['prompt' => 'Query exceed']);

        $response->assertStatus(429);
    }
}
