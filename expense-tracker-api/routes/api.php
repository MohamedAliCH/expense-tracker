<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\AnalyticsController;

// ==========================================
// PUBLIC ROUTES (No authentication required)
// ==========================================

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok', 
        'message' => 'API is running',
        'timestamp' => now()
    ]);
});

// ==========================================
// PROTECTED ROUTES (Authentication required)
// ==========================================

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
});