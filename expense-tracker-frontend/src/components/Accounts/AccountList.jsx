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
import "./Accounts.css";

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
    <div className="accounts-container">
      <div className="accounts-header">
        <h2 className="accounts-title">Manage Accounts</h2>
        <button
          onClick={() => {
            setEditingAccount(null);
            setFormData({ name: "", balance: "", type: "wallet" });
            setShowModal(true);
          }}
          className="add-account-btn"
        >
          <Plus size={20} />
          Add Account
        </button>
      </div>

      <div className="accounts-grid">
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
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingAccount ? "Edit Account" : "Add Account"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="close-modal-btn"
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-form">
              <div className="form-group">
                <label className="form-label">Account Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="form-input"
                  placeholder="e.g., Main Wallet"
                />
              </div>

              {/* Show balance input only when creating new account */}
              {!editingAccount && (
                <div className="form-group">
                  <label className="form-label">Initial Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) =>
                      setFormData({ ...formData, balance: e.target.value })
                    }
                    className="form-input"
                    placeholder="0.00"
                  />
                  <p className="form-hint">
                    Set the starting balance for this account
                  </p>
                </div>
              )}

              {/* Show current balance as read-only when editing */}
              {editingAccount && (
                <div className="form-group">
                  <label className="form-label">Current Balance</label>
                  <div className="balance-display">
                    ${parseFloat(editingAccount.balance).toFixed(2)}
                  </div>
                  <p className="form-hint">
                    ⓘ Balance is automatically updated from transactions
                  </p>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Account Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="form-select"
                >
                  <option value="wallet">Wallet</option>
                  <option value="bank">Bank Account</option>
                  <option value="credit_card">Credit Card</option>
                </select>
              </div>

              <button onClick={handleSubmit} className="submit-btn">
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
