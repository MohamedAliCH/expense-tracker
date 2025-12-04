import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";
import AccountCard from "./AccountCard";
import ConfirmDialog from "../ConfirmDialog";
import EmptyState from "../Common/EmptyState";
import "../Common/Forms.css";
import "./Accounts.css";

const AccountList = () => {
  const { accounts, addAccount, editAccount, removeAccount } = useApp();
  const { showToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [formData, setFormData] = useState({
    name: "",
    balance: "",
    type: "wallet",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      showToast("Please enter an account name", "error");
      return;
    }

    if (!editingAccount && (!formData.balance || isNaN(formData.balance))) {
      showToast("Please enter a valid initial balance", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingAccount) {
        // When editing, only send name and type (not balance)
        const updateData = {
          name: formData.name,
          type: formData.type,
        };
        await editAccount(editingAccount.id, updateData);
        showToast("Account updated successfully!", "success");
      } else {
        const accountData = {
          name: formData.name,
          balance: parseFloat(formData.balance),
          type: formData.type,
        };
        await addAccount(accountData);
        showToast("Account created successfully!", "success");
      }

      // Reset form and close modal
      setShowModal(false);
      setEditingAccount(null);
      setFormData({ name: "", balance: "", type: "wallet" });
    } catch (error) {
      console.error("Error saving account:", error);
      showToast(error.message || "Failed to save account", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      balance: account.balance,
      type: account.type,
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    try {
      await removeAccount(deleteConfirm.id);
      showToast("Account deleted successfully!", "success");
      setDeleteConfirm({ show: false, id: null });
    } catch (error) {
      console.error("Error deleting account:", error);
      showToast(error.message || "Failed to delete account", "error");
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingAccount(null);
    setFormData({ name: "", balance: "", type: "wallet" });
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
        {accounts && accounts.length > 0 ? (
          accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <EmptyState
            icon="💳"
            title="No Accounts Yet"
            message="Create your first account to start tracking your finances. You can add bank accounts, wallets, or credit cards."
            actionLabel="Add Your First Account"
            onAction={() => {
              setEditingAccount(null);
              setFormData({ name: "", balance: "", type: "wallet" });
              setShowModal(true);
            }}
          />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingAccount ? "Edit Account" : "Add Account"}
              </h3>
              <button
                onClick={handleCancel}
                className="close-modal-btn"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Account Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="form-input"
                  placeholder="e.g., Main Wallet"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Show balance input only when creating new account */}
              {!editingAccount && (
                <div className="form-group">
                  <label className="form-label">Initial Balance *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) =>
                      setFormData({ ...formData, balance: e.target.value })
                    }
                    className="form-input"
                    placeholder="0.00"
                    required
                    disabled={isSubmitting}
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
                  disabled={isSubmitting}
                >
                  <option value="wallet">Wallet</option>
                  <option value="bank">Bank Account</option>
                  <option value="credit_card">Credit Card</option>
                </select>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : editingAccount
                  ? "Update Account"
                  : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
      <ConfirmDialog
        show={deleteConfirm.show}
        title="Delete Account"
        message="Are you sure you want to delete this account? All associated transactions will also be deleted."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
      />
    </div>
  );
};

export default AccountList;
