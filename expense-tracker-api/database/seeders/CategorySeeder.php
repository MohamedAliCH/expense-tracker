<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\User;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // System Defaults (available to all users, cannot be deleted)
        // Set user_id to NULL and is_system to 1
        
        $categories = [
            // Expenses
            ['name' => 'Food & Dining', 'type' => 'expense', 'color' => '#ef4444', 'emoji' => '🍔'],
            ['name' => 'Transportation', 'type' => 'expense', 'color' => '#3b82f6', 'emoji' => '🚗'],
            ['name' => 'Shopping', 'type' => 'expense', 'color' => '#a855f7', 'emoji' => '🛍️'],
            ['name' => 'Entertainment', 'type' => 'expense', 'color' => '#ec4899', 'emoji' => '🎬'],
            ['name' => 'Bills & Utilities', 'type' => 'expense', 'color' => '#f59e0b', 'emoji' => '💡'],
            ['name' => 'Health & Fitness', 'type' => 'expense', 'color' => '#10b981', 'emoji' => '💊'],
            ['name' => 'Travel', 'type' => 'expense', 'color' => '#06b6d4', 'emoji' => '✈️'],
            ['name' => 'Education', 'type' => 'expense', 'color' => '#6366f1', 'emoji' => '📚'],
            
            // Income
            ['name' => 'Salary', 'type' => 'income', 'color' => '#10b981', 'emoji' => '💰'],
            ['name' => 'Freelance', 'type' => 'income', 'color' => '#3b82f6', 'emoji' => '💻'],
            ['name' => 'Investments', 'type' => 'income', 'color' => '#8b5cf6', 'emoji' => '📈'],
            ['name' => 'Gifts', 'type' => 'income', 'color' => '#ec4899', 'emoji' => '🎁'],
            ['name' => 'Other', 'type' => 'income', 'color' => '#6b7280', 'emoji' => '📌'],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(
                [
                    'user_id' => null, // Global system category
                    'name' => $cat['name'],
                    'type' => $cat['type'],
                ],
                [
                    'color' => $cat['color'],
                    'emoji' => $cat['emoji'],
                    'is_system' => true,
                ]
            );
        }
    }
}
