/**
 * DASHBOARD COMPONENT (MAIN)
 *
 * This is the main dashboard view that orchestrates all dashboard components.
 * It receives data from parent (App.jsx) and calculates derived data.
 *
 * Responsibilities:
 * - Calculate totals (income, expenses, balance)
 * - Prepare data for charts
 * - Calculate category breakdown
 * - Generate monthly trend data
 *
 * Props:
 * - transactions: array - All user transactions
 * - categories: array - All user categories
 */

import React from "react";
import SummaryCards from "./SummaryCards";
import Charts from "./Charts";
import TopCategories from "./TopCategories";
import { Download } from "lucide-react";
import { exportAnalyticsToPDF } from "../../utils/Export";

const Dashboard = ({ transactions, categories }) => {
  // ==========================================
  // CALCULATE TOTALS
  // ==========================================

  // Sum all income transactions
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Sum all expense transactions
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Count transactions by type
  const transactionCounts = {
    income: transactions.filter((t) => t.type === "income").length,
    expense: transactions.filter((t) => t.type === "expense").length,
  };

  // ==========================================
  // CALCULATE CATEGORY BREAKDOWN
  // ==========================================

  const categoryBreakdown = categories
    .filter((c) => c.type === "expense") // Only expense categories
    .map((cat) => {
      // Calculate total spent in this category
      const total = transactions
        .filter((t) => t.type === "expense" && t.category_id === cat.id)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      return {
        ...cat, // Keep all category properties (id, name, color)
        total, // Add total spent
        value: total, // For pie chart dataKey
      };
    })
    .filter((c) => c.total > 0) // Remove categories with no spending
    .sort((a, b) => b.total - a.total); // Sort highest to lowest

  // ==========================================
  // CALCULATE MONTHLY TREND (Last 6 Months)
  // ==========================================

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    // Create date object for each of last 6 months
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i)); // Go back 5,4,3,2,1,0 months
    const month = date.toLocaleString("default", { month: "short" }); // "Jan", "Feb", etc.

    // Filter transactions for this specific month and year
    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return (
        tDate.getMonth() === date.getMonth() &&
        tDate.getFullYear() === date.getFullYear()
      );
    });

    // Calculate income and expenses for this month
    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + parseFloat(t.amount), 0);

    const expense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + parseFloat(t.amount), 0);

    return { month, income, expense };
  });

  // ==========================================
  // RENDER DASHBOARD
  // ==========================================

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Summary cards at the top */}
      <SummaryCards
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        transactionCounts={transactionCounts}
      />

      {/* Charts in the middle - Bar chart and Pie chart */}
      <Charts monthlyData={monthlyData} categoryBreakdown={categoryBreakdown} />

      {/* Top spending categories at the bottom */}
      <TopCategories
        categories={categoryBreakdown}
        totalExpense={totalExpense}
      />
    </div>
  );
};

export default Dashboard;
