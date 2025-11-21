import React from "react";
import { Edit2, Trash2 } from "lucide-react";

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "24px",
        border: "1px solid rgba(255,255,255,0.2)",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: `${budget.color}33`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            {budget.emoji || "📊"}
          </div>
          <span
            style={{
              color: "white",
              fontWeight: "600",
              fontSize: "18px",
            }}
          >
            {budget.category}
          </span>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span
            style={{
              fontWeight: "bold",
              fontSize: "20px",
              color: budget.percentage > 100 ? "#f87171" : "#4ade80",
            }}
          >
            {budget.percentage.toFixed(0)}%
          </span>
          <button
            onClick={() => onEdit(budget)}
            style={{
              background: "rgba(168,85,247,0.2)",
              border: "none",
              borderRadius: "6px",
              padding: "6px",
              cursor: "pointer",
              color: "#a855f7",
            }}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            style={{
              background: "rgba(239,68,68,0.2)",
              border: "none",
              borderRadius: "6px",
              padding: "6px",
              cursor: "pointer",
              color: "#ef4444",
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "14px",
          }}
        >
          <span style={{ color: "#9ca3af" }}>Spent</span>
          <span style={{ color: "white", fontWeight: "500" }}>
            ${parseFloat(budget.spent || 0).toFixed(2)}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "14px",
          }}
        >
          <span style={{ color: "#9ca3af" }}>Budget</span>
          <span style={{ color: "white", fontWeight: "500" }}>
            ${parseFloat(budget.amount || 0).toFixed(2)}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "14px",
          }}
        >
          <span style={{ color: "#9ca3af" }}>Remaining</span>
          <span
            style={{
              fontWeight: "500",
              color:
                parseFloat(budget.remaining || 0) >= 0 ? "#4ade80" : "#f87171",
            }}
          >
            ${Math.abs(parseFloat(budget.remaining || 0)).toFixed(2)}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "14px",
            marginTop: "4px",
          }}
        >
          <span style={{ color: "#9ca3af" }}>Period</span>
          <span
            style={{
              color: "white",
              fontWeight: "500",
              textTransform: "capitalize",
            }}
          >
            {budget.period}
          </span>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "9999px",
          height: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "12px",
            borderRadius: "9999px",
            width: `${Math.min(budget.percentage, 100)}%`,
            backgroundColor: budget.percentage > 100 ? "#ef4444" : budget.color,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {budget.percentage > 90 && (
        <p
          style={{
            color: "#fbbf24",
            fontSize: "14px",
            marginTop: "12px",
            fontWeight: "500",
          }}
        >
          ⚠️{" "}
          {budget.percentage > 100
            ? "Budget exceeded!"
            : "Almost at budget limit"}
        </p>
      )}
    </div>
  );
};

export default BudgetCard;
