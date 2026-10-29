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
        Schema::table('transactions', function (Blueprint $table) {
            $table->index('account_id', 'transactions_account_id_index');
            $table->index(['user_id', 'account_id'], 'transactions_user_account_index');
        });

        Schema::table('budgets', function (Blueprint $table) {
            $table->index('user_id', 'budgets_user_id_index');
            $table->unique(['user_id', 'category_id'], 'budgets_user_category_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('transactions_account_id_index');
            $table->dropIndex('transactions_user_account_index');
        });

        Schema::table('budgets', function (Blueprint $table) {
            $table->dropIndex('budgets_user_id_index');
            $table->dropUnique('budgets_user_category_unique');
        });
    }
};

