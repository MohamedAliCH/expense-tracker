import React from "react";
import "./Common.css";

const StatCard = ({ icon: Icon, label, amount, count, type }) => {
  // Determine the class for the amount text color
  let amountClass = type;
  if (type === "balance") {
    amountClass = amount >= 0 ? "balance-positive" : "balance-negative";
  }

  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-card-header">
        <div className={`stat-icon-wrapper ${type}`}>
          <Icon
            size={24}
            className={`stat-icon ${type}`}
            color="currentColor"
          />
        </div>
        <span className="stat-label">{label}</span>
      </div>
      <p className={`stat-amount ${amountClass}`}>
        ${Math.abs(amount).toFixed(2)}
      </p>
      <p className="stat-subtext">
        {type === "balance"
          ? amount >= 0
            ? "Surplus"
            : "Deficit"
          : `${count} transactions`}
      </p>
    </div>
  );
};

export default StatCard;
