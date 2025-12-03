import React from "react";
import { useApp } from "../../contexts/AppContext";
import SummaryCards from "./SummaryCards";
import ChartSection from "./ChartSection";
import CategorySpendingList from "./CategorySpendingList";
import { Download } from "lucide-react";
import { exportAnalyticsToPDF } from "../../utils/Export";
import "./Dashboard.css";

const Dashboard = () => {
  const {
    financialSummary,
    monthlyData,
    categoryBreakdown,
    transactions,
    loading,
  } = useApp();

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard data...</div>;
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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Dashboard Overview</h2>
        <button onClick={handleExportPDF} className="export-btn">
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
      <div className="charts-grid">
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
      <div className="top-categories-card">
        <h3 className="top-categories-title">Top Spending Categories</h3>

        <CategorySpendingList
          categories={categoryBreakdown.slice(0, 5)}
          totalExpense={totalExpense}
        />
      </div>
    </div>
  );
};

export default Dashboard;
