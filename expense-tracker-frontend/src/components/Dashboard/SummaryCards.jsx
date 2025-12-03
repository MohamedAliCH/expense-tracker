import React from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import StatCard from "../Common/StatCard";
import "./Dashboard.css";

const SummaryCards = ({ totalIncome, totalExpense, transactionCounts }) => {
  const balance = totalIncome - totalExpense;

  return (
    <div className="summary-cards-grid">
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
        count={0}
      />
    </div>
  );
};

export default SummaryCards;
