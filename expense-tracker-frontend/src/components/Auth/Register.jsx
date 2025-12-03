/**
 * REGISTER COMPONENT
 *
 * Registration form with:
 * - Name input
 * - Email input
 * - Password input
 * - Confirm password input
 * - Link to login
 */

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { UserPlus } from "lucide-react";
import "./Auth.css";

const Register = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.password_confirmation
    );

    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <UserPlus size={48} color="#a855f7" className="auth-icon" />
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Sign up to start tracking expenses</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-form">
          <div className="auth-form-group">
            <label className="auth-label">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="auth-input"
              placeholder="John Doe"
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="auth-input"
              placeholder="john@example.com"
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="auth-input"
              placeholder="••••••••"
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Confirm Password</label>
            <input
              type="password"
              value={formData.password_confirmation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password_confirmation: e.target.value,
                })
              }
              className="auth-input"
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="auth-button"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

          <p className="auth-footer">
            Already have an account?{" "}
            <button onClick={onSwitchToLogin} className="auth-link">
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
