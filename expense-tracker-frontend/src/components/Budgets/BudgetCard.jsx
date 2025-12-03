import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import "./Budgets.css";

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  return (
    <div className="budget-card">
      <div className="budget-card-header">
        <div className="budget-info">
          <div
            className="budget-icon-wrapper"
            style={{ background: `${budget.color}33` }}
          >
            {budget.emoji || "📊"}
          </div>
          <span className="budget-category-name">{budget.category}</span>
        </div>

        <div className="budget-header-actions">
          <span
            className={`budget-percentage ${
              budget.percentage > 100 ? "exceeded" : "normal"
            }`}
          >
            {budget.percentage.toFixed(0)}%
          </span>
          <button
            onClick={() => onEdit(budget)}
            className="budget-action-btn edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="budget-action-btn delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="budget-stats">
        <div className="budget-stat-row">
          <span className="stat-label">Spent</span>
          <span className="stat-value">
            ${parseFloat(budget.spent || 0).toFixed(2)}
          </span>
        </div>

        <div className="budget-stat-row">
          <span className="stat-label">Budget</span>
          <span className="stat-value">
            ${parseFloat(budget.amount || 0).toFixed(2)}
          </span>
        </div>

        <div className="budget-stat-row">
          <span className="stat-label">Remaining</span>
          <span
            className={`stat-value ${
              parseFloat(budget.remaining || 0) >= 0
                ? "remaining-positive"
                : "remaining-negative"
            }`}
          >
            ${Math.abs(parseFloat(budget.remaining || 0)).toFixed(2)}
          </span>
        </div>

        <div className="budget-stat-row period">
          <span className="stat-label">Period</span>
          <span className="stat-value period-text">{budget.period}</span>
        </div>
      </div>

      <div className="progress-bar-container">
        <div
          className="progress-bar"
          style={{
            width: `${Math.min(budget.percentage, 100)}%`,
            backgroundColor: budget.percentage > 100 ? "#ef4444" : budget.color,
          }}
        />
      </div>

      {budget.percentage > 90 && (
        <p className="budget-warning">
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
