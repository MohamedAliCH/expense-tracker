<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\User;
use App\Services\AccountLedgerService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create or Update Demo User
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

        if ($this->command) {
            $this->command->info('User John Doe created/updated.');
        }

        // 2. Clear existing data for this user to avoid duplicates
        Transaction::where('user_id', $user->id)->delete();
        Budget::where('user_id', $user->id)->delete();
        Account::where('user_id', $user->id)->delete();
        Subscription::where('user_id', $user->id)->delete();
        Payment::where('user_id', $user->id)->delete();

        // 3. Create Accounts with canonical types (opening balances before 6-month ledger)
        $checking = Account::create([
            'user_id' => $user->id,
            'name' => 'Main Checking',
            'type' => 'bank',
            'balance' => 2100.00,
        ]);

        $savings = Account::create([
            'user_id' => $user->id,
            'name' => 'Marine Reserve Vault',
            'type' => 'wallet',
            'balance' => 8400.00,
        ]);

        $creditCard = Account::create([
            'user_id' => $user->id,
            'name' => 'Horizon Rewards Card',
            'type' => 'credit_card',
            'balance' => 0.00,
        ]);

        // 4. Create or Update Categories with Phosphor icon keys and oceanic palette (no emojis, no purple)
        $cats = [];

        $cats['salary'] = Category::updateOrCreate(
            ['user_id' => $user->id, 'name' => 'Salary'],
            ['type' => 'income', 'emoji' => 'income', 'color' => '#1f7a8c']
        );
        $cats['freelance'] = Category::updateOrCreate(
            ['user_id' => $user->id, 'name' => 'Freelance'],
            ['type' => 'income', 'emoji' => 'freelance', 'color' => '#2a9d8f']
        );

        $cats['rent'] = Category::updateOrCreate(
            ['user_id' => $user->id, 'name' => 'Rent & Moorage'],
            ['type' => 'expense', 'emoji' => 'housing', 'color' => '#c85a32']
        );
        // Clean up legacy 'Rent' if present
        Category::where('user_id', $user->id)->where('name', 'Rent')->delete();

        $cats['groceries'] = Category::updateOrCreate(
            ['user_id' => $user->id, 'name' => 'Groceries'],
            ['type' => 'expense', 'emoji' => 'groceries', 'color' => '#d97724']
        );
        $cats['dining'] = Category::updateOrCreate(
            ['user_id' => $user->id, 'name' => 'Dining Out'],
            ['type' => 'expense', 'emoji' => 'dining', 'color' => '#e09f3e']
        );
        $cats['entertainment'] = Category::updateOrCreate(
            ['user_id' => $user->id, 'name' => 'Entertainment'],
            ['type' => 'expense', 'emoji' => 'entertainment', 'color' => '#4a6fa5']
        );
        $cats['transport'] = Category::updateOrCreate(
            ['user_id' => $user->id, 'name' => 'Transport'],
            ['type' => 'expense', 'emoji' => 'transport', 'color' => '#3d5a80']
        );
        $cats['utilities'] = Category::updateOrCreate(
            ['user_id' => $user->id, 'name' => 'Utilities'],
            ['type' => 'expense', 'emoji' => 'utilities', 'color' => '#52796f']
        );

        // 5. Seed 6 full months of realistic undulating transactions so the 6-month wave chart is rich
        $monthlyBlueprints = [
            5 => ['salary' => 3600.00, 'freelance' => 450.00,  'rent' => 1250.00, 'groceries' => [118.40, 94.20, 112.10], 'dining' => [64.00, 48.50], 'transport' => 135.00, 'utilities' => 142.00, 'entertainment' => 45.00],
            4 => ['salary' => 3600.00, 'freelance' => 980.00,  'rent' => 1250.00, 'groceries' => [105.80, 128.90, 88.40], 'dining' => [82.00, 54.20, 39.00], 'transport' => 168.50, 'utilities' => 156.20, 'entertainment' => 110.00],
            3 => ['salary' => 3600.00, 'freelance' => 320.00,  'rent' => 1250.00, 'groceries' => [114.00, 99.50, 108.30], 'dining' => [58.00, 72.40], 'transport' => 145.00, 'utilities' => 168.90, 'entertainment' => 65.00],
            2 => ['salary' => 3850.00, 'freelance' => 1250.00, 'rent' => 1250.00, 'groceries' => [132.40, 118.00, 96.70], 'dining' => [94.00, 62.50, 48.00], 'transport' => 192.00, 'utilities' => 149.30, 'entertainment' => 135.00],
            1 => ['salary' => 3850.00, 'freelance' => 640.00,  'rent' => 1250.00, 'groceries' => [110.20, 104.80, 121.50], 'dining' => [76.50, 52.00], 'transport' => 154.00, 'utilities' => 138.40, 'entertainment' => 84.00],
            0 => ['salary' => 3850.00, 'freelance' => 890.00,  'rent' => 1250.00, 'groceries' => [124.60, 98.40, 115.20], 'dining' => [68.00, 54.50, 42.00], 'transport' => 142.00, 'utilities' => 146.80, 'entertainment' => 59.99],
        ];

        foreach ($monthlyBlueprints as $monthsAgo => $plan) {
            $monthBase = Carbon::now()->subMonths($monthsAgo)->startOfMonth();
            $maxDay = $monthsAgo === 0 ? max(1, Carbon::now()->day - 1) : 26;

            $clampDay = function (int $preferredDay) use ($monthBase, $maxDay): string {
                $day = min($preferredDay, $maxDay);
                return $monthBase->copy()->addDays(max(0, $day - 1))->format('Y-m-d');
            };

            $rows = [
                ['date' => $clampDay(1),  'amount' => $plan['salary'], 'type' => 'income',  'cat' => 'salary',        'acc' => $checking,   'desc' => 'Monthly Salary Deposit'],
                ['date' => $clampDay(3),  'amount' => $plan['rent'],   'type' => 'expense', 'cat' => 'rent',          'acc' => $checking,   'desc' => 'Harbor Apartment & Moorage'],
                ['date' => $clampDay(6),  'amount' => $plan['groceries'][0], 'type' => 'expense', 'cat' => 'groceries', 'acc' => $checking, 'desc' => 'Coastal Market Provisions'],
                ['date' => $clampDay(9),  'amount' => $plan['dining'][0],    'type' => 'expense', 'cat' => 'dining',    'acc' => $creditCard, 'desc' => 'Waterfront Bistro'],
                ['date' => $clampDay(12), 'amount' => $plan['freelance'],    'type' => 'income',  'cat' => 'freelance', 'acc' => $savings,    'desc' => 'Marine UI Advisory Retainer'],
                ['date' => $clampDay(14), 'amount' => $plan['groceries'][1], 'type' => 'expense', 'cat' => 'groceries', 'acc' => $checking,   'desc' => 'Weekly Fresh Groceries'],
                ['date' => $clampDay(16), 'amount' => $plan['transport'],    'type' => 'expense', 'cat' => 'transport', 'acc' => $creditCard, 'desc' => 'Fuel & Transit Pass'],
                ['date' => $clampDay(18), 'amount' => $plan['utilities'],    'type' => 'expense', 'cat' => 'utilities', 'acc' => $checking,   'desc' => 'Electric, Fiber & Water'],
                ['date' => $clampDay(21), 'amount' => $plan['dining'][1],    'type' => 'expense', 'cat' => 'dining',    'acc' => $creditCard, 'desc' => 'Harbor Coffee & Dinner'],
                ['date' => $clampDay(23), 'amount' => $plan['groceries'][2], 'type' => 'expense', 'cat' => 'groceries', 'acc' => $checking,   'desc' => 'Artisan Pantry Restock'],
                ['date' => $clampDay(25), 'amount' => $plan['entertainment'],'type' => 'expense', 'cat' => 'entertainment', 'acc' => $creditCard, 'desc' => 'Streaming & Sailing Club'],
            ];

            if (isset($plan['dining'][2])) {
                $rows[] = ['date' => $clampDay(26), 'amount' => $plan['dining'][2], 'type' => 'expense', 'cat' => 'dining', 'acc' => $checking, 'desc' => 'Weekend Brunch'];
            }

            foreach ($rows as $r) {
                $tx = Transaction::create([
                    'user_id' => $user->id,
                    'account_id' => $r['acc']->id,
                    'category_id' => $cats[$r['cat']]->id,
                    'amount' => $r['amount'],
                    'type' => $r['type'],
                    'date' => $r['date'],
                    'description' => $r['desc'],
                ]);
                AccountLedgerService::applyTransaction($tx);
            }
        }

        // 6. Create Budgets for current month
        $startOfMonth = Carbon::now()->startOfMonth()->format('Y-m-d');

        Budget::create([
            'user_id' => $user->id,
            'category_id' => $cats['groceries']->id,
            'amount' => 450.00,
            'period' => 'monthly',
            'start_date' => $startOfMonth,
        ]);

        Budget::create([
            'user_id' => $user->id,
            'category_id' => $cats['dining']->id,
            'amount' => 220.00,
            'period' => 'monthly',
            'start_date' => $startOfMonth,
        ]);

        Budget::create([
            'user_id' => $user->id,
            'category_id' => $cats['transport']->id,
            'amount' => 200.00,
            'period' => 'monthly',
            'start_date' => $startOfMonth,
        ]);

        Budget::create([
            'user_id' => $user->id,
            'category_id' => $cats['utilities']->id,
            'amount' => 180.00,
            'period' => 'monthly',
            'start_date' => $startOfMonth,
        ]);

        // 7. Create Stripe Subscription & Payment History
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

        Payment::create([
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

        if ($this->command) {
            $this->command->info('Demo seeding complete for john@example.com');
        }
    }
}
