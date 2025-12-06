import React, { useState } from "react";
import { DollarSign, RefreshCw, PlusCircle, User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";
import PremiumBadge from "./Premium/PremiumBadge";
import "./Header.css";

const Header = ({ onAddTransaction }) => {
  const { user, logout } = useAuth();
  const { refreshData } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

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

        {/* Premium Button or Badge */}
        {user?.is_premium ? (
          <button
            onClick={() => navigate("/upgrade")}
            className="premium-badge-btn"
            title="Manage Subscription"
          >
            <PremiumBadge />
          </button>
        ) : (
          <button onClick={() => navigate("/upgrade")} className="upgrade-btn">
            <Crown size={16} />
            Upgrade
          </button>
        )}

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
