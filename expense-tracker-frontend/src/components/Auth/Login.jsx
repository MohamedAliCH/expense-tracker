/**
 * LOGIN COMPONENT
 *
 * Login form with:
 * - Email input
 * - Password input
 * - Remember me checkbox
 * - Link to register
 */

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { LogIn } from "lucide-react";
import "./Auth.css";

const Login = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <LogIn size={48} color="#a855f7" className="auth-icon" />
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Login to your expense tracker</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-form">
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

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="auth-button"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="auth-footer">
            Don't have an account?{" "}
            <button onClick={onSwitchToRegister} className="auth-link">
              Register
            </button>
          </p>

          <div className="auth-demo-info">
            <p className="auth-demo-title">Demo Account:</p>
            <p className="auth-demo-credentials">
              Email: john@example.com
              <br />
              Password: password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
