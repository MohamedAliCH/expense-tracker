import React, { useState } from "react";
import { Trash2, Star, FileText } from "lucide-react";
import { updateTransaction } from "../../utils/api";

const TransactionRow = ({ transaction, categories, accounts, onDelete }) => {
  const [isFavorite, setIsFavorite] = useState(
    transaction.is_favorite === 1 || transaction.is_favorite === true
  );
  const [showNotesTooltip, setShowNotesTooltip] = useState(false);

  const toggleFavorite = async () => {
    try {
      const newFavoriteStatus = !isFavorite;
      await updateTransaction(transaction.id, {
        is_favorite: newFavoriteStatus,
      });
      setIsFavorite(newFavoriteStatus);
    } catch (error) {
      console.error("Failed to toggle favorite", error);
    }
  };

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

      {/* Actions */}
      <td style={{ padding: "16px 24px", textAlign: "right" }}>
        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          {/* Favorite Star */}
          <button
            onClick={toggleFavorite}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: isFavorite ? "#fbbf24" : "#6b7280",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = isFavorite ? "#f59e0b" : "#9ca3af")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = isFavorite ? "#fbbf24" : "#6b7280")
            }
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>

          {/* Notes Indicator */}
          {transaction.notes && (
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setShowNotesTooltip(true)}
              onMouseLeave={() => setShowNotesTooltip(false)}
            >
              <FileText size={18} color="#60a5fa" />
              {showNotesTooltip && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "100%",
                    right: "0",
                    marginBottom: "8px",
                    background: "rgba(0,0,0,0.9)",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                    maxWidth: "200px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    zIndex: 1000,
                  }}
                >
                  {transaction.notes}
                </div>
              )}
            </div>
          )}

          {/* Delete Button */}
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
        </div>
      </td>
    </tr>
  );
};

export default TransactionRow;
