import React, { useState } from "react";
import { Plus, Vault, ArrowsLeftRight } from "@phosphor-icons/react";
import { useApp } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";
import AccountCard from "./AccountCard";
import ConfirmDialog from "../ConfirmDialog";
import EmptyState from "../Common/EmptyState";
import MagneticButton from "../Common/MagneticButton";
import MoorlyModal from "../Common/MoorlyModal";
import PlanLimitBadge from "../Common/PlanLimitBadge";
import TransferModal from "./TransferModal";

const AccountList = () => {
  const { accounts, addAccount, editAccount, removeAccount } = useApp();
  const { showToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [formData, setFormData] = useState({
    name: "",
    balance: "",
    type: "wallet",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingAccount(null);
    setFormData({ name: "", balance: "", type: "wallet" });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("Please enter an account name", "error");
      return;
    }

    if (!editingAccount && (formData.balance === "" || isNaN(formData.balance))) {
      showToast("Please enter a valid initial balance", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingAccount) {
        await editAccount(editingAccount.id, {
          name: formData.name,
          type: formData.type,
        });
        showToast("Account updated successfully.", "success");
      } else {
        await addAccount({
          name: formData.name,
          balance: parseFloat(formData.balance),
          type: formData.type,
          currency: "USD",
        });
        showToast("Account created successfully.", "success");
      }

      setShowModal(false);
      setEditingAccount(null);
      setFormData({ name: "", balance: "", type: "wallet" });
    } catch (error) {
      console.error("Error saving account:", error);
      showToast(error.userMessage || error.message || "Failed to save account", "error");
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
      showToast("Account deleted successfully.", "success");
      setDeleteConfirm({ show: false, id: null });
    } catch (error) {
      console.error("Error deleting account:", error);
      showToast(error.userMessage || error.message || "Failed to delete account", "error");
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingAccount(null);
    setFormData({ name: "", balance: "", type: "wallet" });
  };

  const totalLiquidity = (accounts || []).reduce(
    (sum, acc) => sum + parseFloat(acc.balance || 0),
    0
  );

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[26px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
              Accounts
            </h1>
            <span className="moorly-pill moorly-pill--accent font-mono">
              ${totalLiquidity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total
            </span>
            <PlanLimitBadge
              count={accounts?.length || 0}
              limitKey="max_accounts"
              label="accounts"
            />
          </div>
          <p className="text-[13.5px] mt-0.5" style={{ color: "var(--muted)" }}>
            Manage bank accounts, cash wallets, and credit cards.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {accounts && accounts.length >= 2 && (
            <button
              type="button"
              onClick={() => setShowTransferModal(true)}
              className="moorly-btn moorly-btn--ghost"
              title="Transfer funds between accounts"
            >
              <ArrowsLeftRight size={16} weight="bold" />
              <span>Transfer</span>
            </button>
          )}

          <MagneticButton
            onClick={openCreateModal}
            className="moorly-btn moorly-btn--primary"
          >
            <Plus size={16} weight="bold" />
            <span>Add Account</span>
          </MagneticButton>
        </div>
      </header>

      {accounts && accounts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {accounts.map((account, idx) => (
            <AccountCard
              key={account.id}
              index={idx}
              account={account}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Vault}
          title="No Accounts Found"
          message="Add your first cash wallet, bank account, or credit card to begin logging transactions."
          actionLabel="Add First Account"
          onAction={openCreateModal}
        />
      )}

      <MoorlyModal
        show={showModal}
        onClose={handleCancel}
        title={editingAccount ? "Edit Account" : "New Account"}
        maxWidth="max-w-[440px]"
        disabled={isSubmitting}
      >
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              Account Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="moorly-input"
              placeholder="e.g. Main Checking, Savings, Cash"
              required
              disabled={isSubmitting}
            />
          </div>

          {!editingAccount ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
                Opening Balance ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className="moorly-input font-mono"
                placeholder="0.00"
                required
                disabled={isSubmitting}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
                Current Balance
              </label>
              <div
                className="moorly-input flex items-center font-mono font-bold"
                style={{ background: "var(--card-2)", color: "var(--muted)" }}
              >
                ${parseFloat(editingAccount.balance || 0).toFixed(2)}
              </div>
              <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>
                Automatically reconciled from ledger transactions.
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              Account Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="moorly-select"
              disabled={isSubmitting}
            >
              <option value="wallet">Cash / Wallet</option>
              <option value="bank">Bank Account</option>
              <option value="credit_card">Credit Card</option>
            </select>
          </div>

          <div
            className="mt-2 pt-4 flex justify-end gap-2.5"
            style={{ borderTop: "1px solid var(--line)" }}
          >
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="moorly-btn moorly-btn--ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="moorly-btn moorly-btn--primary"
            >
              {isSubmitting
                ? "Saving..."
                : editingAccount
                ? "Save Changes"
                : "Create Account"}
            </button>
          </div>
        </form>
      </MoorlyModal>

      <ConfirmDialog
        show={deleteConfirm.show}
        title="Delete Account"
        message="Are you sure you want to delete this account? Accounts with existing transactions must have their transactions reassigned or removed first."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
      />

      <TransferModal
        show={showTransferModal}
        onClose={() => setShowTransferModal(false)}
      />
    </div>
  );
};

export default AccountList;
