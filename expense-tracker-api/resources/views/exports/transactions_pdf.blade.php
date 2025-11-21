<!DOCTYPE html>
<html>
<head>
    <title>Transactions Report</title>
    <style>
        body { font-family: sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { margin-bottom: 20px; }
        .income { color: green; }
        .expense { color: red; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Expense Tracker Report</h2>
        <p>Generated on: {{ date('Y-m-d H:i:s') }}</p>
    </div>

    <div class="summary">
        <h3>Summary</h3>
        <p>Total Income: <span class="income">${{ number_format($summary['income'], 2) }}</span></p>
        <p>Total Expenses: <span class="expense">${{ number_format($summary['expenses'], 2) }}</span></p>
        <p>Net Balance: ${{ number_format($summary['balance'], 2) }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Account</th>
                <th>Type</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $transaction)
            <tr>
                <td>{{ $transaction->date }}</td>
                <td>{{ $transaction->description }}</td>
                <td>{{ $transaction->category->name ?? 'N/A' }}</td>
                <td>{{ $transaction->account->name ?? 'N/A' }}</td>
                <td class="{{ $transaction->type }}">{{ ucfirst($transaction->type) }}</td>
                <td class="{{ $transaction->type }}">${{ number_format($transaction->amount, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
