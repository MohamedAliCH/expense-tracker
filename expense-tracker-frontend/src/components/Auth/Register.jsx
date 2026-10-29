import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { CurrencyCircleDollar } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import MagneticButton from "../Common/MagneticButton";

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
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

    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match.");
      triggerShake();
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
      setError(result.message || "Registration could not be completed.");
      triggerShake();
    }
    setLoading(false);
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
        className="moorly-signin moorly-card w-full max-w-[440px] p-7 sm:p-8 flex flex-col gap-5"
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
              Create Account
            </h1>
            <p className="text-[13.5px] mt-0.5" style={{ color: "var(--muted)" }}>
              Start tracking your expenses and managing budgets.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              Full name
            </span>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="moorly-input"
              placeholder="John Doe"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              Email address
            </span>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="moorly-input"
              placeholder="john@example.com"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
                Password
              </span>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="moorly-input"
                placeholder="••••••••"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
                Confirm
              </span>
              <input
                type="password"
                value={formData.password_confirmation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password_confirmation: e.target.value,
                  })
                }
                className="moorly-input"
                placeholder="••••••••"
              />
            </label>
          </div>

          {error && (
            <small className="text-[12px] font-semibold" style={{ color: "var(--bad)" }}>
              {error}
            </small>
          )}

          <MagneticButton
            type="submit"
            disabled={loading}
            className="moorly-btn moorly-btn--primary moorly-btn--lg w-full mt-1"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </MagneticButton>
        </form>

        <p className="text-center text-[13px]" style={{ color: "var(--muted)" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold underline underline-offset-4"
            style={{ color: "var(--accent-text)" }}
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
