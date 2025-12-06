<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->string('stripe_customer_id')->nullable()->after('password');
        $table->boolean('is_premium')->default(false)->after('stripe_customer_id');
        $table->timestamp('premium_expires_at')->nullable()->after('is_premium');
    });
}

/**
     * Reverse the migrations.
     */
public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn(['stripe_customer_id', 'is_premium', 'premium_expires_at']);
    });
}

    
    
};
