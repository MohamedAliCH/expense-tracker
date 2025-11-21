import React from "react";
import ChartSection from "./ChartSection";

const Charts = ({ monthlyData, categoryBreakdown }) => {
  return (
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
  );
};

export default Charts;