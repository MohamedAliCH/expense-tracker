import React from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
            color: "white",
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          Monthly Trend (Last 6 Months)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                background: "#1e293b",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "white",
              }}
            />
            <Legend />
            <Bar dataKey="income" fill="#4ade80" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expense" fill="#f87171" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown Pie Chart */}
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
            color: "white",
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          Expense by Category
        </h3>
        {categoryBreakdown.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => entry.name}
              >
                {categoryBreakdown.map((cat, index) => (
                  <Cell key={`cell-${index}`} fill={cat.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "300px",
              color: "#9ca3af",
            }}
          >
            No expense data to display
          </div>
        )}
      </div>
    </div>
  );
};

export default Charts;
