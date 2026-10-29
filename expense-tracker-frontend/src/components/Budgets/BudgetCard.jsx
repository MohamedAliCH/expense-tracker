import React from "react";
import { PencilSimple, Trash } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import CategoryIcon from "../Common/CategoryIcon";
import { useApp } from "../../contexts/AppContext";

const BudgetCard = ({ budget, onEdit, onDelete, index = 0 }) => {
  const { currency = "$" } = useApp() || {};
  const isExceeded = budget.percentage > 100;
  const isWarning = budget.percentage >= 80 && budget.percentage <= 100;
  const percentage = Math.min(budget.percentage, 100);
  const color = budget.color || "#2a9d8f";

  const pillClass = isExceeded
    ? "moorly-pill--bad"
    : isWarning
    ? "moorly-pill--warn"
    : "moorly-pill--good";

  const statusText = isExceeded
    ? "Exceeded"
    : isWarning
    ? "Near limit"
    : "On track";

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 380, damping: 30 }}
      whileHover={{ y: -3 }}
      className="moorly-card flex flex-col justify-between gap-5 group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: `${color}22`,
              color: color,
              boxShadow: "inset 0 0 0 1px var(--line)",
            }}
          >
            <CategoryIcon
              iconKey={budget.emoji}
              categoryName={budget.category}
              size={20}
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold truncate" style={{ color: "var(--ink)" }}>
              {budget.category}
            </h3>
            <span className="text-[12px] font-medium capitalize" style={{ color: "var(--muted)" }}>
              {budget.period} cycle
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className={`moorly-pill ${pillClass}`}>{statusText}</span>
          <div className="flex items-center gap-0.5 ml-1 opacity-75 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEdit(budget)}
              className="w-7 h-7 rounded-[8px] flex items-center justify-center hover:bg-[var(--card-3)] transition-colors"
              style={{ color: "var(--ink-2)" }}
              aria-label="Edit budget"
            >
              <PencilSimple size={15} weight="duotone" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(budget.id)}
              className="w-7 h-7 rounded-[8px] flex items-center justify-center hover:bg-[var(--bad-soft)] transition-colors"
              style={{ color: "var(--bad)" }}
              aria-label="Delete budget"
            >
              <Trash size={15} weight="duotone" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <div>
            <p className="text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
              Spent
            </p>
            <p className="text-[22px] font-bold font-mono tracking-tight" style={{ color: "var(--ink)" }}>
              {currency}{parseFloat(budget.spent || 0).toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
              Budget Limit
            </p>
            <p className="text-[15px] font-semibold font-mono" style={{ color: "var(--ink-2)" }}>
              {currency}{parseFloat(budget.amount || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div
          className="relative h-2 rounded-full overflow-hidden"
          style={{ background: "var(--card-3)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-0 left-0 h-full rounded-full relative overflow-hidden"
            style={{
              backgroundColor: isExceeded ? "var(--bad)" : color,
            }}
          >
            <div
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)",
                animation: "shimmerWave 2.4s infinite ease-in-out",
              }}
            />
          </motion.div>
        </div>

        <div className="flex items-center justify-between text-[12px] font-semibold">
          <span
            style={{
              color:
                parseFloat(budget.remaining || 0) > 0 && !isExceeded
                  ? "var(--good)"
                  : "var(--bad)",
            }}
          >
            {!isExceeded
              ? `${currency}${parseFloat(budget.remaining || 0).toFixed(2)} remaining`
              : `${currency}${Math.abs(parseFloat(budget.spent || 0) - parseFloat(budget.amount || 0)).toFixed(2)} over limit`}
          </span>
          <span className="font-mono" style={{ color: isExceeded ? "var(--bad)" : "var(--muted)" }}>
            {budget.percentage.toFixed(0)}%
          </span>
        </div>
      </div>
    </motion.article>
  );
};

export default BudgetCard;
