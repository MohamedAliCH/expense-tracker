<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('transactions', 'is_recurring')) {
                $table->boolean('is_recurring')->default(false)->after('is_favorite');
            }
            if (!Schema::hasColumn('transactions', 'recurring_frequency')) {
                $table->string('recurring_frequency', 20)->default('monthly')->after('is_recurring');
            }
            if (!Schema::hasColumn('transactions', 'last_recurred_at')) {
                $table->date('last_recurred_at')->nullable()->after('recurring_frequency');
            }
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['is_recurring', 'recurring_frequency', 'last_recurred_at']);
        });
    }
};

