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
        // Seed default categories, default accounts, and the demo John Doe user
        $this->call([
            CategorySeeder::class,
            DefaultAccountsSeeder::class,
            JohnDoeSeeder::class,
        ]);
    }
}
