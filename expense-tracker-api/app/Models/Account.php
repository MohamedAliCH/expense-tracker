<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    protected $fillable = ['name', 'balance', 'type', 'user_id'];

    protected $casts = [
        'balance' => 'decimal:2'
    ];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    // Update balance after transaction
    public function updateBalance(Transaction $transaction)
    {
        if ($transaction->type === 'income') {
            $this->increment('balance', $transaction->amount);
        } else {
            $this->decrement('balance', $transaction->amount);
        }
    }
}
