import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Loader } from "lucide-react";
import { CheckCircle, ArrowRight, Loader } from "lucide-react";
import "./SubscriptionSuccess.css";
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
    const maxAttempts = 10; // Try for 20 seconds (10 * 2000ms)

    const checkStatus = async () => {
      // If already premium, stop verifying
      if (user?.is_premium) {
        setVerifying(false);
        return;
      }

      await refreshUser(); // Fetch latest user data
      attempts++;

      // Continue polling if not yet premium and attempts remain
      if (attempts < maxAttempts && !user?.is_premium) {
        setTimeout(checkStatus, 2000);
      } else {
        setVerifying(false); // Stop loading regardless of result
      }
    };

    checkStatus();
  }, [sessionId, navigate, refreshUser, user?.is_premium]);

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon-wrapper">
          {verifying ? (
            <Loader className="success-icon spin-animation" size={64} />
          ) : (
            <CheckCircle className="success-icon" size={64} />
          )}
        </div>

        <h1>{verifying ? "Verifying Payment..." : "Payment Successful! 🎉"}</h1>

        <p className="success-message">
          {verifying
            ? "Please wait while we confirm your subscription with Stripe."
            : "Thank you for upgrading to Premium! Your account has been instantly upgraded. You now have access to unlimited budgets, accounts, and analytics."}
        </p>

        <div className="success-actions">
          <Link to="/dashboard" className="dashboard-btn">
            Go to Dashboard <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
