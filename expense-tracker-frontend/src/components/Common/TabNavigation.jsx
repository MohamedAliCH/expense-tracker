import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Common.css";
import { CreditCard } from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard" },
  { id: "transactions", label: "Transactions", path: "/transactions" },
  { id: "budgets", label: "Budgets", path: "/budgets" },
  { id: "categories", label: "Categories", path: "/categories" },
  { id: "accounts", label: "Accounts", path: "/accounts" },
  { id: "payments", label: "Payments", path: "/payments", icon: CreditCard }
];

const TabNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleTabClick = (path) => {
    navigate(path);
  };

  return (
    <nav className="tab-navigation" role="tablist" aria-label="Main navigation">
      {TABS.map((tab) => {
        const active = isActive(tab.path);
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.path)}
            className={`tab-button ${active ? "active" : ""}`}
            role="tab"
            aria-selected={active}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};

export default TabNavigation;