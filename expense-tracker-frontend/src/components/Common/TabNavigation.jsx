import React from "react";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "transactions", label: "Transactions" },
  { id: "budgets", label: "Budgets" },
  { id: "categories", label: "Categories" },
  { id: "accounts", label: "Accounts" },
];

const TabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        marginBottom: "24px",
        flexWrap: "wrap",
      }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            padding: "8px 24px",
            borderRadius: "8px",
            fontWeight: "500",
            border: "none",
            cursor: "pointer",
            background:
              activeTab === tab.id ? "#a855f7" : "rgba(255,255,255,0.1)",
            color: "white",
            boxShadow:
              activeTab === tab.id
                ? "0 10px 15px -3px rgba(0,0,0,0.1)"
                : "none",
            transition: "all 0.2s",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;