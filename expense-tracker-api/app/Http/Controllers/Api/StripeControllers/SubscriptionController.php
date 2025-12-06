<?php

namespace App\Http\Controllers\Api\StripeControllers;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\BillingPortal\Session as PortalSession;
use Stripe\Customer;

class SubscriptionController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('stripe.secret'));
    }

    /**
     * Create Stripe Checkout session for subscription
     */
    public function createCheckoutSession(Request $request): JsonResponse
    {
        $request->validate([
            'price_id' => 'required|string',
        ]);

        $user = $request->user();

        // Get or create Stripe customer
        if (!$user->stripe_customer_id) {
            $customer = Customer::create([
                'email' => $user->email,
                'name' => $user->name,
                'metadata' => ['user_id' => $user->id],
            ]);
            $user->update(['stripe_customer_id' => $customer->id]);
        }

        // Create checkout session
        $session = Session::create([
            'customer' => $user->stripe_customer_id,
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price' => $request->price_id,
                'quantity' => 1,
            ]],
            'mode' => 'subscription',
            'success_url' => config('app.frontend_url') . '/subscription/success?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => config('app.frontend_url') . '/subscription/canceled',
            'metadata' => ['user_id' => $user->id],
        ]);

        return response()->json([
            'checkout_url' => $session->url,
            'session_id' => $session->id,
        ]);
    }

    /**
     * Get user's subscription status
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscription = $user->subscription;

        return response()->json([
            'is_premium' => $user->isPremium(),
            'subscription' => $subscription,
            'limits' => $user->getLimits(),
        ]);
    }

    /**
     * Cancel subscription
     */
    public function cancel(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscription = $user->subscription;

        if (!$subscription) {
            return response()->json(['message' => 'No active subscription'], 404);
        }

        // Cancel at period end via Stripe API
        $stripeSubscription = \Stripe\Subscription::update($subscription->stripe_subscription_id, [
            'cancel_at_period_end' => true,
        ]);

        $subscription->update([
            'canceled_at' => now(),
            'ends_at' => $subscription->current_period_end,
        ]);

        return response()->json([
            'message' => 'Subscription will be canceled at the end of the billing period',
            'ends_at' => $subscription->ends_at,
        ]);
    }

    /**
     * Resume canceled subscription
     */
    public function resume(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscription = $user->subscription;

        if (!$subscription || !$subscription->canceled_at) {
            return response()->json(['message' => 'No canceled subscription to resume'], 404);
        }

        // Resume via Stripe API
        \Stripe\Subscription::update($subscription->stripe_subscription_id, [
            'cancel_at_period_end' => false,
        ]);

        $subscription->update([
            'canceled_at' => null,
            'ends_at' => null,
        ]);

        return response()->json(['message' => 'Subscription resumed']);
    }

    /**
     * Create Stripe Customer Portal session
     */
    public function createPortalSession(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->stripe_customer_id) {
            // Create customer if missing
            $customer = Customer::create([
                'email' => $user->email,
                'name' => $user->name,
                'metadata' => ['user_id' => $user->id],
            ]);
            $user->update(['stripe_customer_id' => $customer->id]);
        }

        try {
            $session = PortalSession::create([
                'customer' => $user->stripe_customer_id,
                'return_url' => config('app.frontend_url') . '/dashboard',
            ]);
        } catch (\Stripe\Exception\InvalidRequestException $e) {
            // Handle case where seeded customer ID is invalid/fake
            if (str_contains($e->getMessage(), 'No such customer')) {
                $customer = Customer::create([
                    'email' => $user->email,
                    'name' => $user->name,
                    'metadata' => ['user_id' => $user->id],
                ]);
                $user->update(['stripe_customer_id' => $customer->id]);

                // Retry portal creation
                $session = PortalSession::create([
                    'customer' => $user->stripe_customer_id,
                    'return_url' => config('app.frontend_url') . '/dashboard',
                ]);
            } else {
                throw $e;
            }
        }

        return response()->json(['portal_url' => $session->url]);
    }
}