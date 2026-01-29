<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\StripeControllers\SubscriptionController;
use App\Http\Controllers\Api\StripeControllers\PaymentController;
use App\Http\Controllers\Api\StripeControllers\StripeWebhookController;


// PUBLIC ROUTES (No authentication required)


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/webhooks/stripe', [StripeWebhookController::class, 'handle']);

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok', 
        'message' => 'API is running',
        'timestamp' => now()
    ]);
});






// PROTECTED ROUTES (Authentication required)

Route::middleware('auth:sanctum')->group(function () {
    
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Analytics
    Route::get('/analytics', [AnalyticsController::class, 'index']);
    
    // Resource routes (CRUD)
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