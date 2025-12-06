import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Check, Zap, ArrowLeft } from "lucide-react";
import {
  createCheckoutSession,
  getSubscriptionStatus,
  createPortalSession,
} from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import "./UpgradePage.css";

const UpgradePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Stripe Price IDs from your Stripe Dashboard
  const PRICES = {
    monthly: process.env.REACT_APP_STRIPE_PRICE_MONTHLY || "price_monthly_id",
    yearly: process.env.REACT_APP_STRIPE_PRICE_YEARLY || "price_yearly_id",
  };

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: "$9.99",
      period: "/month",
      priceId: PRICES.monthly,
      features: [
        "Unlimited budgets",
        "Unlimited accounts",
        "Unlimited categories",
        "Advanced analytics",
        "Export reports",
        "Priority support",
      ],
    },
    {
      id: "yearly",
      name: "Yearly",
      price: "$99.99",
      period: "/year",
      priceId: PRICES.yearly,
      savings: "Save $20",
      popular: true,
      features: [
        "Unlimited budgets",
        "Unlimited accounts",
        "Unlimited categories",
        "Advanced analytics",
        "Export reports",
        "Priority support",
        "2 months FREE",
      ],
    },
  ];

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const { user, refreshUser } = useAuth(); // Get user from context

  // ... (inside fetchSubscriptionStatus)
  const fetchSubscriptionStatus = async () => {
    try {
      const status = await getSubscriptionStatus();
      setSubscriptionStatus(status);

      // Sync context if mismatch
      if (user && status.is_premium !== user.is_premium) {
        await refreshUser();
      }
    } catch (error) {
      console.error("Error fetching subscription status:", error);
    }
  };

  // Redirect to Stripe Checkout
  const handleSubscribe = async (priceId) => {
    setLoading(true);
    setSelectedPlan(priceId);
    try {
      const { checkout_url } = await createCheckoutSession(priceId);
      window.location.href = checkout_url; // Redirect to Stripe
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  // Open Stripe Customer Portal
  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const { portal_url } = await createPortalSession();
      window.location.href = portal_url;
    } catch (error) {
      console.error("Error opening portal:", error);
      alert("Failed to open billing portal.");
    } finally {
      setLoading(false);
    }
  };

  // Check if either context or API confirms premium status
  const isPremium = user?.is_premium || subscriptionStatus?.is_premium;

  // If user is already premium
  if (isPremium) {
    return (
      <div className="upgrade-container">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={20} /> Back
        </button>

        <div className="premium-active-card">
          <Crown size={48} className="crown-icon" />
          <h2>You're a Premium Member! 🎉</h2>
          <p>
            Thank you for your support. Enjoy unlimited access to all features.
          </p>

          {subscriptionStatus?.subscription && (
            <div className="subscription-details">
              <p>
                <strong>Plan:</strong>{" "}
                {subscriptionStatus.subscription?.plan_name || "Premium"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {subscriptionStatus.subscription?.status || "Active"}
              </p>
            </div>
          )}

          <button
            className="manage-btn"
            onClick={handleManageBilling}
            disabled={loading}
          >
            {loading ? "Loading..." : "Manage Billing"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="upgrade-container">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        <ArrowLeft size={20} /> Back
      </button>

      <div className="upgrade-header">
        <Crown size={40} className="crown-icon" />
        <h1>Upgrade to Premium</h1>
        <p>Unlock all features and take control of your finances</p>
      </div>

      <div className="plans-grid">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.popular ? "popular" : ""}`}
          >
            {plan.popular && (
              <span className="popular-badge">Most Popular</span>
            )}
            {plan.savings && (
              <span className="savings-badge">{plan.savings}</span>
            )}

            <h3>{plan.name}</h3>
            <div className="price">
              <span className="amount">{plan.price}</span>
              <span className="period">{plan.period}</span>
            </div>

            <ul className="features-list">
              {plan.features.map((feature, index) => (
                <li key={index}>
                  <Check size={16} className="check-icon" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`subscribe-btn ${plan.popular ? "primary" : ""}`}
              onClick={() => handleSubscribe(plan.priceId)}
              disabled={loading}
            >
              {loading && selectedPlan === plan.priceId ? (
                "Processing..."
              ) : (
                <>
                  <Zap size={16} />
                  Subscribe Now
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="free-features">
        <h4>Free Plan Includes:</h4>
        <p>3 budgets • 2 accounts • 10 categories • Basic analytics</p>
      </div>
    </div>
  );
};

export default UpgradePage;
