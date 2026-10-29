<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Budget;
use App\Models\Account;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FinancialAiService
{
    /**
     * Build an exact, aggregated financial snapshot for a user.
     * Prevents LLM arithmetic hallucinations by calculating all numbers deterministically.
     */
    public function buildSnapshot(int $userId): array
    {
        $now = Carbon::now();
        $thisMonthStart = $now->copy()->startOfMonth()->toDateString();
        $thisMonthEnd = $now->copy()->endOfMonth()->toDateString();
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth()->toDateString();
        $lastMonthEnd = $now->copy()->subMonth()->endOfMonth()->toDateString();

        // 1. Current Month Inflow / Outflow
        $currentTotals = Transaction::where('user_id', $userId)
            ->whereBetween('date', [$thisMonthStart, $thisMonthEnd])
            ->selectRaw("
                type,
                COALESCE(SUM(amount), 0) as total,
                COUNT(*) as count
            ")
            ->groupBy('type')
            ->get()
            ->keyBy('type');

        $curIncome = (float) ($currentTotals->get('income')->total ?? 0);
        $curExpense = (float) ($currentTotals->get('expense')->total ?? 0);
        $curNet = $curIncome - $curExpense;
        $savingsRate = $curIncome > 0 ? round(($curNet / $curIncome) * 100, 1) : 0;

        // 2. Previous Month Comparison
        $lastTotals = Transaction::where('user_id', $userId)
            ->whereBetween('date', [$lastMonthStart, $lastMonthEnd])
            ->selectRaw("
                type,
                COALESCE(SUM(amount), 0) as total
            ")
            ->groupBy('type')
            ->get()
            ->keyBy('type');

        $lastIncome = (float) ($lastTotals->get('income')->total ?? 0);
        $lastExpense = (float) ($lastTotals->get('expense')->total ?? 0);

        $spendingMoM = $lastExpense > 0
            ? round((($curExpense - $lastExpense) / $lastExpense) * 100, 1)
            : 0;

        // 3. Category Spending Breakdown for current month
        $categories = Transaction::join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $userId)
            ->where('transactions.type', 'expense')
            ->whereBetween('transactions.date', [$thisMonthStart, $thisMonthEnd])
            ->selectRaw('
                categories.id,
                categories.name,
                COALESCE(SUM(transactions.amount), 0) as total,
                COUNT(*) as tx_count
            ')
            ->groupBy(['categories.id', 'categories.name'])
            ->orderByDesc('total')
            ->limit(8)
            ->get()
            ->map(fn($c) => [
                'id' => (int) $c->id,
                'name' => $c->name,
                'total' => round((float) $c->total, 2),
                'tx_count' => (int) $c->tx_count,
            ])
            ->values()
            ->all();

        // 4. Budget Status & Pacing
        $dayOfMonth = $now->day;
        $daysInMonth = $now->daysInMonth;
        $expectedBurnRate = $daysInMonth > 0 ? round(($dayOfMonth / $daysInMonth) * 100, 1) : 0;

        $budgets = Budget::where('user_id', $userId)
            ->with('category')
            ->get()
            ->map(function ($b) use ($userId, $thisMonthStart, $thisMonthEnd) {
                $spent = (float) Transaction::where('user_id', $userId)
                    ->where('type', 'expense')
                    ->where('category_id', $b->category_id)
                    ->whereBetween('date', [$thisMonthStart, $thisMonthEnd])
                    ->sum('amount');

                $limit = (float) $b->amount;
                $pct = $limit > 0 ? round(($spent / $limit) * 100, 1) : 0;

                return [
                    'id' => $b->id,
                    'category' => $b->category->name ?? 'General',
                    'category_id' => $b->category_id,
                    'limit' => $limit,
                    'spent' => round($spent, 2),
                    'remaining' => round($limit - $spent, 2),
                    'percent_used' => $pct,
                    'is_over' => $spent > $limit,
                ];
            })
            ->all();

        // 5. Total Liquid Account Balances
        $accounts = Account::where('user_id', $userId)
            ->get(['id', 'name', 'type', 'balance'])
            ->map(fn($a) => [
                'id' => $a->id,
                'name' => $a->name,
                'type' => $a->type,
                'balance' => round((float) $a->balance, 2),
            ])
            ->all();

        $totalBalance = array_sum(array_column($accounts, 'balance'));

        // 6. Top Anomalous / Largest Single Expenses This Month
        $largestExpenses = Transaction::with('category')
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->whereBetween('date', [$thisMonthStart, $thisMonthEnd])
            ->orderByDesc('amount')
            ->limit(3)
            ->get()
            ->map(fn($t) => [
                'description' => $t->description,
                'amount' => round((float) $t->amount, 2),
                'date' => $t->date,
                'category' => $t->category->name ?? 'Uncategorized',
            ])
            ->all();

        return [
            'as_of_date' => $now->toDateString(),
            'day_of_month' => $dayOfMonth,
            'days_in_month' => $daysInMonth,
            'expected_month_elapsed_percent' => $expectedBurnRate,
            'current_month' => [
                'income' => $curIncome,
                'expense' => $curExpense,
                'net' => $curNet,
                'savings_rate_percent' => $savingsRate,
            ],
            'previous_month' => [
                'income' => $lastIncome,
                'expense' => $lastExpense,
            ],
            'spending_mom_percent' => $spendingMoM,
            'total_liquid_balance' => round($totalBalance, 2),
            'top_categories' => $categories,
            'budgets' => $budgets,
            'accounts' => $accounts,
            'largest_expenses' => $largestExpenses,
        ];
    }

    /**
     * Analyze the snapshot using Multi-Provider AI (Gemini, OpenAI, Groq, or Heuristic fallback).
     */
    public function generateAnalysis(int $userId): array
    {
        $snapshot = $this->buildSnapshot($userId);
        $provider = env('AI_PROVIDER', 'auto'); // gemini | openai | groq | heuristic | auto

        // 1. Try Gemini
        if (in_array($provider, ['gemini', 'auto']) && env('GEMINI_API_KEY')) {
            try {
                $result = $this->callGeminiAnalysis($snapshot);
                if ($result) {
                    $result['provider_used'] = 'gemini';
                    $result['snapshot'] = $snapshot;
                    return $result;
                }
            } catch (\Throwable $e) {
                Log::warning('Gemini AI analysis failed, falling back: ' . $e->getMessage());
            }
        }

        // 2. Try OpenAI
        if (in_array($provider, ['openai', 'auto']) && env('OPENAI_API_KEY')) {
            try {
                $result = $this->callOpenAiCompatibleAnalysis(
                    'https://api.openai.com/v1/chat/completions',
                    env('OPENAI_API_KEY'),
                    env('OPENAI_MODEL', 'gpt-4o-mini'),
                    $snapshot
                );
                if ($result) {
                    $result['provider_used'] = 'openai';
                    $result['snapshot'] = $snapshot;
                    return $result;
                }
            } catch (\Throwable $e) {
                Log::warning('OpenAI analysis failed, falling back: ' . $e->getMessage());
            }
        }

        // 3. Try Groq (ultra-fast LPU inference)
        if (in_array($provider, ['groq', 'auto']) && env('GROQ_API_KEY')) {
            try {
                $result = $this->callOpenAiCompatibleAnalysis(
                    'https://api.groq.com/openai/v1/chat/completions',
                    env('GROQ_API_KEY'),
                    env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
                    $snapshot
                );
                if ($result) {
                    $result['provider_used'] = 'groq';
                    $result['snapshot'] = $snapshot;
                    return $result;
                }
            } catch (\Throwable $e) {
                Log::warning('Groq analysis failed, falling back: ' . $e->getMessage());
            }
        }

        // 4. Default Deterministic Heuristic Engine (Zero-Key offline guarantee)
        $heuristic = $this->generateHeuristicAnalysis($snapshot);
        $heuristic['provider_used'] = 'heuristic';
        $heuristic['snapshot'] = $snapshot;
        return $heuristic;
    }

    /**
     * Ask a question or run a "What-If" scenario grounded in the financial snapshot.
     */
    public function askAdvisor(int $userId, string $prompt): array
    {
        $snapshot = $this->buildSnapshot($userId);
        $provider = env('AI_PROVIDER', 'auto');

        // Gemini
        if (in_array($provider, ['gemini', 'auto']) && env('GEMINI_API_KEY')) {
            try {
                $answer = $this->callGeminiQuery($snapshot, $prompt);
                if ($answer) {
                    return [
                        'answer' => $answer,
                        'provider_used' => 'gemini',
                        'prompt' => $prompt,
                    ];
                }
            } catch (\Throwable $e) {
                Log::warning('Gemini askAdvisor failed: ' . $e->getMessage());
            }
        }

        // OpenAI / Groq
        $apiKey = env('OPENAI_API_KEY') ?: env('GROQ_API_KEY');
        $endpoint = env('OPENAI_API_KEY') 
            ? 'https://api.openai.com/v1/chat/completions'
            : 'https://api.groq.com/openai/v1/chat/completions';
        $model = env('OPENAI_API_KEY') ? env('OPENAI_MODEL', 'gpt-4o-mini') : env('GROQ_MODEL', 'llama-3.3-70b-versatile');

        if ($apiKey && in_array($provider, ['openai', 'groq', 'auto'])) {
            try {
                $answer = $this->callOpenAiQuery($endpoint, $apiKey, $model, $snapshot, $prompt);
                if ($answer) {
                    return [
                        'answer' => $answer,
                        'provider_used' => env('OPENAI_API_KEY') ? 'openai' : 'groq',
                        'prompt' => $prompt,
                    ];
                }
            } catch (\Throwable $e) {
                Log::warning('OpenAI/Groq askAdvisor failed: ' . $e->getMessage());
            }
        }

        // Heuristic Query Answerer
        return [
            'answer' => $this->generateHeuristicQueryAnswer($snapshot, $prompt),
            'provider_used' => 'heuristic',
            'prompt' => $prompt,
        ];
    }

    /**
     * Auto-categorize a raw transaction description based on existing categories.
     */
    public function autoCategorize(int $userId, string $description, float $amount = 0): array
    {
        $userCategories = \App\Models\Category::where(function ($q) use ($userId) {
            $q->where('user_id', $userId)->orWhereNull('user_id');
        })->get(['id', 'name', 'type']);

        $categoryList = $userCategories->map(fn($c) => ['id' => $c->id, 'name' => $c->name, 'type' => $c->type])->values()->all();

        // 1. First try smart keyword pattern matching
        $lower = strtolower($description);
        $map = [
            'grocer' => 'Groceries',
            'market' => 'Groceries',
            'supermarket' => 'Groceries',
            'food' => 'Food & Dining',
            'restaurant' => 'Food & Dining',
            'cafe' => 'Food & Dining',
            'coffee' => 'Food & Dining',
            'uber' => 'Transportation',
            'lyft' => 'Transportation',
            'taxi' => 'Transportation',
            'gas' => 'Transportation',
            'fuel' => 'Transportation',
            'netflix' => 'Entertainment',
            'spotify' => 'Entertainment',
            'cinema' => 'Entertainment',
            'salary' => 'Salary',
            'payroll' => 'Salary',
            'freelance' => 'Freelance',
            'rent' => 'Housing',
            'mortgage' => 'Housing',
            'pharmacy' => 'Healthcare',
            'doctor' => 'Healthcare',
            'amazon' => 'Shopping',
        ];

        foreach ($map as $keyword => $catName) {
            if (str_contains($lower, $keyword)) {
                $match = $userCategories->first(fn($c) => strcasecmp($c->name, $catName) === 0);
                if ($match) {
                    return [
                        'category_id' => $match->id,
                        'category_name' => $match->name,
                        'confidence' => 0.95,
                        'source' => 'heuristic_keyword',
                    ];
                }
            }
        }

        // 2. If Gemini/OpenAI is available, use semantic matching
        if (env('GEMINI_API_KEY')) {
            try {
                $geminiMatch = $this->callGeminiCategorize($description, $amount, $categoryList);
                if ($geminiMatch) {
                    return $geminiMatch;
                }
            } catch (\Throwable $e) {
                Log::info('Gemini auto-categorization fallback: ' . $e->getMessage());
            }
        }

        // Default to first expense category or null
        $fallback = $userCategories->firstWhere('type', 'expense') ?: $userCategories->first();
        return [
            'category_id' => $fallback?->id,
            'category_name' => $fallback?->name ?? 'Uncategorized',
            'confidence' => 0.40,
            'source' => 'fallback_default',
        ];
    }

    // -------------------------------------------------------------------------
    // PROVIDER CALL IMPLEMENTATIONS
    // -------------------------------------------------------------------------

    protected function callGeminiAnalysis(array $snapshot): ?array
    {
        $apiKey = env('GEMINI_API_KEY');
        $model = env('GEMINI_MODEL', 'gemini-3.5-flash-lite');
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        $systemInstruction = "You are Oceanic AI, an elite, high-agency financial intelligence co-pilot.
Analyze the deterministic financial snapshot. Return strictly valid JSON adhering to the required schema:
{
  \"headline\": string,
  \"score\": integer (0-100),
  \"diagnosis\": string,
  \"anomalies\": [string],
  \"recommendations\": [
    {
      \"title\": string,
      \"description\": string,
      \"impact\": string,
      \"action_type\": \"create_budget\" | \"view_ledger\" | \"view_accounts\" | \"none\",
      \"category_id\": integer or null,
      \"suggested_amount\": number or null
    }
  ],
  \"forecast\": string
}
Tone: Concise, quantitative, encouraging yet sharp. Avoid generic filler words. Format all amounts cleanly.";

        $prompt = "Financial Snapshot:\n" . json_encode($snapshot, JSON_PRETTY_PRINT) . "\n\n" .
            "Analyze current month performance, anomaly risks, budget pacing, and produce 2-3 high-impact actionable recommendations.";

        $client = Http::withHeaders(['Content-Type' => 'application/json'])->timeout(15);
        if (app()->environment('local', 'testing')) {
            $client = $client->withoutVerifying();
        }

        $response = $client->post($url, [
            'system_instruction' => [
                'parts' => [['text' => $systemInstruction]]
            ],
            'contents' => [
                ['parts' => [['text' => $prompt]]]
            ],
            'generationConfig' => [
                'temperature' => 0.2,
                'response_mime_type' => 'application/json',
            ]
        ]);

        if (!$response->successful()) {
            Log::warning('Gemini API HTTP Error: ' . $response->body());
            return null;
        }

        $body = $response->json();
        $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? null;
        if (!$text) return null;

        $parsed = json_decode($text, true);
        return is_array($parsed) ? $parsed : null;
    }

    protected function callOpenAiCompatibleAnalysis(string $url, string $apiKey, string $model, array $snapshot): ?array
    {
        $client = Http::withToken($apiKey)->timeout(15);
        if (app()->environment('local', 'testing')) {
            $client = $client->withoutVerifying();
        }

        $response = $client->post($url, [
            'model' => $model,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are Oceanic AI, an elite quantitative financial advisor. Return strictly valid JSON with keys: headline (string), score (integer 0-100), diagnosis (string), anomalies (array of strings), recommendations (array of objects with title, description, impact, action_type, category_id, suggested_amount), and forecast (string).'
                ],
                [
                    'role' => 'user',
                    'content' => "Financial Snapshot:\n" . json_encode($snapshot, JSON_PRETTY_PRINT)
                ]
            ],
            'response_format' => ['type' => 'json_object'],
            'temperature' => 0.2,
        ]);

        if (!$response->successful()) {
            Log::warning("OpenAI-compatible ({$model}) HTTP Error: " . $response->body());
            return null;
        }

        $raw = $response->json('choices.0.message.content');
        $parsed = json_decode($raw, true);
        return is_array($parsed) ? $parsed : null;
    }

    protected function callGeminiQuery(array $snapshot, string $query): ?string
    {
        $apiKey = env('GEMINI_API_KEY');
        $model = env('GEMINI_MODEL', 'gemini-3.5-flash-lite');
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        $systemInstruction = "You are Oceanic AI, a personal financial advisor. Answer the user's financial question directly, using the provided financial snapshot data. Keep answers under 4 sentences, highly specific, and focused on actual numbers.";

        $prompt = "User Financial Snapshot:\n" . json_encode($snapshot) . "\n\nUser Question:\n" . $query;

        $client = Http::withHeaders(['Content-Type' => 'application/json'])->timeout(15);
        if (app()->environment('local', 'testing')) {
            $client = $client->withoutVerifying();
        }

        $response = $client->post($url, [
            'system_instruction' => [
                'parts' => [['text' => $systemInstruction]]
            ],
            'contents' => [
                ['parts' => [['text' => $prompt]]]
            ],
            'generationConfig' => [
                'temperature' => 0.3,
            ]
        ]);

        return $response->json('candidates.0.content.parts.0.text');
    }

    protected function callOpenAiQuery(string $url, string $apiKey, string $model, array $snapshot, string $query): ?string
    {
        $client = Http::withToken($apiKey)->timeout(15);
        if (app()->environment('local', 'testing')) {
            $client = $client->withoutVerifying();
        }

        $response = $client->post($url, [
            'model' => $model,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => "You are Oceanic AI, an expert financial intelligence assistant. Answer grounded strictly in the provided financial snapshot. Keep your answer under 4 concise sentences with exact figures."
                ],
                [
                    'role' => 'user',
                    'content' => "Financial Data:\n" . json_encode($snapshot) . "\n\nQuestion: " . $query
                ]
            ],
            'temperature' => 0.3,
        ]);

        return $response->json('choices.0.message.content');
    }

    protected function callGeminiCategorize(string $description, float $amount, array $categories): ?array
    {
        $apiKey = env('GEMINI_API_KEY');
        $model = env('GEMINI_MODEL', 'gemini-3.5-flash-lite');
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        $prompt = "Match this bank transaction description: '{$description}' (amount: {$amount}) to the single best category from this list: " . json_encode($categories) . ".\nReturn JSON: {\"category_id\": integer, \"category_name\": string, \"confidence\": float (0.0 - 1.0)}";

        $client = Http::withHeaders(['Content-Type' => 'application/json'])->timeout(10);
        if (app()->environment('local', 'testing')) {
            $client = $client->withoutVerifying();
        }

        $response = $client->post($url, [
            'contents' => [['parts' => [['text' => $prompt]]]],
            'generationConfig' => [
                'temperature' => 0.0,
                'response_mime_type' => 'application/json',
            ]
        ]);

        if (!$response->successful()) return null;
        $parsed = json_decode($response->json('candidates.0.content.parts.0.text'), true);
        if (is_array($parsed) && isset($parsed['category_id'])) {
            $parsed['source'] = 'gemini';
            return $parsed;
        }
        return null;
    }

    // -------------------------------------------------------------------------
    // DETERMINISTIC HEURISTIC ENGINE (Works offline / without API keys)
    // -------------------------------------------------------------------------

    public function generateHeuristicAnalysis(array $snapshot): array
    {
        $cur = $snapshot['current_month'];
        $mom = $snapshot['spending_mom_percent'];
        $savingsRate = $cur['savings_rate_percent'];
        $liquid = $snapshot['total_liquid_balance'];

        // Calculate a financial health score (0 - 100)
        $score = 70;
        if ($savingsRate >= 20) $score += 15;
        elseif ($savingsRate < 0) $score -= 25;
        elseif ($savingsRate < 10) $score -= 10;

        if ($mom > 15) $score -= 10;
        elseif ($mom < -5) $score += 10;

        $overBudgets = array_filter($snapshot['budgets'], fn($b) => $b['is_over']);
        $score -= (count($overBudgets) * 8);
        $score = max(20, min(98, $score));

        // Diagnosis & Headline
        if ($savingsRate >= 25) {
            $headline = "Strong Financial Velocity: Saving {$savingsRate}% of Inflows";
            $diagnosis = "Your capital efficiency is in the top quartile this month. Inflows exceed outflows by \${$cur['net']}, expanding your liquid reserve to \${$liquid}.";
        } elseif ($savingsRate >= 0) {
            $headline = "Stable Cashflow with Moderate Savings Margin ({$savingsRate}%)";
            $diagnosis = "Net cashflow is positive at +\${$cur['net']}. Inflows are pacing well, though spending acceleration (+{$mom}% MoM) warrants monitoring.";
        } else {
            $deficit = abs($cur['net']);
            $headline = "Negative Cashflow Alert: Outflows Exceed Inflows by \${$deficit}";
            $diagnosis = "Spending has outpaced earnings by \${$deficit} this cycle. Review non-essential categories to prevent liquid reserve drawdown.";
        }

        // Anomalies Detection
        $anomalies = [];
        if ($mom > 20) {
            $anomalies[] = "Total spending jumped by +{$mom}% compared to last month.";
        }
        foreach ($overBudgets as $ob) {
            $anomalies[] = "Category '{$ob['category']}' breached its \${$ob['limit']} limit (currently at {$ob['percent_used']}%).";
        }
        if (!empty($snapshot['largest_expenses'])) {
            $top = $snapshot['largest_expenses'][0];
            $anomalies[] = "Single largest outflow: \${$top['amount']} for '{$top['description']}' ({$top['category']}).";
        }
        if (empty($anomalies)) {
            $anomalies[] = "No abnormal volatility detected across active accounts.";
        }

        // Actionable Recommendations
        $recommendations = [];

        // 1. Unbudgeted high spend recommendation
        if (!empty($snapshot['top_categories'])) {
            $topCat = $snapshot['top_categories'][0];
            $hasBudget = false;
            foreach ($snapshot['budgets'] as $b) {
                if ($b['category_id'] === $topCat['id']) {
                    $hasBudget = true;
                    break;
                }
            }

            if (!$hasBudget) {
                $suggestedCap = round($topCat['total'] * 1.15, 0);
                $recommendations[] = [
                    'title' => "Cap '{$topCat['name']}' Spending",
                    'description' => "You have spent \${$topCat['total']} on {$topCat['name']} without an active budget.",
                    'impact' => "Protects \${$topCat['total']} in discretionary outflow",
                    'action_type' => 'create_budget',
                    'category_id' => $topCat['id'],
                    'category_name' => $topCat['name'],
                    'suggested_amount' => $suggestedCap,
                ];
            }
        }

        // 2. Over-budget pacing recommendation
        if (!empty($overBudgets)) {
            $firstOver = reset($overBudgets);
            $recommendations[] = [
                'title' => "Adjust '{$firstOver['category']}' Threshold",
                'description' => "Currently at {$firstOver['percent_used']}% of limit. Consider increasing limit or curbing further discretionary entries this week.",
                'impact' => "Restores ledger balance alignment",
                'action_type' => 'view_ledger',
                'category_id' => $firstOver['category_id'],
                'category_name' => $firstOver['category'],
                'suggested_amount' => null,
            ];
        }

        // 3. Savings buffer recommendation
        if ($savingsRate < 15 && $cur['income'] > 0) {
            $targetSave = round($cur['income'] * 0.20, 0);
            $recommendations[] = [
                'title' => "Aim for 20% Savings Rate Target",
                'description' => "Reallocating \${$targetSave}/month to savings would accelerate your emergency buffer.",
                'impact' => "+\${$targetSave}/mo reserve growth",
                'action_type' => 'view_accounts',
                'category_id' => null,
                'category_name' => null,
                'suggested_amount' => $targetSave,
            ];
        }

        // Fallback recommendation if array is empty
        if (empty($recommendations)) {
            $recommendations[] = [
                'title' => "Maintain Current Spending Discipline",
                'description' => "Your cashflow pace is well within target margins. All active budgets are under control.",
                'impact' => "Consistent capital growth",
                'action_type' => 'none',
                'category_id' => null,
                'category_name' => null,
                'suggested_amount' => null,
            ];
        }

        $forecast = "Projected month-end balance: \${$liquid} across active accounts with a \${$cur['net']} net trajectory.";

        return [
            'headline' => $headline,
            'score' => $score,
            'diagnosis' => $diagnosis,
            'anomalies' => array_slice($anomalies, 0, 3),
            'recommendations' => array_slice($recommendations, 0, 3),
            'forecast' => $forecast,
        ];
    }

    protected function generateHeuristicQueryAnswer(array $snapshot, string $prompt): string
    {
        $lower = strtolower($prompt);
        $cur = $snapshot['current_month'];
        $liquid = $snapshot['total_liquid_balance'];

        if (str_contains($lower, 'food') || str_contains($lower, 'dining') || str_contains($lower, 'grocer')) {
            $match = collect($snapshot['top_categories'])->first(function ($c) {
                $name = strtolower($c['name']);
                return str_contains($name, 'food') || str_contains($name, 'dining') || str_contains($name, 'grocer');
            });
            if ($match) {
                return "This month you've spent \${$match['total']} on {$match['name']} across {$match['tx_count']} transactions.";
            }
            return "No food or dining expenses were recorded this month yet.";
        }

        if (str_contains($lower, 'afford') || str_contains($lower, 'can i spend') || str_contains($lower, 'buy')) {
            return "Your current liquid balance across all accounts is \${$liquid}, and your net cashflow this month is +\${$cur['net']}. Spending here will decrease your net savings rate (currently {$cur['savings_rate_percent']}%).";
        }

        if (str_contains($lower, 'save') || str_contains($lower, 'savings') || str_contains($lower, 'rate')) {
            return "Your current savings rate is {$cur['savings_rate_percent']}%, with total monthly income of \${$cur['income']} and expenses of \${$cur['expense']}.";
        }

        return "Based on your financial ledger: Total income is \${$cur['income']}, total expenses are \${$cur['expense']}, net cashflow is +\${$cur['net']}, and total liquid assets stand at \${$liquid}.";
    }
}

