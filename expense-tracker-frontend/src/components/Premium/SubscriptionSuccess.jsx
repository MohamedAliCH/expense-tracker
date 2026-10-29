import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, ArrowsClockwise } from "@phosphor-icons/react";
import { useAuth } from "../../contexts/AuthContext";

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const sessionId = searchParams.get("session_id");
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      navigate("/dashboard");
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    const checkStatus = async () => {
      if (user?.is_premium) {
        setVerifying(false);
        return;
      }

      await refreshUser();
      attempts++;

      if (attempts < maxAttempts && !user?.is_premium) {
        setTimeout(checkStatus, 2000);
      } else {
        setVerifying(false);
      }
    };

    checkStatus();
  }, [sessionId, navigate, refreshUser, user?.is_premium]);

  return (
    <div className="max-w-[520px] mx-auto py-12 px-4">
      <div className="moorly-card p-8 text-center flex flex-col items-center gap-4">
        <div
          className="w-14 h-14 rounded-[16px] flex items-center justify-center"
          style={{
            background: verifying ? "var(--accent-soft)" : "var(--good-soft)",
            color: verifying ? "var(--accent-text)" : "var(--good)",
          }}
        >
          {verifying ? (
            <ArrowsClockwise size={28} weight="bold" className="animate-spin" />
          ) : (
            <CheckCircle size={28} weight="fill" />
          )}
        </div>

        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
          {verifying ? "Binding Coverage..." : "Pro Tier Bound"}
        </h1>

        <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
          {verifying
            ? "Confirming your settlement details with Stripe."
            : "Your Moorly desk has been upgraded with unlimited budget tide lines, vaults, and exports."}
        </p>

        <Link to="/dashboard" className="moorly-btn moorly-btn--primary mt-2">
          <span>Return to Desk</span>
          <ArrowRight size={16} weight="bold" />
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
