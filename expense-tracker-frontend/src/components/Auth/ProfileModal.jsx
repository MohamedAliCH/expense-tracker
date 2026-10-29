import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useApp } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";
import { updateUserProfile, updateUserPassword } from "../../utils/api";
import MoorlyModal from "../Common/MoorlyModal";
import { User, LockKey, CurrencyCircleDollar, Check } from "@phosphor-icons/react";
import { motion } from "framer-motion";

const CURRENCY_OPTIONS = [
  { symbol: "$", code: "USD", name: "US Dollar ($)" },
  { symbol: "€", code: "EUR", name: "Euro (€)" },
  { symbol: "£", code: "GBP", name: "British Pound (£)" },
  { symbol: "DH", code: "MAD", name: "Moroccan Dirham (DH)" },
  { symbol: "CA$", code: "CAD", name: "Canadian Dollar (CA$)" },
  { symbol: "¥", code: "JPY", name: "Japanese Yen (¥)" },
];

const ProfileModal = ({ show, onClose }) => {
  const { user, setUser, refreshUser } = useAuth();
  const { currency, setCurrency } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("profile"); // 'profile', 'security', 'preferences'
  const [profileData, setProfileData] = useState({ name: "", email: "" });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  useEffect(() => {
    if (user && show) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
      });
      setPasswordData({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
    }
  }, [user, show]);

  const triggerWiggle = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 450);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name || !profileData.email) {
      triggerWiggle();
      showToast("Please provide both name and email.", "error");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await updateUserProfile(profileData);
      if (res.user) {
        setUser(res.user);
      }
      await refreshUser();
      showToast("Profile details updated successfully.", "success");
    } catch (err) {
      triggerWiggle();
      showToast(err.userMessage || err.message || "Failed to update profile.", "error");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.current_password || !passwordData.password) {
      triggerWiggle();
      showToast("Please fill in current and new password.", "error");
      return;
    }
    if (passwordData.password.length < 8) {
      triggerWiggle();
      showToast("New password must be at least 8 characters.", "error");
      return;
    }
    if (passwordData.password !== passwordData.password_confirmation) {
      triggerWiggle();
      showToast("Password confirmation does not match.", "error");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updateUserPassword(passwordData);
      showToast("Security password updated successfully.", "success");
      setPasswordData({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
    } catch (err) {
      triggerWiggle();
      showToast(err.userMessage || err.message || "Failed to update password.", "error");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <MoorlyModal
      show={show}
      onClose={onClose}
      title="Account & Preferences"
      subtitle="Manage profile identity, security credentials, and currency"
      maxWidth="max-w-[480px]"
      shake={shakeError}
    >
      <div className="p-6 flex flex-col gap-5">
        {/* Navigation Tabs */}
        <div className="moorly-seg w-full">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "security", label: "Security", icon: LockKey },
            { id: "preferences", label: "Currency", icon: CurrencyCircleDollar },
          ].map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`moorly-seg__btn flex-1 justify-center gap-1.5 ${active ? "is-active" : ""}`}
              >
                {active && (
                  <motion.span
                    layoutId="profileModalSeg"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-[8px]"
                    style={{
                      background: "var(--card)",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.12), inset 0 0 0 1px var(--line)",
                    }}
                  />
                )}
                <Icon size={14} weight={active ? "bold" : "regular"} className="relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="moorly-input"
                placeholder="Your full name"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
                Email Address
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="moorly-input"
                placeholder="name@example.com"
                required
              />
            </div>

            <div
              className="flex items-center justify-end gap-2.5 pt-4 mt-2"
              style={{ borderTop: "1px solid var(--line)" }}
            >
              <button type="button" onClick={onClose} className="moorly-btn moorly-btn--ghost">
                Close
              </button>
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="moorly-btn moorly-btn--primary"
              >
                {isUpdatingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.current_password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, current_password: e.target.value })
                }
                className="moorly-input"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
                New Password (minimum 8 characters)
              </label>
              <input
                type="password"
                value={passwordData.password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, password: e.target.value })
                }
                className="moorly-input"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.password_confirmation}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    password_confirmation: e.target.value,
                  })
                }
                className="moorly-input"
                placeholder="••••••••"
                required
              />
            </div>

            <div
              className="flex items-center justify-end gap-2.5 pt-4 mt-2"
              style={{ borderTop: "1px solid var(--line)" }}
            >
              <button type="button" onClick={onClose} className="moorly-btn moorly-btn--ghost">
                Close
              </button>
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="moorly-btn moorly-btn--primary"
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        )}

        {/* Preferences / Currency Tab */}
        {activeTab === "preferences" && (
          <div className="flex flex-col gap-3.5">
            <p className="text-[13px]" style={{ color: "var(--ink-2)" }}>
              Choose your preferred display currency symbol for amounts across ledgers and summary cards:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {CURRENCY_OPTIONS.map((opt) => {
                const active = currency === opt.symbol;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => {
                      setCurrency(opt.symbol);
                      showToast(`Currency updated to ${opt.name}`, "success");
                    }}
                    className={`p-3 rounded-[12px] flex items-center justify-between text-left transition-all ${
                      active ? "ring-2" : "hover:bg-[var(--card-2)]"
                    }`}
                    style={{
                      background: active ? "var(--accent-soft)" : "var(--card-2)",
                      borderColor: active ? "var(--accent)" : "var(--line)",
                      ringColor: "var(--accent)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <div>
                      <span className="font-bold font-mono text-[15px] block" style={{ color: "var(--ink)" }}>
                        {opt.symbol}
                      </span>
                      <span className="text-[11.5px] font-medium block" style={{ color: "var(--muted)" }}>
                        {opt.name}
                      </span>
                    </div>
                    {active && (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "var(--accent)", color: "#fff" }}
                      >
                        <Check size={12} weight="bold" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div
              className="flex items-center justify-end pt-4 mt-2"
              style={{ borderTop: "1px solid var(--line)" }}
            >
              <button type="button" onClick={onClose} className="moorly-btn moorly-btn--primary">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </MoorlyModal>
  );
};

export default ProfileModal;

