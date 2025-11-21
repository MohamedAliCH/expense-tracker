import React, { useState } from "react";
import { DollarSign, RefreshCw, PlusCircle, User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";

const Header = ({ onAddTransaction }) => {
  const { user, logout } = useAuth();
  const { loadData } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <header
      style={{
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "16px 24px",
        marginBottom: "24px",
        border: "1px solid rgba(255,255,255,0.2)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Left side - Logo and app name */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #a855f7, #ec4899)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DollarSign size={24} color="white" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              background: "linear-gradient(to right, #a855f7, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              margin: 0,
              lineHeight: "1.2",
            }}
          >
            Expense Tracker
          </h1>
          <p
            style={{
              fontSize: "12px",
              color: "#d1d5db",
              margin: 0,
              fontWeight: "400",
              letterSpacing: "0.3px",
              opacity: 0.9,
            }}
          >
            Manage your finances with powerful analytics
          </p>
        </div>
      </div>

      {/* Right side - Action buttons */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <RefreshCw
            size={16}
            style={{
              animation: refreshing ? "spin 1s linear infinite" : "none",
            }}
          />
          Refresh
        </button>

        {/* Add Transaction Button */}
        <button
          onClick={onAddTransaction}
          style={{
            background: "linear-gradient(to right, #a855f7, #ec4899)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "500",
            transition: "all 0.2s",
          }}
        >
          <PlusCircle size={16} />
          Add Transaction
        </button>

        {/* User Menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white",
              padding: "8px 12px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <User size={16} />
            {user?.name || "User"}
          </button>

          {showUserMenu && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: "8px",
                background: "#1e293b",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                padding: "8px",
                minWidth: "150px",
                zIndex: 50,
              }}
            >
              <button
                onClick={logout}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  color: "#f87171",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "500",
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
