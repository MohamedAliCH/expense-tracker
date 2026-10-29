<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AiAdvisorController;
use App\Http\Controllers\Api\StripeControllers\SubscriptionController;
use App\Http\Controllers\Api\StripeControllers\PaymentController;
use App\Http\Controllers\Api\StripeControllers\StripeWebhookController;


// PUBLIC ROUTES (No authentication required)

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/webhooks/stripe', [StripeWebhookController::class, 'handle']);

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok', 
        'message' => 'API is running',
        'timestamp' => now()
    ]);
});

// DEV/TESTING SEEDER ROUTE (Restricted to non-production and auth)
if (app()->environment('local', 'testing')) {
    Route::post('/seed-johndoe', function () {
        \Illuminate\Support\Facades\Artisan::call('db:seed', ['--class' => 'JohnDoeSeeder', '--force' => true]);
        return response()->json([
            'message' => 'Successfully seeded John Doe transactions!',
            'log' => \Illuminate\Support\Facades\Artisan::output()
        ]);
    })->middleware('auth:sanctum');
}

// PROTECTED ROUTES (Authentication required)

Route::middleware('auth:sanctum')->group(function () {
    
    // Auth & Profile routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
    
    // Analytics
    Route::get('/analytics', [AnalyticsController::class, 'index']);

    // Oceanic AI Advisor (Rate-limited to protect API quotas and prevent abuse)
    Route::prefix('ai')->group(function () {
        Route::get('/analysis', [AiAdvisorController::class, 'analysis'])->middleware('throttle:10,1');
        Route::post('/query', [AiAdvisorController::class, 'query'])->middleware('throttle:15,1');
        Route::post('/categorize', [AiAdvisorController::class, 'categorize'])->middleware('throttle:30,1');
    });
    
    // Resource routes (CRUD)
    Route::post('/accounts/transfer', [AccountController::class, 'transfer']);
    Route::post('/transactions/import', [TransactionController::class, 'import']);
    Route::post('/transactions/process-recurring', [TransactionController::class, 'processRecurring']);
    Route::post('/transactions/{id}/receipt', [TransactionController::class, 'uploadReceipt']);

    Route::apiResource('transactions', TransactionController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('accounts', AccountController::class);
    Route::apiResource('budgets', BudgetController::class);

    // SUBSCRIPTION ROUTES
    Route::prefix('subscription')->group(function () {
        Route::post('/checkout', [SubscriptionController::class, 'createCheckoutSession']);
        Route::get('/status', [SubscriptionController::class, 'status']);
        Route::post('/cancel', [SubscriptionController::class, 'cancel']);
        Route::post('/resume', [SubscriptionController::class, 'resume']);
        Route::post('/portal', [SubscriptionController::class, 'createPortalSession']);
    });
    
    // PAYMENT TRACKING ROUTES
    Route::prefix('payments')->group(function () {
        Route::get('/', [PaymentController::class, 'index']);
        Route::get('/{id}', [PaymentController::class, 'show']);
        Route::post('/{id}/sync', [PaymentController::class, 'syncToTransaction']);
        Route::post('/bulk-sync', [PaymentController::class, 'bulkSync']);
    });
    
    // USER LIMITS (add to existing auth routes)
    Route::get('/user/limits', function (Request $request) {
        return response()->json($request->user()->getLimits());
    });
});
