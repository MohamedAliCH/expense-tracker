import React from "react";
import {
  TrendUp,
  TrendDown,
  PiggyBank,
  WarningCircle,
  CheckCircle,
  Sparkle,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

const FinancialPulse = ({
  financialSummary = {},
  monthlyData = [],
  budgetAnalysis = [],
  currency = "$",
}) => {
  const totalIncome = parseFloat(financialSummary.totalIncome || 0);
  const totalExpense = parseFloat(financialSummary.totalExpense || 0);

  // Compute Net Savings Rate
  const savingsRate =
    totalIncome > 0
      ? Math.max(-100, Math.min(100, ((totalIncome - totalExpense) / totalIncome) * 100))
      : 0;

  // Compute Month-over-Month Delta
  let momExpenseDelta = null;
  let momIncomeDelta = null;

  if (Array.isArray(monthlyData) && monthlyData.length >= 2) {
    const current = monthlyData[monthlyData.length - 1];
    const previous = monthlyData[monthlyData.length - 2];

    const curExp = parseFloat(current.expense || 0);
    const prevExp = parseFloat(previous.expense || 0);
    if (prevExp > 0) {
      momExpenseDelta = ((curExp - prevExp) / prevExp) * 100;
    }

    const curInc = parseFloat(current.income || 0);
    const prevInc = parseFloat(previous.income || 0);
    if (prevInc > 0) {
      momIncomeDelta = ((curInc - prevInc) / prevInc) * 100;
    }
  }

  // Scan Category Budget Pace Alerts
  const criticalBudgets = (budgetAnalysis || []).filter(
    (b) => (parseFloat(b.percentage) || 0) >= 75
  );

  const highestRiskBudget =
    criticalBudgets.length > 0
      ? criticalBudgets.sort((a, b) => (parseFloat(b.percentage) || 0) - (parseFloat(a.percentage) || 0))[0]
      : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="moorly-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
      style={{
        background: "var(--card)",
        borderColor: "var(--line)",
      }}
      aria-label="Financial Pulse Insights"
    >
      <div className="flex items-center gap-3.5">
        <span
          className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
          style={{
            background: "var(--accent-soft)",
            color: "var(--accent-text)",
            boxShadow: "inset 0 0 0 1px var(--line)",
          }}
        >
          <Sparkle size={20} weight="duotone" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
              Financial Pulse
            </h2>
            <span className="moorly-pill moorly-pill--plain text-[10.5px] font-mono">
              Live Analysis
            </span>
          </div>
          <p className="text-[12.5px] mt-0.5" style={{ color: "var(--muted)" }}>
            {highestRiskBudget ? (
              <span className="inline-flex items-center gap-1.5 font-medium" style={{ color: "var(--warm-text)" }}>
                <WarningCircle size={14} weight="bold" />
                <span>
                  {highestRiskBudget.category_name} is pacing at{" "}
                  <strong>{Math.round(highestRiskBudget.percentage)}%</strong> of monthly limit
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5" style={{ color: "var(--good)" }}>
                <CheckCircle size={14} weight="bold" />
                <span>All active budgets pacing safely within assigned targets.</span>
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
        {/* Net Savings Rate */}
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-[10px] flex items-center justify-center"
            style={{
              background: savingsRate >= 20 ? "var(--good-soft)" : "var(--card-3)",
              color: savingsRate >= 20 ? "var(--good)" : "var(--ink-2)",
            }}
          >
            <PiggyBank size={16} weight="duotone" />
          </span>
          <div>
            <span className="text-[10.5px] font-semibold uppercase tracking-wider block" style={{ color: "var(--muted)" }}>
              Savings Rate
            </span>
            <span
              className="text-[14px] font-mono font-bold"
              style={{ color: savingsRate >= 0 ? "var(--ink)" : "var(--bad)" }}
            >
              {savingsRate > 0 ? "+" : ""}
              {savingsRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* MoM Expense Trend */}
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-[10px] flex items-center justify-center"
            style={{
              background:
                momExpenseDelta === null
                  ? "var(--card-3)"
                  : momExpenseDelta <= 0
                  ? "var(--good-soft)"
                  : "var(--warm-soft)",
              color:
                momExpenseDelta === null
                  ? "var(--muted)"
                  : momExpenseDelta <= 0
                  ? "var(--good)"
                  : "var(--warm-text)",
            }}
          >
            {momExpenseDelta !== null && momExpenseDelta > 0 ? (
              <TrendUp size={16} weight="bold" />
            ) : (
              <TrendDown size={16} weight="bold" />
            )}
          </span>
          <div>
            <span className="text-[10.5px] font-semibold uppercase tracking-wider block" style={{ color: "var(--muted)" }}>
              Spending MoM
            </span>
            <span className="text-[14px] font-mono font-bold" style={{ color: "var(--ink)" }}>
              {momExpenseDelta === null
                ? "Calibrating"
                : `${momExpenseDelta > 0 ? "+" : ""}${momExpenseDelta.toFixed(1)}%`}
            </span>
          </div>
        </div>

        {/* MoM Income Trend */}
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-[10px] flex items-center justify-center"
            style={{
              background:
                momIncomeDelta === null
                  ? "var(--card-3)"
                  : momIncomeDelta >= 0
                  ? "var(--good-soft)"
                  : "var(--warm-soft)",
              color:
                momIncomeDelta === null
                  ? "var(--muted)"
                  : momIncomeDelta >= 0
                  ? "var(--good)"
                  : "var(--warm-text)",
            }}
          >
            <TrendUp size={16} weight="bold" />
          </span>
          <div>
            <span className="text-[10.5px] font-semibold uppercase tracking-wider block" style={{ color: "var(--muted)" }}>
              Income MoM
            </span>
            <span className="text-[14px] font-mono font-bold" style={{ color: "var(--ink)" }}>
              {momIncomeDelta === null
                ? "Calibrating"
                : `${momIncomeDelta > 0 ? "+" : ""}${momIncomeDelta.toFixed(1)}%`}
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default FinancialPulse;

