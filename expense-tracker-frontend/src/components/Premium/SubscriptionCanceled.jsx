import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { XCircle, ArrowRight } from "@phosphor-icons/react";

const SubscriptionCanceled = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/upgrade"), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="max-w-[520px] mx-auto py-12 px-4">
      <div className="moorly-card p-8 text-center flex flex-col items-center gap-4">
        <div
          className="w-14 h-14 rounded-[16px] flex items-center justify-center"
          style={{ background: "var(--bad-soft)", color: "var(--bad)" }}
        >
          <XCircle size={28} weight="fill" />
        </div>

        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
          Checkout Canceled
        </h1>

        <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
          No charges were placed on your account. Returning you to the underwriting tiers shortly...
        </p>

        <Link to="/upgrade" className="moorly-btn moorly-btn--primary mt-2">
          <span>Return to Tiers</span>
          <ArrowRight size={16} weight="bold" />
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionCanceled;
