<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create User
        $user = User::updateOrCreate(
            ['email' => 'john@example.com'],
            [
                'name' => 'John Doe',
                'password' => Hash::make('password123'),
                'is_premium' => true,
                'premium_expires_at' => Carbon::now()->addYear(),
                'stripe_customer_id' => 'cus_test_' . Str::random(10),
            ]
        );

        $this->command->info('User John Doe created/updated.');

        // 2. Clear existing data for this user to avoid duplicates if run multiple times
        Transaction::where('user_id', $user->id)->delete();
        Budget::where('user_id', $user->id)->delete();
        // Category::where('user_id', $user->id)->delete(); // Keep default categories if any, but we'll add specific ones
        Account::where('user_id', $user->id)->delete();
        Subscription::where('user_id', $user->id)->delete();
        Payment::where('user_id', $user->id)->delete();

        // 3. Create Accounts
        $checking = Account::create([
            'user_id' => $user->id,
            'name' => 'Main Checking',
            'type' => 'Bank',
            'balance' => 5430.50,
        ]);

        $savings = Account::create([
            'user_id' => $user->id,
            'name' => 'Savings',
            'type' => 'Savings',
            'balance' => 12500.00,
        ]);

        $creditCard = Account::create([
            'user_id' => $user->id,
            'name' => 'Travel Rewards Card',
            'type' => 'Credit Card',
            'balance' => -450.25,
        ]);

        $this->command->info('Accounts created.');

        // 4. Create Categories
        $cats = [];
        
        // Income
        $cats['salary'] = Category::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Salary'],
            ['type' => 'income', 'emoji' => '💰', 'color' => '#10b981']
        );
        $cats['freelance'] = Category::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Freelance'],
            ['type' => 'income', 'emoji' => '💻', 'color' => '#3b82f6']
        );

        // Expense
        $cats['rent'] = Category::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Rent'],
            ['type' => 'expense', 'emoji' => '🏠', 'color' => '#ef4444']
        );
        $cats['groceries'] = Category::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Groceries'],
            ['type' => 'expense', 'emoji' => '🛒', 'color' => '#f97316']
        );
        $cats['dining'] = Category::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Dining Out'],
            ['type' => 'expense', 'emoji' => '🍽️', 'color' => '#f59e0b']
        );
        $cats['entertainment'] = Category::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Entertainment'],
            ['type' => 'expense', 'emoji' => '🎬', 'color' => '#8b5cf6']
        );
        $cats['transport'] = Category::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Transport'],
            ['type' => 'expense', 'emoji' => '🚗', 'color' => '#6366f1']
        );
        $cats['utilities'] = Category::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Utilities'],
            ['type' => 'expense', 'emoji' => '💡', 'color' => '#ec4899']
        );

        $this->command->info('Categories created.');

        // 5. Create Transactions (Recent & Past)
        $transactions = [
            // Current Month
            ['date' => Carbon::now()->subDays(1), 'amount' => 85.50, 'type' => 'expense', 'category' => 'groceries', 'account' => $checking, 'desc' => 'Weekly Groceries'],
            ['date' => Carbon::now()->subDays(2), 'amount' => 45.00, 'type' => 'expense', 'category' => 'dining', 'account' => $checking, 'desc' => 'Dinner with Friends'],
            ['date' => Carbon::now()->subDays(5), 'amount' => 120.00, 'type' => 'expense', 'category' => 'transport', 'account' => $creditCard, 'desc' => 'Gas & Parking'],
            ['date' => Carbon::now()->subDays(10), 'amount' => 2500.00, 'type' => 'income', 'category' => 'salary', 'account' => $checking, 'desc' => 'Monthly Salary'],
            ['date' => Carbon::now()->subDays(12), 'amount' => 15.99, 'type' => 'expense', 'category' => 'entertainment', 'account' => $creditCard, 'desc' => 'Netflix Subscription'],
            ['date' => Carbon::now()->subDays(15), 'amount' => 1200.00, 'type' => 'expense', 'category' => 'rent', 'account' => $checking, 'desc' => 'Monthly Rent', 'is_recurring' => true],
            ['date' => Carbon::now()->subDays(18), 'amount' => 500.00, 'type' => 'income', 'category' => 'freelance', 'account' => $savings, 'desc' => 'Web Design Project'],
            
            // Last Month
            ['date' => Carbon::now()->subMonth()->subDays(5), 'amount' => 92.30, 'type' => 'expense', 'category' => 'groceries', 'account' => $checking, 'desc' => 'Grocery Run'],
            ['date' => Carbon::now()->subMonth()->subDays(15), 'amount' => 1200.00, 'type' => 'expense', 'category' => 'rent', 'account' => $checking, 'desc' => 'Monthly Rent', 'is_recurring' => true],
            ['date' => Carbon::now()->subMonth()->subDays(10), 'amount' => 2500.00, 'type' => 'income', 'category' => 'salary', 'account' => $checking, 'desc' => 'Monthly Salary'],
        ];

        foreach ($transactions as $t) {
            Transaction::create([
                'user_id' => $user->id,
                'account_id' => $t['account']->id,
                'category_id' => $cats[$t['category']]->id,
                'amount' => $t['amount'],
                'type' => $t['type'],
                'date' => $t['date']->format('Y-m-d'),
                'description' => $t['desc'],
            ]);
        }

        $this->command->info('Transactions created.');

        // 6. Create Budgets
        Budget::create([
            'user_id' => $user->id,
            'category_id' => $cats['groceries']->id,
            'amount' => 400.00,
            'period' => 'monthly',
            'start_date' => Carbon::now()->startOfMonth()->format('Y-m-d'),
        ]);

        Budget::create([
            'user_id' => $user->id,
            'category_id' => $cats['dining']->id,
            'amount' => 200.00,
            'period' => 'monthly',
            'start_date' => Carbon::now()->startOfMonth()->format('Y-m-d'),
        ]);

        $this->command->info('Budgets created.');

        // 7. Create Stripe Data
        // Active Subscription
        Subscription::create([
            'user_id' => $user->id,
            'stripe_subscription_id' => 'sub_test_' . Str::random(10),
            'stripe_customer_id' => $user->stripe_customer_id,
            'stripe_price_id' => config('stripe.prices.monthly') ?? 'price_dummy',
            'status' => 'active',
            'plan_name' => 'Monthly Premium',
            'current_period_start' => Carbon::now()->subDays(10),
            'current_period_end' => Carbon::now()->addDays(20),
        ]);

        // Payment History
        Payment::create([
            'user_id' => $user->id,
            'stripe_payment_id' => 'pi_test_' . Str::random(10),
            'stripe_customer_id' => $user->stripe_customer_id,
            'amount' => 9.99,
            'currency' => 'usd',
            'status' => 'succeeded',
            'description' => 'Premium Subscription - Monthly',
            'created_at' => Carbon::now()->subDays(10),
        ]);
        
        // Synced Payment (Simulated)
        $syncedPayment = Payment::create([
            'user_id' => $user->id,
            'stripe_payment_id' => 'pi_test_' . Str::random(10),
            'stripe_customer_id' => $user->stripe_customer_id,
            'amount' => 9.99,
            'currency' => 'usd',
            'status' => 'succeeded',
            'description' => 'Premium Subscription - Monthly (Previous)',
            'created_at' => Carbon::now()->subDays(40),
            'synced_to_transaction' => true,
        ]);
        
        // Add logic to actually link it to a transaction if model supports it, 
        // but for now the boolean flag is enough for the UI demo.

        $this->command->info('Stripe data created.');
        $this->command->info('Demo seeding complete for john@example.com');
    }
}
