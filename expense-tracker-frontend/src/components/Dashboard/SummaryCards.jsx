import React from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

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
      {/* Income Card */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(74,222,128,0.1) 0%, rgba(34,197,94,0.05) 100%)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid rgba(74,222,128,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              background: "rgba(74,222,128,0.2)",
              padding: "8px",
              borderRadius: "8px",
            }}
          >
            <TrendingUp size={24} color="#4ade80" />
          </div>
          <span style={{ color: "#d1d5db", fontSize: "14px" }}>
            Total Income
          </span>
        </div>
        <p
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: "#4ade80",
            marginBottom: "8px",
          }}
        >
          ${totalIncome.toFixed(2)}
        </p>
        <p style={{ color: "#9ca3af", fontSize: "14px" }}>
          {transactionCounts.income} transactions
        </p>
      </div>

      {/* Expense Card */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(248,113,113,0.1) 0%, rgba(239,68,68,0.05) 100%)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid rgba(248,113,113,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              background: "rgba(248,113,113,0.2)",
              padding: "8px",
              borderRadius: "8px",
            }}
          >
            <TrendingDown size={24} color="#f87171" />
          </div>
          <span style={{ color: "#d1d5db", fontSize: "14px" }}>
            Total Expenses
          </span>
        </div>
        <p
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: "#f87171",
            marginBottom: "8px",
          }}
        >
          ${totalExpense.toFixed(2)}
        </p>
        <p style={{ color: "#9ca3af", fontSize: "14px" }}>
          {transactionCounts.expense} transactions
        </p>
      </div>

      {/* Balance Card */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(236,72,153,0.05) 100%)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid rgba(168,85,247,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              background: "rgba(168,85,247,0.2)",
              padding: "8px",
              borderRadius: "8px",
            }}
          >
            <Wallet size={24} color="#a855f7" />
          </div>
          <span style={{ color: "#d1d5db", fontSize: "14px" }}>
            Net Balance
          </span>
        </div>
        <p
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: balance >= 0 ? "#4ade80" : "#f87171",
            marginBottom: "8px",
          }}
        >
          ${Math.abs(balance).toFixed(2)}
        </p>
        <p style={{ color: "#9ca3af", fontSize: "14px" }}>
          {balance >= 0 ? "Surplus" : "Deficit"}
        </p>
      </div>
    </div>
  );
};

export default SummaryCards;
