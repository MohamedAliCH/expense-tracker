import React, { useState, useMemo } from "react";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import SummaryCards from "./SummaryCards";
import FinancialPulse from "./FinancialPulse";
import AiFinancialBriefing from "./AiFinancialBriefing";
import AiAdvisorModal from "./AiAdvisorModal";
import ChartSection from "./ChartSection";
import CategorySpendingList from "./CategorySpendingList";
import UpcomingRecurring from "./UpcomingRecurring";
import EmptyState from "../Common/EmptyState";
import DashboardSkeleton from "../Common/MoorlySkeleton";
import {
  DownloadSimple,
  PresentationChart,
  ChartBar,
  ArrowsLeftRight,
  Plus,
  ArrowRight,
} from "@phosphor-icons/react";
import { exportAnalyticsToPDF } from "../../utils/Export";
import { motion } from "framer-motion";
import { Link, useOutletContext } from "react-router-dom";
import MagneticButton from "../Common/MagneticButton";

const TIMEFRAME_OPTIONS = [
  { id: "all", label: "All time" },
  { id: "this_month", label: "This month" },
  { id: "last_90", label: "Last 90d" },
  { id: "ytd", label: "YTD" },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const Dashboard = () => {
  const { user } = useAuth();
  const outletContext = useOutletContext() || {};
  const {
    financialSummary,
    monthlyData,
    categoryBreakdown,
    transactions,
    categories,
    accounts,
    budgetAnalysis,
    loading,
    currency = "$",
    triggerRecurringProcessing,
  } = useApp();

  const [timeframe, setTimeframe] = useState("all");
  const [showAdvisor, setShowAdvisor] = useState(false);

  const timeframeData = useMemo(() => {
    if (!Array.isArray(transactions) || transactions.length === 0 || timeframe === "all") {
      return {
        summary: financialSummary,
        categoryBreakdown,
        monthlyData,
      };
    }

    const now = new Date();
    let startDate = null;

    if (timeframe === "this_month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeframe === "last_90") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
    } else if (timeframe === "ytd") {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const filtered = transactions.filter((t) => {
      const txDate = new Date(t.date);
      return !startDate || txDate >= startDate;
    });

    const incomeTx = filtered.filter((t) => t.type === "income");
    const expenseTx = filtered.filter((t) => t.type === "expense");

    const totalIncome = incomeTx.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const totalExpense = expenseTx.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const summary = {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      incomeCount: incomeTx.length,
      expenseCount: expenseTx.length,
    };

    const catMap = {};
    expenseTx.forEach((t) => {
      const cat = categories.find((c) => c.id === parseInt(t.category_id));
      const catId = t.category_id || "other";
      if (!catMap[catId]) {
        catMap[catId] = {
          id: catId,
          name: cat?.name || "Uncategorized",
          color: cat?.color || "#4a6fa5",
          emoji: cat?.emoji || "tag",
          total: 0,
          value: 0,
          count: 0,
        };
      }
      catMap[catId].total += parseFloat(t.amount || 0);
      catMap[catId].value += parseFloat(t.amount || 0);
      catMap[catId].count += 1;
    });

    const breakdown = Object.values(catMap).sort((a, b) => b.total - a.total);

    return {
      summary,
      categoryBreakdown: breakdown,
      monthlyData,
    };
  }, [timeframe, transactions, financialSummary, categoryBreakdown, monthlyData, categories]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const firstName = (user?.name || "Friend").split(" ")[0];
  const greetingText = `${getGreeting()}, ${firstName}`;
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const overBudgetCount = (budgetAnalysis || []).filter((b) => b.percentage > 100).length;
  const currentSummary = timeframeData.summary;
  const currentCategories = timeframeData.categoryBreakdown;

  const handleExportPDF = () => {
    exportAnalyticsToPDF(
      currentSummary,
      monthlyData,
      currentCategories,
      transactions,
      currency
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="w-full flex flex-col gap-5"
    >
      {/* Dashboard Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-2 pb-1">
        <div className="space-y-1.5">
          <h1
            className="text-[28px] sm:text-[34px] font-bold tracking-[-0.03em] leading-[1.1]"
            style={{ color: "var(--ink)" }}
          >
            {greetingText}
          </h1>
          <p className="text-[14px] max-w-[68ch] leading-relaxed" style={{ color: "var(--ink-2)" }}>
            <span style={{ color: "var(--muted)" }}>{todayFormatted} · </span>
            {transactions?.length || 0} transactions recorded,{" "}
            {budgetAnalysis?.length || 0} active budgets{" "}
            {overBudgetCount > 0 ? `(${overBudgetCount} exceeding limit)` : "(all on track)"} and{" "}
            <Link
              to="/accounts"
              className="font-semibold underline decoration-[var(--line-2)] underline-offset-4 hover:decoration-[var(--accent)]"
              style={{ color: "var(--ink)" }}
            >
              {accounts?.length || 0} connected accounts
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          {/* Segmented Timeframe Switcher */}
          <div className="moorly-seg self-start sm:self-auto" role="group" aria-label="Dashboard Timeframe">
            {TIMEFRAME_OPTIONS.map((opt) => {
              const active = timeframe === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTimeframe(opt.id)}
                  className={`moorly-seg__btn !h-[32px] !px-2.5 !text-[12px] ${active ? "is-active" : ""}`}
                >
                  {active && (
                    <motion.span
                      layoutId="dashboardTimeframeSeg"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-[8px]"
                      style={{
                        background: "var(--card)",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.12), inset 0 0 0 1px var(--line)",
                      }}
                    />
                  )}
                  <span className="relative z-10">{opt.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/transactions" className="moorly-btn !h-[34px] !text-[12.5px]">
              <ArrowsLeftRight size={15} weight="duotone" />
              <span>Transactions</span>
            </Link>

            <button type="button" onClick={handleExportPDF} className="moorly-btn !h-[34px] !text-[12.5px]">
              <DownloadSimple size={15} weight="bold" />
              <span>Export Report</span>
            </button>

            {outletContext.onAddTransaction && (
              <MagneticButton
                onClick={outletContext.onAddTransaction}
                className="moorly-btn moorly-btn--primary !h-[34px] !text-[12.5px]"
              >
                <Plus size={15} weight="bold" />
                <span>New Transaction</span>
              </MagneticButton>
            )}
          </div>
        </div>
      </header>

      {/* 4 Oceanic KPI Tiles */}
      <SummaryCards
        totalIncome={currentSummary.totalIncome}
        totalExpense={currentSummary.totalExpense}
        transactionCounts={{
          income: currentSummary.incomeCount || 0,
          expense: currentSummary.expenseCount || 0,
        }}
      />

      {/* Smart Financial Pulse & Pace Insights */}
      <FinancialPulse
        financialSummary={currentSummary}
        monthlyData={monthlyData}
        budgetAnalysis={budgetAnalysis}
        currency={currency}
      />

      {/* Oceanic AI Executive Briefing */}
      <AiFinancialBriefing
        currency={currency}
        onOpenAdvisor={() => setShowAdvisor(true)}
      />

      {transactions && transactions.length > 0 ? (
        <div className="flex flex-col gap-4">
          {/* Bento Row 1: Monthly Cashflow Trend (2/3) + Category Breakdown (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <section className="moorly-card lg:col-span-2">
              <ChartSection
                title="Monthly Trend"
                subtitle="Income vs. expense cashflow over time"
                type="bar"
                data={monthlyData}
                dataKeys={["income", "expense"]}
                colors={["#2a9d8f", "#d9534f"]}
              />
            </section>

            <section className="moorly-card">
              <ChartSection
                title="Category Breakdown"
                subtitle={
                  timeframe === "all"
                    ? "All-time expense distribution"
                    : `Expense distribution (${TIMEFRAME_OPTIONS.find((t) => t.id === timeframe)?.label})`
                }
                type="pie"
                data={currentCategories}
              />
            </section>
          </div>

          {/* Bento Row 2: Recent Transactions (2/3) + Top Spending Categories (1/3) */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <section className="moorly-card moorly-card--flush xl:col-span-2 flex flex-col">
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid var(--line)" }}
              >
                <div>
                  <h2 className="text-[17px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
                    Recent Transactions
                  </h2>
                  <p className="text-[12px] font-medium" style={{ color: "var(--muted)" }}>
                    Latest recorded entries across all accounts
                  </p>
                </div>
                <Link
                  to="/transactions"
                  className="moorly-btn moorly-btn--sm moorly-btn--ghost"
                >
                  <span>View All</span>
                  <ArrowRight size={14} weight="bold" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="moorly-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Account</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 6).map((transaction) => {
                      const cat = categories.find((c) => c.id === parseInt(transaction.category_id));
                      const acc = accounts.find((a) => a.id === parseInt(transaction.account_id));
                      const isIncome = transaction.type === "income";

                      return (
                        <tr key={transaction.id}>
                          <td className="whitespace-nowrap text-[12.5px]" style={{ color: "var(--muted)" }}>
                            {new Date(transaction.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td>
                            <span className="font-semibold text-[13.5px]" style={{ color: "var(--ink)" }}>
                              {transaction.description}
                            </span>
                          </td>
                          <td className="whitespace-nowrap">
                            <span
                              className="moorly-pill"
                              style={{
                                backgroundColor: (cat?.color || "#4a6fa5") + "22",
                                color: cat?.color || "var(--accent-text)",
                              }}
                            >
                              {cat?.name || "Uncategorized"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap text-[12.5px]" style={{ color: "var(--ink-2)" }}>
                            {acc?.name || "Default"}
                          </td>
                          <td className="whitespace-nowrap text-right font-mono font-bold text-[13.5px]">
                            <span style={{ color: isIncome ? "var(--good)" : "var(--ink)" }}>
                              {isIncome ? "+" : "-"}{currency}{Math.abs(parseFloat(transaction.amount || 0)).toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Right Column: Top Spending Categories */}
            <section className="moorly-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-[17px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
                      Top Spending
                    </h2>
                    <p className="text-[12px] font-medium" style={{ color: "var(--muted)" }}>
                      Highest outflow categories
                    </p>
                  </div>
                  <Link
                    to="/budgets"
                    className="moorly-btn moorly-btn--sm moorly-btn--ghost"
                  >
                    <span>Budgets</span>
                    <ArrowRight size={14} weight="bold" />
                  </Link>
                </div>

                {currentCategories && currentCategories.length > 0 ? (
                  <CategorySpendingList
                    categories={currentCategories.slice(0, 5)}
                    totalExpense={currentSummary.totalExpense}
                    currency={currency}
                  />
                ) : (
                  <EmptyState
                    icon={ChartBar}
                    title="No Spending Data"
                    message="Categorize your expenses to populate spending insights."
                  />
                )}
              </div>
            </section>
          </div>

          {/* Bento Row 3: Upcoming Recurring Commitments */}
          <UpcomingRecurring
            transactions={transactions}
            categories={categories}
            currency={currency}
            triggerRecurringProcessing={triggerRecurringProcessing}
          />

          {/* AI Interactive Advisor Modal */}
          <AiAdvisorModal
            show={showAdvisor}
            onClose={() => setShowAdvisor(false)}
            currency={currency}
          />
        </div>
      ) : (
        <EmptyState
          icon={PresentationChart}
          title="No Transactions Yet"
          message="Your ledger is currently clean. Add your first income or expense to activate analytics."
          actionLabel="Add Transaction"
          onAction={outletContext.onAddTransaction}
        />
      )}
    </motion.div>
  );
};

export default Dashboard;
