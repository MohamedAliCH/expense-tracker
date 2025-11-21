/**
 * TAB NAVIGATION COMPONENT
 *
 * Navigation tabs for switching between views:
 * - Dashboard
 * - Transactions
 * - Budgets
 * - Accounts
 *
 * Props:
 * - activeTab: string - Currently active tab
 * - onTabChange: function - Callback when tab clicked
 */

import React from "react";

const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    "dashboard",
    "transactions",
    "budgets",
    "categories",
    "accounts",
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        marginBottom: "24px",
        flexWrap: "wrap",
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          style={{
            padding: "8px 24px",
            borderRadius: "8px",
            fontWeight: "500",
            textTransform: "capitalize",
            border: "none",
            cursor: "pointer",
            background: activeTab === tab ? "#a855f7" : "rgba(255,255,255,0.1)",
            color: "white",
            boxShadow:
              activeTab === tab ? "0 10px 15px -3px rgba(0,0,0,0.1)" : "none",
            transition: "all 0.2s",
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
