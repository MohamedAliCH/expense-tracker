<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Account;
use App\Models\Transaction;
use Carbon\Carbon;

class JohnDoeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Find or create John Doe
        $user = User::firstOrCreate(
            ['email' => 'john@example.com'],
            [
                'name' => 'John Doe',
                'password' => bcrypt('password123'),
            ]
        );

        $this->command->info('User John Doe found or created.');

        // 2. Ensure he has an Account
        $account = Account::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Main Checking'],
            [
                'type' => 'checking',
                'balance' => 0 // We will compute this
            ]
        );

        // 3. Get generic categories (from default categories seeder)
        // If not found, we create a few dummy ones
        $foodCategory = Category::firstOrCreate(['name' => 'Food'], ['type' => 'expense', 'emoji' => '🍔', 'color' => '#FF5733', 'is_system' => true]);
        $salaryCategory = Category::firstOrCreate(['name' => 'Salary'], ['type' => 'income', 'emoji' => '💵', 'color' => '#28A745', 'is_system' => true]);
        $transportCategory = Category::firstOrCreate(['name' => 'Transport'], ['type' => 'expense', 'emoji' => '🚗', 'color' => '#007BFF', 'is_system' => true]);
        $billsCategory = Category::firstOrCreate(['name' => 'Bills'], ['type' => 'expense', 'emoji' => '🧾', 'color' => '#FFC107', 'is_system' => true]);

        // 4. Create Transactions for logic over the last 60 days
        $transactions = [
            ['type' => 'income', 'amount' => 3500, 'category_id' => $salaryCategory->id, 'desc' => 'Monthly Salary', 'days_ago' => 60],
            ['type' => 'expense', 'amount' => 1200, 'category_id' => $billsCategory->id, 'desc' => 'Rent', 'days_ago' => 58],
            ['type' => 'expense', 'amount' => 60, 'category_id' => $transportCategory->id, 'desc' => 'Gas', 'days_ago' => 55],
            ['type' => 'expense', 'amount' => 150, 'category_id' => $foodCategory->id, 'desc' => 'Groceries', 'days_ago' => 52],
            ['type' => 'expense', 'amount' => 45, 'category_id' => $foodCategory->id, 'desc' => 'Restaurant Dinner', 'days_ago' => 45],
            // Next month
            ['type' => 'income', 'amount' => 3500, 'category_id' => $salaryCategory->id, 'desc' => 'Monthly Salary', 'days_ago' => 30],
            ['type' => 'expense', 'amount' => 1200, 'category_id' => $billsCategory->id, 'desc' => 'Rent', 'days_ago' => 28],
            ['type' => 'expense', 'amount' => 50, 'category_id' => $transportCategory->id, 'desc' => 'Gas', 'days_ago' => 25],
            ['type' => 'expense', 'amount' => 200, 'category_id' => $foodCategory->id, 'desc' => 'Groceries', 'days_ago' => 20],
            ['type' => 'expense', 'amount' => 110, 'category_id' => $billsCategory->id, 'desc' => 'Electricity Bill', 'days_ago' => 15],
            // Recent
            ['type' => 'expense', 'amount' => 85, 'category_id' => $foodCategory->id, 'desc' => 'Groceries', 'days_ago' => 5],
            ['type' => 'expense', 'amount' => 12, 'category_id' => $foodCategory->id, 'desc' => 'Coffee', 'days_ago' => 2],
            ['type' => 'expense', 'amount' => 40, 'category_id' => $transportCategory->id, 'desc' => 'Uber', 'days_ago' => 1],
        ];

        $totalBalance = 0;

        foreach ($transactions as $t) {
            Transaction::create([
                'user_id' => $user->id,
                'account_id' => $account->id,
                'category_id' => $t['category_id'],
                'type' => $t['type'],
                'amount' => $t['amount'],
                'description' => $t['desc'],
                'date' => Carbon::now()->subDays($t['days_ago'])->format('Y-m-d'),
            ]);

            if ($t['type'] === 'income') {
                $totalBalance += $t['amount'];
            } else {
                $totalBalance -= $t['amount'];
            }
        }

        // 5. Update account balance to reflect transactions correctly
        $account->update(['balance' => $totalBalance]);

        $this->command->info("Seeded 13 realistic transactions for John Doe. Current balance updated to: $" . $totalBalance);
    }
}
