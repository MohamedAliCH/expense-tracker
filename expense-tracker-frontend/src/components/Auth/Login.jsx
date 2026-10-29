import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { CurrencyCircleDollar } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import MagneticButton from "../Common/MagneticButton";

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 450);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (!result.success) {
      setError(result.message || "Invalid email or password.");
      triggerShake();
    }
    setLoading(false);
  };

  const fillDemo = () => {
    setFormData({
      email: "john@example.com",
      password: "password123",
    });
    setError("");
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          x: shakeError ? [0, -8, 7, -5, 3, 0] : 0,
        }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="moorly-signin moorly-card w-full max-w-[420px] p-7 sm:p-8 flex flex-col gap-5"
      >
        <div className="flex flex-col items-start gap-3">
          <span
            className="w-11 h-11 rounded-[14px] flex items-center justify-center"
            style={{
              background: "linear-gradient(180deg, var(--accent-hi), var(--accent))",
              color: "var(--accent-ink)",
              boxShadow: "inset 0 1px 0 #ffffff40, 0 8px 18px -8px var(--accent)",
            }}
          >
            <CurrencyCircleDollar size={26} weight="duotone" />
          </span>

          <div>
            <h1 className="text-[24px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
              Sign in to Expense Tracker
            </h1>
            <p className="text-[13.5px] mt-0.5" style={{ color: "var(--muted)" }}>
              Manage your finances with powerful analytics and smart budgets.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              Email address
            </span>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setError("");
              }}
              className="moorly-input"
              placeholder="john@example.com"
              autoComplete="username"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              Password
            </span>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                setError("");
              }}
              className="moorly-input"
              style={
                error
                  ? { boxShadow: "inset 0 0 0 1.5px var(--bad)" }
                  : undefined
              }
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {error && (
              <small className="text-[12px] font-semibold mt-0.5" style={{ color: "var(--bad)" }}>
                {error}
              </small>
            )}
          </label>

          <MagneticButton
            type="submit"
            disabled={loading}
            className="moorly-btn moorly-btn--primary moorly-btn--lg w-full mt-1"
          >
            {loading ? "Signing in..." : "Sign in"}
          </MagneticButton>
        </form>

        <div
          className="p-3.5 rounded-[12px] flex items-center justify-between gap-2"
          style={{
            background: "var(--card-2)",
            boxShadow: "inset 0 0 0 1px var(--line)",
          }}
        >
          <div className="text-[12px]" style={{ color: "var(--ink-2)" }}>
            <div className="font-semibold" style={{ color: "var(--ink)" }}>
              Demo Account
            </div>
            <div className="font-mono text-[11px]" style={{ color: "var(--muted)" }}>
              john@example.com · password123
            </div>
          </div>
          <button
            type="button"
            onClick={fillDemo}
            className="moorly-btn moorly-btn--sm"
          >
            Autofill
          </button>
        </div>

        <p className="text-center text-[13px]" style={{ color: "var(--muted)" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold underline underline-offset-4"
            style={{ color: "var(--accent-text)" }}
          >
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
