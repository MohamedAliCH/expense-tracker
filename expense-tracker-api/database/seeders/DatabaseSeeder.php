<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Only seed default categories and accounts
        // Users should register themselves
        $this->call([
            CategorySeeder::class,
            DefaultAccountsSeeder::class,
        ]);
    }
}
