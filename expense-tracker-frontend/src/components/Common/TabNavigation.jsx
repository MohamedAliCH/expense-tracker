import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Common.css";

const TABS = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard" },
  { id: "transactions", label: "Transactions", path: "/transactions" },
  { id: "budgets", label: "Budgets", path: "/budgets" },
  { id: "categories", label: "Categories", path: "/categories" },
  { id: "accounts", label: "Accounts", path: "/accounts" },
];

const TabNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to check if tab is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="tab-navigation">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => navigate(tab.path)}
          className={`tab-button ${isActive(tab.path) ? "active" : ""}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
