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
        $this->call([
            CategorySeeder::class,
            DefaultAccountsSeeder::class,
        ]);

        // Seed the full Oceanic demo user if not already initialized with 6-month data
        if (!User::where('email', 'john@example.com')->exists()) {
            $this->call([
                DemoUserSeeder::class,
            ]);
        }
    }
}
