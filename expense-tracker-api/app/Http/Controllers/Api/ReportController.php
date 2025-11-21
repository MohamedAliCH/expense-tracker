<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\TransactionsExport;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function export(Request $request)
    {
        $query = Transaction::with(['category', 'account'])
            ->where('user_id', $request->user()->id);

        if ($request->start_date) {
            $query->whereDate('date', '>=', $request->start_date);
        }

        if ($request->end_date) {
            $query->whereDate('date', '<=', $request->end_date);
        }

        $transactions = $query->orderBy('date', 'desc')->get();

        if ($request->format === 'pdf') {
            $summary = [
                'income' => $transactions->where('type', 'income')->sum('amount'),
                'expenses' => $transactions->where('type', 'expense')->sum('amount'),
                'balance' => $transactions->where('type', 'income')->sum('amount') - $transactions->where('type', 'expense')->sum('amount'),
            ];

            $pdf = Pdf::loadView('exports.transactions_pdf', compact('transactions', 'summary'));
            return $pdf->download('transactions.pdf');
        }

        return Excel::download(new TransactionsExport($transactions), 'transactions.xlsx');
    }
}
