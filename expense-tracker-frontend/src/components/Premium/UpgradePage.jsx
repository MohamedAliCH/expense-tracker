import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Check, Lightning, ArrowLeft } from "@phosphor-icons/react";
import {
  createCheckoutSession,
  getSubscriptionStatus,
  createPortalSession,
} from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";
import MagneticButton from "../Common/MagneticButton";
import { motion } from "framer-motion";

const UpgradePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { user, refreshUser } = useAuth();

  const PRICES = {
    monthly: process.env.REACT_APP_STRIPE_PRICE_MONTHLY || "price_monthly_id",
    yearly: process.env.REACT_APP_STRIPE_PRICE_YEARLY || "price_yearly_id",
  };

  const plans = [
    {
      id: "monthly",
      name: "Pro Monthly",
      price: "$9.99",
      period: "/ month",
      priceId: PRICES.monthly,
      subtitle: "Full access to unlimited budgets, accounts, and exports",
      features: [
        "Unlimited budget targets",
        "Unlimited connected accounts",
        "Unlimited custom categories",
        "Cashflow & distribution analytics",
        "CSV & PDF statement exports",
        "Priority customer support",
      ],
    },
    {
      id: "yearly",
      name: "Pro Annual",
      price: "$99.99",
      period: "/ year",
      priceId: PRICES.yearly,
      savings: "Save $20/yr",
      popular: true,
      subtitle: "Best value for long-term financial management with 2 months free",
      features: [
        "Unlimited budget targets",
        "Unlimited connected accounts",
        "Unlimited custom categories",
        "Cashflow & distribution analytics",
        "CSV & PDF statement exports",
        "Priority customer support",
        "2 months complimentary",
      ],
    },
  ];

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const status = await getSubscriptionStatus();
        setSubscriptionStatus(status);
        if (user && status.is_premium !== user.is_premium) {
          await refreshUser();
        }
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      }
    };
    fetchSubscriptionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubscribe = async (priceId) => {
    setLoading(true);
    setSelectedPlan(priceId);
    try {
      const { checkout_url } = await createCheckoutSession(priceId);
      window.location.href = checkout_url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const { portal_url } = await createPortalSession();
      window.location.href = portal_url;
    } catch (error) {
      console.error("Error opening portal:", error);
    } finally {
      setLoading(false);
    }
  };

  const isPremium = user?.is_premium || subscriptionStatus?.is_premium;

  if (isPremium) {
    return (
      <div className="max-w-[680px] mx-auto py-4 flex flex-col gap-5">
        <button
          type="button"
          className="moorly-btn moorly-btn--ghost self-start"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={16} weight="bold" />
          <span>Back to Dashboard</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="moorly-card p-8 text-center flex flex-col items-center gap-4"
        >
          <div
            className="w-14 h-14 rounded-[16px] flex items-center justify-center"
            style={{ background: "var(--warm-soft)", color: "var(--warm-text)" }}
          >
            <Crown size={28} weight="fill" />
          </div>

          <div>
            <span className="moorly-pill moorly-pill--good mb-2">Active Plan</span>
            <h1 className="text-[28px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
              Expense Tracker Pro
            </h1>
            <p className="text-[14px] mt-1 max-w-[46ch]" style={{ color: "var(--muted)" }}>
              You have unlocked unlimited accounts, budgets, and automated PDF statement exports.
            </p>
          </div>

          {subscriptionStatus?.subscription && (
            <div
              className="w-full max-w-[400px] p-4 rounded-[14px] flex flex-col gap-2 text-[13.5px]"
              style={{
                background: "var(--card-2)",
                boxShadow: "inset 0 0 0 1px var(--line)",
              }}
            >
              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>Plan Tier</span>
                <strong style={{ color: "var(--ink)" }}>
                  {subscriptionStatus.subscription?.plan_name || "Pro Annual"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted)" }}>Status</span>
                <strong className="capitalize" style={{ color: "var(--good)" }}>
                  {subscriptionStatus.subscription?.status || "Active"}
                </strong>
              </div>
            </div>
          )}

          <MagneticButton
            onClick={handleManageBilling}
            disabled={loading}
            className="moorly-btn moorly-btn--primary moorly-btn--lg mt-2"
          >
            {loading ? "Opening Billing Portal..." : "Manage Subscription"}
          </MagneticButton>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[980px] mx-auto py-2 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="moorly-btn moorly-btn--ghost"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={16} weight="bold" />
          <span>Back to Dashboard</span>
        </button>

        <span className="moorly-pill moorly-pill--accent">
          Expense Tracker Pro
        </span>
      </div>

      <header className="flex flex-col gap-1.5">
        <h1 className="text-[30px] sm:text-[34px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
          Unlock the full power of Expense Tracker
        </h1>
        <p className="text-[14.5px] max-w-[60ch]" style={{ color: "var(--ink-2)" }}>
          Upgrade from the starter plan to unrestricted budgets, multiple accounts, custom categories, and professional reports.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {plans.map((plan, idx) => (
          <motion.article
            key={plan.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, type: "spring", stiffness: 380, damping: 30 }}
            className={`moorly-card p-6 sm:p-7 flex flex-col justify-between gap-6 ${
              plan.popular ? "moorly-kpi--sea" : ""
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h2 className="text-[20px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
                  {plan.name}
                </h2>
                <div className="flex items-center gap-1.5">
                  {plan.savings && (
                    <span className="moorly-pill moorly-pill--good">{plan.savings}</span>
                  )}
                  {plan.popular && (
                    <span className="moorly-pill moorly-pill--accent">Recommended</span>
                  )}
                </div>
              </div>

              <p className="text-[13px] mb-5" style={{ color: "var(--muted)" }}>
                {plan.subtitle}
              </p>

              <div className="flex items-baseline gap-1.5 mb-6">
                <span
                  className="text-[38px] font-bold font-mono tracking-tight leading-none"
                  style={{ color: "var(--ink)" }}
                >
                  {plan.price}
                </span>
                <span className="text-[13.5px] font-medium" style={{ color: "var(--muted)" }}>
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-2.5">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2.5 text-[13.5px] font-medium" style={{ color: "var(--ink-2)" }}>
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--good-soft)", color: "var(--good)" }}
                    >
                      <Check size={12} weight="bold" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <MagneticButton
              onClick={() => handleSubscribe(plan.priceId)}
              disabled={loading}
              className={`moorly-btn moorly-btn--lg w-full ${
                plan.popular ? "moorly-btn--primary" : "moorly-btn--dark"
              }`}
            >
              <Lightning size={17} weight="fill" />
              <span>
                {loading && selectedPlan === plan.priceId
                  ? "Preparing Checkout..."
                  : `Upgrade with ${plan.name}`}
              </span>
            </MagneticButton>
          </motion.article>
        ))}
      </div>
    </div>
  );
};

export default UpgradePage;
