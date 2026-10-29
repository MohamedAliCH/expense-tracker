import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlass,
  SquaresFour,
  ArrowsLeftRight,
  ChartPieSlice,
  Wallet,
  Tag,
  CreditCard,
  Plus,
  Sun,
  Moon,
  Crown,
  ArrowUpRight,
  GearSix,
  Sparkle,
} from "@phosphor-icons/react";
import { useApp } from "../../contexts/AppContext";

const CommandFinder = ({
  show,
  onClose,
  onAddTransaction,
  onOpenProfile,
  onOpenAdvisor,
  theme,
  onToggleTheme,
}) => {
  const navigate = useNavigate();
  const { transactions, categories, accounts, budgets } = useApp();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (show) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [show]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();

    const baseActions = [
      {
        id: "act-ai-advisor",
        group: "Quick Actions",
        title: "Ask Oceanic AI Advisor",
        subtitle: "Ledger Q&A, What-If simulation & cashflow analysis",
        kbd: "A",
        icon: Sparkle,
        action: () => {
          if (onOpenAdvisor) onOpenAdvisor();
          onClose();
        },
      },
      {
        id: "act-new-tx",
        group: "Quick Actions",
        title: "Log new transaction",
        subtitle: "Record an income or expense entry",
        kbd: "N",
        icon: Plus,
        action: () => {
          onClose();
          onAddTransaction();
        },
      },
      {
        id: "act-transfer",
        group: "Quick Actions",
        title: "Transfer funds between accounts",
        subtitle: "Move balance between checking, wallet, or card",
        kbd: "X",
        icon: ArrowsLeftRight,
        action: () => {
          navigate("/accounts");
          onClose();
        },
      },
      {
        id: "act-import-csv",
        group: "Quick Actions",
        title: "Import bank statement CSV",
        subtitle: "Bulk upload transactions from bank export",
        kbd: "I",
        icon: ArrowsLeftRight,
        action: () => {
          navigate("/transactions");
          onClose();
        },
      },
      {
        id: "act-theme",
        group: "Quick Actions",
        title: `Switch to ${theme === "dark" ? "Light" : "Dark"} mode`,
        subtitle: "Toggle color theme",
        kbd: "T",
        icon: theme === "dark" ? Sun : Moon,
        action: () => {
          onToggleTheme();
          onClose();
        },
      },
      {
        id: "act-profile",
        group: "Quick Actions",
        title: "Account & Preferences",
        subtitle: "Edit name, email, security password, and currency symbol",
        kbd: "P",
        icon: GearSix,
        action: () => {
          if (onOpenProfile) onOpenProfile();
          onClose();
        },
      },
      {
        id: "nav-desk",
        group: "Navigation",
        title: "Dashboard",
        subtitle: "Overview, summary cards & monthly trend",
        kbd: "G D",
        icon: SquaresFour,
        action: () => {
          navigate("/dashboard");
          onClose();
        },
      },
      {
        id: "nav-tx",
        group: "Navigation",
        title: "Transactions",
        subtitle: `${transactions?.length || 0} recorded transactions`,
        kbd: "G T",
        icon: ArrowsLeftRight,
        action: () => {
          navigate("/transactions");
          onClose();
        },
      },
      {
        id: "nav-budgets",
        group: "Navigation",
        title: "Budgets",
        subtitle: `${budgets?.length || 0} active spending budgets`,
        kbd: "G B",
        icon: ChartPieSlice,
        action: () => {
          navigate("/budgets");
          onClose();
        },
      },
      {
        id: "nav-accounts",
        group: "Navigation",
        title: "Accounts",
        subtitle: `${accounts?.length || 0} connected wallets & bank accounts`,
        kbd: "G A",
        icon: Wallet,
        action: () => {
          navigate("/accounts");
          onClose();
        },
      },
      {
        id: "nav-categories",
        group: "Navigation",
        title: "Categories",
        subtitle: `${categories?.length || 0} expense & income categories`,
        kbd: "G C",
        icon: Tag,
        action: () => {
          navigate("/categories");
          onClose();
        },
      },
      {
        id: "nav-payments",
        group: "Navigation",
        title: "Payments & Billing",
        subtitle: "Subscription history and sync",
        icon: CreditCard,
        action: () => {
          navigate("/payments");
          onClose();
        },
      },
      {
        id: "nav-upgrade",
        group: "Navigation",
        title: "Upgrade to Pro",
        subtitle: "Unlimited budgets, accounts, and features",
        icon: Crown,
        action: () => {
          navigate("/upgrade");
          onClose();
        },
      },
    ];

    const txItems = (transactions || []).slice(0, 25).map((t) => ({
      id: `tx-${t.id}`,
      group: "Recent Transactions",
      title: t.description || "Untitled transaction",
      subtitle: `${t.type === "income" ? "+" : "-"}$${Math.abs(parseFloat(t.amount || 0)).toFixed(2)} · ${new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      icon: ArrowUpRight,
      action: () => {
        navigate("/transactions");
        onClose();
      },
    }));

    const all = [...baseActions, ...txItems];
    if (!q) return all.slice(0, 9);

    return all
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.group.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [query, transactions, budgets, accounts, categories, theme, navigate, onClose, onAddTransaction, onOpenProfile, onOpenAdvisor, onToggleTheme]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (items.length ? (prev + 1) % items.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (items.length ? (prev - 1 + items.length) % items.length : 0));
      } else if (e.key === "Enter" && items[selectedIndex]) {
        e.preventDefault();
        items[selectedIndex].action();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show, items, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[75] flex items-start justify-center pt-[12vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/35 backdrop-blur-[4px]"
          />

          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="moorly-finder relative z-10 w-full max-w-[640px] overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Quick command finder"
          >
            {/* Search Input Bar */}
            <div
              className="flex items-center gap-3 h-[60px] px-5"
              style={{ borderBottom: "1px solid var(--line)" }}
            >
              <MagnifyingGlass size={20} weight="bold" style={{ color: "var(--muted)" }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search transactions, jump to page, or run an action..."
                className="flex-1 bg-transparent border-0 outline-none text-[17px] font-medium"
                style={{ color: "var(--ink)" }}
              />
              <button
                type="button"
                onClick={onClose}
                className="px-2 py-1 text-[11px] font-mono rounded-md"
                style={{
                  background: "var(--card-3)",
                  color: "var(--muted)",
                }}
              >
                ESC
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-[380px] overflow-y-auto p-2.5 space-y-1">
              {items.length > 0 ? (
                items.map((item, idx) => {
                  const Icon = item.icon;
                  const active = idx === selectedIndex;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02, duration: 0.2 }}
                      type="button"
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={item.action}
                      className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-[12px] text-left transition-colors"
                      style={{
                        background: active ? "var(--accent-soft)" : "transparent",
                        color: active ? "var(--accent-text)" : "var(--ink)",
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
                          style={{
                            background: active ? "var(--accent)" : "var(--card-2)",
                            color: active ? "var(--accent-ink)" : "var(--ink-2)",
                          }}
                        >
                          <Icon size={17} weight="duotone" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-semibold truncate">{item.title}</div>
                          <div
                            className="text-[12px] truncate"
                            style={{ color: "var(--muted)" }}
                          >
                            {item.group} · {item.subtitle}
                          </div>
                        </div>
                      </div>

                      {item.kbd && (
                        <span
                          className="px-2 py-0.5 text-[11px] font-mono rounded-md flex-shrink-0"
                          style={{
                            background: "var(--card-3)",
                            color: "var(--muted)",
                          }}
                        >
                          {item.kbd}
                        </span>
                      )}
                    </motion.button>
                  );
                })
              ) : (
                <div className="py-12 text-center text-sm" style={{ color: "var(--muted)" }}>
                  No matching transactions or commands found.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandFinder;
