/**
 * ACCOUNT LIST COMPONENT
 *
 * Displays all user accounts (wallet, bank, credit card) with:
 * - Account type badge
 * - Account name
 * - Current balance
 * - Available/Owed status
 *
 * Props:
 * - accounts: array - All user accounts from API
 */

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import AccountCard from "./AccountCard";

const AccountList = () => {
  const { accounts, addAccount, editAccount, removeAccount } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    balance: "",
    type: "wallet",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingAccount) {
        // When editing, only send name and type (not balance)
        const { balance, ...updateData } = formData;
        await editAccount(editingAccount.id, updateData);
      } else {
        await addAccount(formData);
      }

      setShowModal(false);
      setEditingAccount(null);
      setFormData({ name: "", balance: "", type: "wallet" });
    } catch (error) {
      console.error("Error saving account:", error);
      alert("Failed to save account");
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      balance: account.balance, // Keep for reference but won't be sent to API
      type: account.type,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure? This will affect all related transactions."
      )
    ) {
      return;
    }

    try {
      await removeAccount(id);
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "white" }}>
          Manage Accounts
        </h2>
        <button
          onClick={() => {
            setEditingAccount(null);
            setFormData({ name: "", balance: "", type: "wallet" });
            setShowModal(true);
          }}
          style={{
            background: "linear-gradient(to right, #a855f7, #ec4899)",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "500",
          }}
        >
          <Plus size={20} />
          Add Account
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "#1e293b",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "400px",
              width: "100%",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h3
                style={{ fontSize: "24px", fontWeight: "bold", color: "white" }}
              >
                {editingAccount ? "Edit Account" : "Add Account"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#d1d5db",
                    marginBottom: "8px",
                  }}
                >
                  Account Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    color: "white",
                    fontSize: "16px",
                  }}
                  placeholder="e.g., Main Wallet"
                />
              </div>

              {/* Show balance input only when creating new account */}
              {!editingAccount && (
                <div>
                  <label
                    style={{
                      display: "block",
                      color: "#d1d5db",
                      marginBottom: "8px",
                    }}
                  >
                    Initial Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) =>
                      setFormData({ ...formData, balance: e.target.value })
                    }
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      color: "white",
                      fontSize: "16px",
                    }}
                    placeholder="0.00"
                  />
                  <p
                    style={{
                      color: "#9ca3af",
                      fontSize: "12px",
                      marginTop: "4px",
                      fontStyle: "italic",
                    }}
                  >
                    Set the starting balance for this account
                  </p>
                </div>
              )}

              {/* Show current balance as read-only when editing */}
              {editingAccount && (
                <div>
                  <label
                    style={{
                      display: "block",
                      color: "#d1d5db",
                      marginBottom: "8px",
                    }}
                  >
                    Current Balance
                  </label>
                  <div
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      color: "#9ca3af",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    ${parseFloat(editingAccount.balance).toFixed(2)}
                  </div>
                  <p
                    style={{
                      color: "#9ca3af",
                      fontSize: "12px",
                      marginTop: "4px",
                      fontStyle: "italic",
                    }}
                  >
                    ⓘ Balance is automatically updated from transactions
                  </p>
                </div>
              )}

              <div>
                <label
                  style={{
                    display: "block",
                    color: "#d1d5db",
                    marginBottom: "8px",
                  }}
                >
                  Account Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    color: "white",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  <option value="wallet">Wallet</option>
                  <option value="bank">Bank Account</option>
                  <option value="credit_card">Credit Card</option>
                </select>
              </div>

              <button
                onClick={handleSubmit}
                style={{
                  width: "100%",
                  background: "linear-gradient(to right, #a855f7, #ec4899)",
                  color: "white",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "16px",
                  marginTop: "8px",
                }}
              >
                {editingAccount ? "Update Account" : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountList;
