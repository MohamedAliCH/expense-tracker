<?php

namespace App\Http\Controllers\Api\StripeControllers;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Stripe\Webhook;
use Stripe\Stripe;
use Stripe\Exception\SignatureVerificationException;

class StripeWebhookController extends Controller
{
    public function __construct()
    {
        // Set Stripe API key for all webhook handlers
        Stripe::setApiKey(config('stripe.secret'));
    }

    /**
     * Handle Stripe webhook events
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Handle the event
        switch ($event->type) {
            case 'checkout.session.completed':
                $this->handleCheckoutSessionCompleted($event->data->object);
                break;
            // Subscription renewed
            case 'invoice.paid':
                $this->handleInvoicePaid($event->data->object);
                break;
            // Subscription updated
            case 'customer.subscription.updated':
                $this->handleSubscriptionUpdated($event->data->object);
                break;
            // Subscription cancelled
            case 'customer.subscription.deleted':
                $this->handleSubscriptionDeleted($event->data->object);
                break;
            // Payment was successful
            case 'payment_intent.succeeded':
                $this->handlePaymentIntentSucceeded($event->data->object);
                break;

            default:
                // Unhandled event type
                break;
        }

        return response()->json(['received' => true]);
    }

    /**
     * Handle checkout.session.completed
     */
    protected function handleCheckoutSessionCompleted($session): void
    {
        $userId = $session->metadata->user_id ?? null;
        if (!$userId) return;

        $user = User::find($userId);
        if (!$user) return;

        // Get subscription details from Stripe
        $stripeSubscription = \Stripe\Subscription::retrieve($session->subscription);

        // Create local subscription record
        Subscription::create([
            'user_id' => $user->id,
            'stripe_subscription_id' => $stripeSubscription->id,
            'stripe_customer_id' => $session->customer,
            'stripe_price_id' => $stripeSubscription->items->data[0]->price->id,
            'plan_name' => 'premium',
            'status' => $stripeSubscription->status,
            'current_period_start' => date('Y-m-d H:i:s', $stripeSubscription->current_period_start),
            'current_period_end' => date('Y-m-d H:i:s', $stripeSubscription->current_period_end),
        ]);

        // Update user premium status
        $user->update([
            'is_premium' => true,
            'premium_expires_at' => date('Y-m-d H:i:s', $stripeSubscription->current_period_end),
        ]);
    }

    /**
     * Handle invoice.paid (subscription renewed)
     */
    protected function handleInvoicePaid($invoice): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $invoice->subscription)->first();
        if (!$subscription) return;

        // Update subscription period
        $stripeSubscription = \Stripe\Subscription::retrieve($invoice->subscription);
        $subscription->update([
            'current_period_start' => date('Y-m-d H:i:s', $stripeSubscription->current_period_start),
            'current_period_end' => date('Y-m-d H:i:s', $stripeSubscription->current_period_end),
            'status' => 'active',
        ]);

        // Extend user premium
        $subscription->user->update([
            'is_premium' => true,
            'premium_expires_at' => date('Y-m-d H:i:s', $stripeSubscription->current_period_end),
        ]);
    }

    /**
     * Handle customer.subscription.updated
     */
    protected function handleSubscriptionUpdated($stripeSubscription): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription->id)->first();
        if (!$subscription) return;

        $subscription->update([
            'status' => $stripeSubscription->status,
            'current_period_end' => date('Y-m-d H:i:s', $stripeSubscription->current_period_end),
        ]);
    }

    /**
     * Handle customer.subscription.deleted
     */
    protected function handleSubscriptionDeleted($stripeSubscription): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription->id)->first();
        if (!$subscription) return;

        $subscription->update(['status' => 'canceled']);
        $subscription->user->update(['is_premium' => false]);
    }

    /**
     * Handle payment_intent.succeeded (for tracking)
     */
    protected function handlePaymentIntentSucceeded($paymentIntent): void
    {
        $customerId = $paymentIntent->customer;
        if (!$customerId) return;

        $user = User::where('stripe_customer_id', $customerId)->first();
        if (!$user) return;

        // Record the payment for tracking
        Payment::create([
            'user_id' => $user->id,
            'stripe_payment_id' => $paymentIntent->id,
            'stripe_customer_id' => $customerId,
            'amount' => $paymentIntent->amount / 100, // Convert from cents
            'currency' => $paymentIntent->currency,
            'status' => 'succeeded',
            'payment_type' => 'one_time',
            'description' => $paymentIntent->description,
            'metadata' => $paymentIntent->metadata ? (array)$paymentIntent->metadata : null,
            'paid_at' => now(),
        ]);
    }
}