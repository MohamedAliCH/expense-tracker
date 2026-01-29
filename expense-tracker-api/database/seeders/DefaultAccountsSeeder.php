<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Account;

class DefaultAccountsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users
        $users = User::all();

        foreach ($users as $user) {
            // Check if user already has accounts
            if ($user->accounts()->count() === 0) {
                $user->accounts()->createMany([
                    [
                        'name' => 'Cash',
                        'type' => 'wallet',
                        'balance' => 0,
                    ],
                    [
                        'name' => 'Bank Account',
                        'type' => 'bank',
                        'balance' => 0,
                    ]
                ]);
                
                $this->command->info("Created default accounts for user: {$user->email}");
            } else {
                $this->command->info("User {$user->email} already has accounts. Skipping.");
            }
        }
    }
}
