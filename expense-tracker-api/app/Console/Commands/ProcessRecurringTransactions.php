<?php

namespace App\Console\Commands;

use App\Services\AccountLedgerService;
use Illuminate\Console\Command;

class ProcessRecurringTransactions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'transactions:process-recurring';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process due recurring transactions for all users';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Processing recurring transactions...');
        $count = AccountLedgerService::processAllRecurring();
        $this->info("Successfully processed {$count} recurring transactions.");

        return Command::SUCCESS;
    }
}

