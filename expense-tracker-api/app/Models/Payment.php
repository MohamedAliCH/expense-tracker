<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'user_id',
        'stripe_payment_id',
        'stripe_customer_id',
        'amount',
        'currency',
        'status',
        'payment_type',
        'description',
        'metadata',
        'transaction_id',
        'synced_to_transaction',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',
        'synced_to_transaction' => 'boolean',
        'paid_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    // Scopes
    public function scopeSucceeded($query)
    {
        return $query->where('status', 'succeeded');
    }

    public function scopeUnsynced($query)
    {
        return $query->where('synced_to_transaction', false);
    }

    // Helper Methods
    public function isSucceeded(): bool
    {
        return $this->status === 'succeeded';
    }

    public function isSynced(): bool
    {
        return $this->synced_to_transaction;
    }

    public function markAsSynced(int $transactionId): void
    {
        $this->update([
            'transaction_id' => $transactionId,
            'synced_to_transaction' => true,
        ]);
    }
}