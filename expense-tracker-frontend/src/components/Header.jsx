import React, { useState } from "react";
import { DollarSign, RefreshCw, PlusCircle, User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";
import "./Header.css";

const Header = ({ onAddTransaction }) => {
  const { user, logout } = useAuth();
  const { refreshData } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <header>
      {/* Left side - Logo and app name */}
      <div className="header-logo">
        <div className="logo-icon">
          <DollarSign size={24} color="white" />
        </div>
        <div className="logo-text-container">
          <h1 className="logo-text">Expense Tracker</h1>
          <p className="logo-subtitle">
            Manage your finances with powerful analytics
          </p>
        </div>
      </div>

      {/* Right side - Action buttons */}
      <div className="header-actions">
        {/* Refresh Button */}
        <button onClick={handleRefresh} className="refresh-btn">
          <RefreshCw size={16} className={refreshing ? "spin-animation" : ""} />
          Refresh
        </button>

        {/* Add Transaction Button */}
        <button onClick={onAddTransaction} className="add-transaction-btn">
          <PlusCircle size={16} />
          Add Transaction
        </button>

        {/* User Menu */}
        <div className="user-menu-container">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="user-menu-btn"
          >
            <User size={16} />
            {user?.name || "User"}
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <button onClick={logout} className="logout-btn">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
