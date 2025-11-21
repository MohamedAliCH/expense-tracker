import React from "react";
import { Trash2 } from "lucide-react";

const TransactionRow = ({ transaction, categories, accounts, onDelete }) => {
  // Helper functions
  const getCategoryName = (catId) => {
    const cat = categories.find((c) => c.id === parseInt(catId));
    return cat ? cat.name : "Unknown";
  };

  const getCategoryColor = (catId) => {
    const cat = categories.find((c) => c.id === parseInt(catId));
    return cat ? cat.color : "#6b7280";
  };

  const getAccountName = (accId) => {
    const acc = accounts.find((a) => a.id === parseInt(accId));
    return acc ? acc.name : "Unknown";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <tr
      style={{
        borderTop: "1px solid rgba(255,255,255,0.1)",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Date */}
      <td style={{ padding: "16px 24px", color: "#d1d5db" }}>
        {formatDate(transaction.date)}
      </td>

      {/* Description */}
      <td
        style={{
          padding: "16px 24px",
          color: "white",
          fontWeight: "500",
        }}
      >
        {transaction.description}
      </td>

      {/* Category Badge */}
      <td style={{ padding: "16px 24px" }}>
        <span
          style={{
            padding: "4px 12px",
            borderRadius: "9999px",
            fontSize: "14px",
            fontWeight: "500",
            backgroundColor: getCategoryColor(transaction.category_id) + "66",
            color: getCategoryColor(transaction.category_id),
          }}
        >
          {getCategoryName(transaction.category_id)}
        </span>
      </td>

      {/* Account */}
      <td style={{ padding: "16px 24px", color: "#d1d5db" }}>
        {getAccountName(transaction.account_id)}
      </td>

      {/* Amount - Green for income, Red for expense */}
      <td
        style={{
          padding: "16px 24px",
          textAlign: "right",
          fontWeight: "bold",
          color: transaction.type === "income" ? "#4ade80" : "#f87171",
        }}
      >
        {transaction.type === "income" ? "+" : "-"}$
        {parseFloat(transaction.amount).toFixed(2)}
      </td>

      {/* Delete Button */}
      <td style={{ padding: "16px 24px", textAlign: "right" }}>
        <button
          onClick={() => onDelete(transaction.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#f87171",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#f87171")}
        >
          <Trash2 size={20} />
        </button>
      </td>
    </tr>
  );
};

export default TransactionRow;
