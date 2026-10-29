<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Transaction extends Model
{
    protected $fillable = [
        'type',
        'amount',
        'description',
        'date',
        'category_id',
        'account_id',
        'user_id',
        'receipt_path',
        'is_favorite',
        'notes',
        'is_recurring',
        'recurring_frequency',
        'last_recurred_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date' => 'date',
        'is_favorite' => 'boolean',
        'is_recurring' => 'boolean',
        'last_recurred_at' => 'date',
    ];

    protected $appends = ['receipt_url'];

    public function getReceiptUrlAttribute(): ?string
    {
        if (!$this->receipt_path) {
            return null;
        }

        if (str_starts_with($this->receipt_path, 'http://') || str_starts_with($this->receipt_path, 'https://')) {
            return $this->receipt_path;
        }

        return Storage::disk('public')->url($this->receipt_path);
    }

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
