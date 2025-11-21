<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['income', 'expense']);
            $table->decimal('amount', 15, 2);
            $table->text('description');
            $table->date('date');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('receipt_path')->nullable();
            $table->timestamps();
            
            // Indexes for faster queries
            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'type']);
            $table->index(['category_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('transactions');
    }
};
