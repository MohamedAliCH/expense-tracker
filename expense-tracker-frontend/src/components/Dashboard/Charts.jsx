import React from "react";
import ChartSection from "./ChartSection";
import "./Dashboard.css";

const Charts = ({ monthlyData, categoryBreakdown }) => {
  return (
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
  );
};

export default Charts;
