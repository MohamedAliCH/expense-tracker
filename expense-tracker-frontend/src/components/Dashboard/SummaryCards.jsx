import React from "react";
import { TrendUp, TrendDown, Wallet, Percent } from "@phosphor-icons/react";
import StatCard from "../Common/StatCard";

const SummaryCards = ({ totalIncome = 0, totalExpense = 0, transactionCounts = { income: 0, expense: 0 } }) => {
  const balance = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0
      ? Math.max(-99, Math.min(100, ((totalIncome - totalExpense) / totalIncome) * 100))
      : 0;

  return (
    <section
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5"
      aria-label="Financial Overview"
    >
      <StatCard
        index={0}
        type="balance"
        icon={Wallet}
        label="Net Balance"
        amount={balance}
        subtitle={balance >= 0 ? "Net surplus position" : "Net deficit position"}
        badgeText={balance >= 0 ? "Surplus" : "Deficit"}
      />

      <StatCard
        index={1}
        type="income"
        icon={TrendUp}
        label="Total Income"
        amount={totalIncome}
        subtitle={`${transactionCounts.income || 0} inflows recorded`}
        badgeText="Inflow"
      />

      <StatCard
        index={2}
        type="expense"
        icon={TrendDown}
        label="Total Expenses"
        amount={totalExpense}
        subtitle={`${transactionCounts.expense || 0} expenses recorded`}
        badgeText="Outflow"
      />

      <StatCard
        index={3}
        type="rate"
        icon={Percent}
        label="Savings Rate"
        formattedValue={`${savingsRate.toFixed(1)}%`}
        subtitle="Income retained this period"
        badgeText={savingsRate >= 20 ? "Healthy" : "Watch"}
      />
    </section>
  );
};

export default SummaryCards;
