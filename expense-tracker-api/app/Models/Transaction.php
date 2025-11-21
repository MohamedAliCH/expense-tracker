<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'type', 'amount', 'description', 'date',
        'category_id', 'account_id', 'user_id', 'receipt_path'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date' => 'date'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scope for filtering by date range
    public function scopeDateRange($query, $start, $end)
    {
        return $query->whereBetween('date', [$start, $end]);
    }

    // Scope for current month
    public function scopeCurrentMonth($query)
    {
        return $query->whereYear('date', now()->year)
                    ->whereMonth('date', now()->month);
    }
}
