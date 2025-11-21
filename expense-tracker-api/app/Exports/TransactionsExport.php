<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TransactionsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $transactions;

    public function __construct($transactions)
    {
        $this->transactions = $transactions;
    }

    public function collection()
    {
        return $this->transactions;
    }

    public function headings(): array
    {
        return [
            'Date',
            'Description',
            'Category',
            'Account',
            'Type',
            'Amount',
        ];
    }

    public function map($transaction): array
    {
        return [
            $transaction->date,
            $transaction->description,
            $transaction->category->name ?? 'N/A',
            $transaction->account->name ?? 'N/A',
            ucfirst($transaction->type),
            $transaction->amount,
        ];
    }
}
