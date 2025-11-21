import React from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import StatCard from "../Common/StatCard";

const SummaryCards = ({ totalIncome, totalExpense, transactionCounts }) => {
  const balance = totalIncome - totalExpense;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "24px",
      }}
    >
      <StatCard
        type="income"
        icon={TrendingUp}
        label="Total Income"
        amount={totalIncome}
        count={transactionCounts.income}
      />

      <StatCard
        type="expense"
        icon={TrendingDown}
        label="Total Expenses"
        amount={totalExpense}
        count={transactionCounts.expense}
      />

      <StatCard
        type="balance"
        icon={Wallet}
        label="Net Balance"
        amount={balance}
        count={0} // Balance doesn't really have a count, or you could pass total transactions
      />
    </div>
  );
};

export default SummaryCards;