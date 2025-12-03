import React, { useState } from "react";
import { Trash2, Star, FileText } from "lucide-react";
import { updateTransaction } from "../../utils/api";
import "./Transactions.css";

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
    <tr className="transaction-row">
      {/* Date */}
      <td className="table-cell date">{formatDate(transaction.date)}</td>

      {/* Description */}
      <td className="table-cell description">{transaction.description}</td>

      {/* Category Badge */}
      <td className="table-cell">
        <span
          className="category-badge"
          style={{
            backgroundColor: getCategoryColor(transaction.category_id) + "66",
            color: getCategoryColor(transaction.category_id),
          }}
        >
          {getCategoryName(transaction.category_id)}
        </span>
      </td>

      {/* Account */}
      <td className="table-cell account">
        {getAccountName(transaction.account_id)}
      </td>

      {/* Amount - Green for income, Red for expense */}
      <td
        className={`table-cell amount ${
          transaction.type === "income" ? "amount-income" : "amount-expense"
        }`}
      >
        {transaction.type === "income" ? "+" : "-"}$
        {parseFloat(transaction.amount).toFixed(2)}
      </td>

      {/* Actions */}
      <td className="table-cell actions">
        <div className="actions-wrapper">
          {/* Favorite Star */}
          <button
            onClick={toggleFavorite}
            className={`action-icon-btn favorite ${isFavorite ? "active" : ""}`}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>

          {/* Notes Indicator */}
          {transaction.notes && (
            <div
              className="notes-tooltip-container"
              onMouseEnter={() => setShowNotesTooltip(true)}
              onMouseLeave={() => setShowNotesTooltip(false)}
            >
              <FileText size={18} color="#60a5fa" />
              {showNotesTooltip && (
                <div className="notes-tooltip">{transaction.notes}</div>
              )}
            </div>
          )}

          {/* Delete Button */}
          <button
            onClick={() => onDelete(transaction.id)}
            className="action-icon-btn delete"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TransactionRow;
