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
    Schema::create('payments', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('stripe_payment_id')->unique();
        $table->string('stripe_customer_id')->nullable();
        $table->decimal('amount', 10, 2);
        $table->string('currency', 3)->default('usd');
        $table->string('status'); // succeeded, pending, failed
        $table->string('payment_type')->default('one_time');
        $table->string('description')->nullable();
        $table->json('metadata')->nullable();
        $table->foreignId('transaction_id')->nullable()->constrained()->onDelete('set null');
        $table->boolean('synced_to_transaction')->default(false);
        $table->timestamp('paid_at')->nullable();
        $table->timestamps();

        $table->index(['user_id', 'status']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
