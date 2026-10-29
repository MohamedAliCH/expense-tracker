<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FinancialAiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AiAdvisorController extends Controller
{
    protected FinancialAiService $aiService;

    public function __construct(FinancialAiService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Get or generate AI financial analysis and recommendations.
     * Cached for 15 minutes per user unless 'refresh' query param is passed.
     */
    public function analysis(Request $request)
    {
        $userId = $request->user()->id;
        $forceRefresh = $request->boolean('refresh', false);
        $cacheKey = "user_ai_analysis_{$userId}";

        if ($forceRefresh) {
            Cache::forget($cacheKey);
        }

        $data = Cache::remember($cacheKey, now()->addMinutes(15), function () use ($userId) {
            return $this->aiService->generateAnalysis($userId);
        });

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * Ask an interactive question or "What-If" scenario to Oceanic AI.
     */
    public function query(Request $request)
    {
        $validated = $request->validate([
            'prompt' => 'required|string|min:3|max:500',
        ]);

        $userId = $request->user()->id;
        $response = $this->aiService->askAdvisor($userId, $validated['prompt']);

        return response()->json([
            'status' => 'success',
            'data' => $response,
        ]);
    }

    /**
     * Auto-categorize a raw transaction description or batch of descriptions.
     */
    public function categorize(Request $request)
    {
        $userId = $request->user()->id;

        // Batch mode for CSV import
        if ($request->has('items') && is_array($request->items)) {
            $validated = $request->validate([
                'items' => 'required|array|max:200',
                'items.*.description' => 'required|string|max:255',
                'items.*.amount' => 'nullable|numeric',
            ]);

            $results = [];
            foreach ($validated['items'] as $item) {
                $results[] = $this->aiService->autoCategorize(
                    $userId,
                    $item['description'],
                    (float) ($item['amount'] ?? 0)
                );
            }

            return response()->json([
                'status' => 'success',
                'data' => $results,
            ]);
        }

        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'nullable|numeric',
        ]);

        $result = $this->aiService->autoCategorize(
            $userId,
            $validated['description'],
            (float) ($validated['amount'] ?? 0)
        );

        return response()->json([
            'status' => 'success',
            'data' => $result,
        ]);
    }
}

