import React from "react";
import { useNavigate } from "react-router-dom";
import { PencilSimple, Trash, Wallet, Bank, CreditCard, ArrowRight } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useApp } from "../../contexts/AppContext";

const AccountCard = ({ account, onEdit, onDelete, index = 0 }) => {
  const navigate = useNavigate();
  const { currency = "$" } = useApp() || {};
  const balance = parseFloat(account.balance || 0);
  const isPositive = balance >= 0;

  const typeConfig = {
    bank: {
      icon: Bank,
      label: "Bank Account",
      tone: "var(--c-hull)",
    },
    credit_card: {
      icon: CreditCard,
      label: "Credit Card",
      tone: "var(--c-charter)",
    },
    wallet: {
      icon: Wallet,
      label: "Cash / Wallet",
      tone: "var(--c-marina)",
    },
  };

  const config = typeConfig[account.type] || typeConfig.wallet;
  const Icon = config.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 380, damping: 30 }}
      whileHover={{ y: -3 }}
      className="moorly-card flex flex-col justify-between min-h-[175px] group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className="w-9 h-9 rounded-[11px] flex items-center justify-center"
            style={{
              background: "var(--card-3)",
              color: config.tone,
            }}
          >
            <Icon size={18} weight="duotone" />
          </span>
          <div>
            <h3 className="text-[15px] font-bold leading-tight" style={{ color: "var(--ink)" }}>
              {account.name}
            </h3>
            <span className="text-[11.5px] font-medium" style={{ color: "var(--muted)" }}>
              {config.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-0.5 opacity-75 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(account)}
            className="w-7 h-7 rounded-[8px] flex items-center justify-center hover:bg-[var(--card-3)] transition-colors"
            style={{ color: "var(--ink-2)" }}
            aria-label="Edit Account"
          >
            <PencilSimple size={15} weight="duotone" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(account.id)}
            className="w-7 h-7 rounded-[8px] flex items-center justify-center hover:bg-[var(--bad-soft)] transition-colors"
            style={{ color: "var(--bad)" }}
            aria-label="Delete Account"
          >
            <Trash size={15} weight="duotone" />
          </button>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t flex flex-col gap-3" style={{ borderColor: "var(--line)" }}>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--muted)" }}>
              Current Balance
            </p>
            <p
              className="text-[24px] font-bold font-mono tracking-tight leading-none"
              style={{ color: isPositive ? "var(--ink)" : "var(--bad)" }}
            >
              {isPositive ? "" : "-"}{currency}{Math.abs(balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <span className={`moorly-pill ${isPositive ? "moorly-pill--good" : "moorly-pill--bad"}`}>
            {isPositive ? "Available" : "Overdrawn"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/transactions?account=${account.id}`)}
          className="w-full moorly-btn moorly-btn--sm moorly-btn--ghost !h-7 !text-[12px] flex items-center justify-between"
          title="Filter transactions by this account"
        >
          <span>View Account Ledger</span>
          <ArrowRight size={13} weight="bold" />
        </button>
      </div>
    </motion.article>
  );
};

export default AccountCard;
