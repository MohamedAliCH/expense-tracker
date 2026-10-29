import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  ArrowsClockwise,
  Plus,
  SignOut,
  Crown,
  MagnifyingGlass,
  Sun,
  Moon,
  SquaresFour,
  ArrowsLeftRight,
  ChartPieSlice,
  Wallet,
  Tag,
  CreditCard,
  CaretDown,
  CurrencyCircleDollar,
  GearSix,
} from "@phosphor-icons/react";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import MagneticButton from "./Common/MagneticButton";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: SquaresFour },
  { id: "transactions", label: "Transactions", path: "/transactions", icon: ArrowsLeftRight, countKey: "transactions" },
  { id: "budgets", label: "Budgets", path: "/budgets", icon: ChartPieSlice, countKey: "budgets" },
  { id: "accounts", label: "Accounts", path: "/accounts", icon: Wallet, countKey: "accounts" },
  { id: "categories", label: "Categories", path: "/categories", icon: Tag, countKey: "categories" },
  { id: "payments", label: "Payments", path: "/payments", icon: CreditCard },
];

const Header = ({ onAddTransaction, onOpenFinder, onOpenProfile, theme, onToggleTheme }) => {
  const { user, logout } = useAuth();
  const { refreshData, transactions, budgets, accounts, categories } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const counts = {
    transactions: transactions?.length || 0,
    budgets: budgets?.length || 0,
    accounts: accounts?.length || 0,
    categories: categories?.length || 0,
  };

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard" || location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setTimeout(() => setRefreshing(false), 600);
  };

  const initials = (user?.name || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-40 pt-2.5 px-3 sm:px-6">
        <div
          className="moorly-top max-w-[1500px] mx-auto rounded-[22px] px-2.5 sm:px-3.5 h-[58px] flex items-center gap-2"
        >
          {/* Brand Mark: Original App Name */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-[14px] transition-colors hover:bg-[var(--card-2)]"
            aria-label="Expense Tracker Dashboard"
          >
            <span
              className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(180deg, var(--accent-hi), var(--accent))",
                color: "var(--accent-ink)",
                boxShadow: "inset 0 1px 0 #ffffff40, 0 6px 14px -6px var(--accent)",
              }}
            >
              <CurrencyCircleDollar size={22} weight="duotone" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[15px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
                Expense Tracker
              </span>
              <span className="text-[11px] font-medium hidden xl:inline" style={{ color: "var(--muted)" }}>
                Financial Intelligence
              </span>
            </div>
          </Link>

          {/* Primary Center Navigation (Desktop) */}
          <nav
            className="hidden lg:flex items-center gap-1 p-1 rounded-[14px] mx-1"
            style={{ background: "var(--card-2)", boxShadow: "inset 0 0 0 1px var(--line)" }}
            aria-label="Primary"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              const count = item.countKey ? counts[item.countKey] : null;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.path)}
                  aria-current={active ? "page" : undefined}
                  className="relative h-[36px] px-3 rounded-[10px] text-[13px] font-semibold flex items-center gap-2 transition-colors"
                  style={{
                    color: active ? "var(--accent-ink)" : "var(--ink-2)",
                  }}
                >
                  {active && (
                    <motion.div
                      layoutId="moorlyTopNav"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-[10px]"
                      style={{
                        background: "linear-gradient(180deg, var(--accent-hi), var(--accent))",
                        boxShadow: "inset 0 1px 0 #ffffff38, 0 4px 12px -4px var(--accent)",
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon size={16} weight={active ? "fill" : "duotone"} />
                    <span>{item.label}</span>
                    {count !== null && count > 0 && (
                      <span
                        className="px-1.5 py-0.2 rounded-full text-[11px] font-mono leading-tight"
                        style={{
                          background: active ? "rgba(0,0,0,0.18)" : "var(--card-3)",
                          color: active ? "var(--accent-ink)" : "var(--muted)",
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="flex-1 min-w-[4px]" />

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Search Pill (Cmd+K) */}
            <button
              type="button"
              onClick={onOpenFinder}
              className="moorly-btn moorly-btn--sm hidden md:inline-flex items-center gap-2.5 px-3"
              style={{ background: "var(--card-2)", color: "var(--muted)" }}
              title="Search and quick actions (Ctrl+K)"
            >
              <MagnifyingGlass size={15} weight="bold" />
              <span className="text-[12.5px] font-medium">Search...</span>
              <span
                className="px-1.5 py-0.5 text-[10px] font-mono rounded"
                style={{ background: "var(--card-3)", color: "var(--ink-2)" }}
              >
                ⌘K
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenFinder}
              className="moorly-ibtn md:hidden"
              aria-label="Search"
            >
              <MagnifyingGlass size={17} weight="bold" />
            </button>

            {/* Theme Switcher */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="moorly-ibtn"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-label="Toggle color theme"
            >
              {theme === "dark" ? (
                <Sun size={18} weight="duotone" style={{ color: "var(--warm)" }} />
              ) : (
                <Moon size={18} weight="duotone" />
              )}
            </button>

            {/* Sync / Refresh */}
            <button
              type="button"
              onClick={handleRefresh}
              className="moorly-ibtn"
              title="Refresh financial data"
              aria-label="Refresh financial data"
            >
              <motion.span
                animate={{ rotate: refreshing ? 360 : 0 }}
                transition={{ duration: 0.65, ease: "easeInOut" }}
                className="flex items-center justify-center"
              >
                <ArrowsClockwise size={17} weight="bold" />
              </motion.span>
            </button>

            {/* Pro / Upgrade Pill */}
            <button
              type="button"
              onClick={() => navigate("/upgrade")}
              className="hidden sm:inline-flex moorly-pill"
              style={{
                background: user?.is_premium ? "var(--good-soft)" : "var(--warm-soft)",
                color: user?.is_premium ? "var(--good)" : "var(--warm-text)",
                height: "34px",
                padding: "0 12px",
                cursor: "pointer",
              }}
            >
              <Crown size={14} weight="fill" />
              <span>{user?.is_premium ? "Pro Active" : "Upgrade"}</span>
            </button>

            {/* Magnetic Primary CTA (+ Transaction) */}
            <MagneticButton
              onClick={onAddTransaction}
              className="moorly-btn moorly-btn--primary h-[38px] px-3.5 text-[13px]"
              ariaLabel="New Transaction"
            >
              <Plus size={16} weight="bold" />
              <span className="hidden sm:inline">Transaction</span>
            </MagneticButton>

            {/* Account Avatar Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="h-[38px] pl-1.5 pr-2.5 rounded-[12px] flex items-center gap-2 transition-colors"
                style={{
                  background: "var(--card-2)",
                  boxShadow: "inset 0 0 0 1px var(--line)",
                  color: "var(--ink)",
                }}
                aria-label="Account menu"
              >
                <span
                  className="w-7 h-7 rounded-[9px] text-[11px] font-bold flex items-center justify-center relative"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent-text)",
                  }}
                >
                  {initials}
                  <span
                    className="w-2 h-2 rounded-full absolute -bottom-0.5 -right-0.5"
                    style={{
                      background: "var(--good)",
                      boxShadow: "0 0 0 2px var(--bg)",
                    }}
                  />
                </span>
                <CaretDown size={13} weight="bold" style={{ color: "var(--muted)" }} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 420, damping: 30 }}
                      className="moorly-modal absolute right-0 mt-2.5 w-60 p-2 z-50"
                    >
                      <div
                        className="px-3 py-2.5 mb-1 rounded-[12px]"
                        style={{ background: "var(--card-2)" }}
                      >
                        <p className="text-[13.5px] font-bold truncate" style={{ color: "var(--ink)" }}>
                          {user?.name || "User"}
                        </p>
                        <p className="text-[12px] truncate" style={{ color: "var(--muted)" }}>
                          {user?.email || "user@example.com"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          if (onOpenProfile) onOpenProfile();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13px] font-semibold transition-colors hover:bg-[var(--card-2)] text-left"
                        style={{ color: "var(--ink-2)" }}
                      >
                        <GearSix size={16} weight="duotone" style={{ color: "var(--accent)" }} />
                        <span>Profile & Preferences</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate("/upgrade");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13px] font-semibold transition-colors hover:bg-[var(--card-2)] text-left"
                        style={{ color: "var(--ink-2)" }}
                      >
                        <Crown size={16} weight="duotone" style={{ color: "var(--warm)" }} />
                        <span>Manage Subscription</span>
                      </button>

                      <button
                        type="button"
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13px] font-semibold transition-colors hover:bg-[var(--bad-soft)] text-left mt-0.5"
                        style={{ color: "var(--bad)" }}
                      >
                        <SignOut size={16} weight="bold" />
                        <span>Sign out</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Floating Bottom Tabbar */}
      <nav
        className="moorly-tabbar lg:hidden fixed z-40 left-2.5 right-2.5 bottom-2.5 rounded-[22px] p-1.5 grid grid-cols-6 gap-1"
        aria-label="Mobile Navigation"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              className="relative h-[50px] rounded-[15px] flex flex-col items-center justify-center gap-0.5 text-[10.5px] font-semibold transition-colors"
              style={{
                color: active ? "var(--accent-text)" : "var(--muted)",
                background: active ? "var(--accent-soft)" : "transparent",
              }}
            >
              <Icon size={18} weight={active ? "fill" : "duotone"} />
              <span className="truncate max-w-full px-1">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default Header;
