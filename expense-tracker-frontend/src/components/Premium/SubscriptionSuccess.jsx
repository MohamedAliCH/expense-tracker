import React, { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import "./SubscriptionSuccess.css";
import { useAuth } from "../../contexts/AuthContext";

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Refresh user data to get the new premium status
    refreshUser();

    if (!sessionId) {
      setTimeout(() => navigate("/dashboard"), 3000);
    }
  }, [sessionId, navigate, refreshUser]);

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon-wrapper">
          <CheckCircle className="success-icon" size={64} />
        </div>
        <h1>Payment Successful! 🎉</h1>

        <p className="success-message">
          Thank you for upgrading to Premium! Your account has been instantly
          upgraded. You now have access to unlimited budgets, accounts, and
          analytics.
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
