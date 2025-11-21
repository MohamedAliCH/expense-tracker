import React from "react";
import { useApp } from "../../contexts/AppContext";
import SummaryCards from "./SummaryCards";
import ChartSection from "./ChartSection";
import CategorySpendingList from "./CategorySpendingList";
import { Download } from "lucide-react";
import { exportAnalyticsToPDF } from "../../utils/Export";

const Dashboard = () => {
  const {
    financialSummary,
    monthlyData,
    categoryBreakdown,
    transactions,
    loading,
  } = useApp();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "48px",
          color: "white",
        }}
      >
        Loading dashboard data...
      </div>
    );
  }

  const totalExpense = financialSummary.totalExpense;

  const handleExportPDF = () => {
    exportAnalyticsToPDF(
      financialSummary,
      monthlyData,
      categoryBreakdown,
      transactions
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "white" }}>
          Dashboard Overview
        </h2>
        <button
          onClick={handleExportPDF}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <Download size={16} />
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        totalIncome={financialSummary.totalIncome}
        totalExpense={financialSummary.totalExpense}
        transactionCounts={{
          income: financialSummary.incomeCount || 0,
          expense: financialSummary.expenseCount || 0,
        }}
      />

      {/* Charts in the middle - Bar chart and Pie chart */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Monthly Trend Bar Chart */}
        <ChartSection
          title="Monthly Trend (Last 6 Months)"
          type="bar"
          data={monthlyData}
          dataKeys={["income", "expense"]}
          colors={["#4ade80", "#f87171"]}
        />

        {/* Category Breakdown Pie Chart */}
        <ChartSection
          title="Expense by Category"
          type="pie"
          data={categoryBreakdown}
        />
      </div>

      {/* Top spending categories at the bottom */}
      <div
        style={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <h3
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "white",
            marginBottom: "16px",
          }}
        >
          Top Spending Categories
        </h3>

        <CategorySpendingList
          categories={categoryBreakdown.slice(0, 5)}
          totalExpense={totalExpense}
        />
      </div>
    </div>
  );
};

export default Dashboard;
