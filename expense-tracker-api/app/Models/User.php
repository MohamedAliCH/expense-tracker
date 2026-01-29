<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'stripe_customer_id',
        'is_premium',
        'premium_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_premium' => 'boolean',
            'premium_expires_at' => 'datetime',
        ];
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class)->where('status', 'active');
    }
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function accounts()
    {
        return $this->hasMany(Account::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

// helper methods:
    public function isPremium(): bool
    {
        if ($this->is_premium && $this->premium_expires_at) {
            return $this->premium_expires_at->isFuture();
        }   
        return $this->is_premium;
    }


    public function hasActiveSubscription(): bool
    {
        return $this->subscription !== null;
    }

    
    public function getLimits(): array
    {
        if ($this->isPremium()) {
            return [
                'max_budgets' => PHP_INT_MAX,
                'max_accounts' => PHP_INT_MAX,
                'max_categories' => PHP_INT_MAX,
            ];
        }
        return config('stripe.free_limits');
    }

}
