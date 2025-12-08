import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { XCircle, ArrowRight } from "lucide-react";
import "./SubscriptionSuccess.css"; // Reuse success styles

const SubscriptionCanceled = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => navigate("/upgrade"), 5000);
  }, [navigate]);

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon-wrapper" style={{ color: "#ef4444" }}>
          <XCircle className="success-icon" size={64} />
        </div>
        <h1>Payment Canceled</h1>

        <p className="success-message">
          You haven't been charged. If you faced any issues, please try again or
          contact support. Redirecting you back to plans...
        </p>

        <div className="success-actions">
          <Link
            to="/upgrade"
            className="dashboard-btn"
            style={{ backgroundColor: "#ef4444" }}
          >
            Return to Plans <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCanceled;
