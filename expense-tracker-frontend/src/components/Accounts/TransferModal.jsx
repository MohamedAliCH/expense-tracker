import React, { useState } from "react";
import { ArrowsLeftRight, ArrowRight } from "@phosphor-icons/react";
import { useApp } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";
import MoorlyModal from "../Common/MoorlyModal";

const TransferModal = ({ show, onClose }) => {
  const { accounts, transferAccountFunds } = useApp();
  const { showToast } = useToast();

  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || "");
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || "");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fromAccount = accounts.find((a) => a.id === parseInt(fromAccountId));
  const toAccount = accounts.find((a) => a.id === parseInt(toAccountId));

  const transferNum = parseFloat(amount) || 0;
  const fromNewBalance = fromAccount ? parseFloat(fromAccount.balance) - transferNum : 0;
  const toNewBalance = toAccount ? parseFloat(toAccount.balance) + transferNum : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fromAccountId || !toAccountId) {
      showToast("Please select both source and destination accounts", "error");
      return;
    }

    if (fromAccountId === toAccountId) {
      showToast("Source and destination accounts must be different", "error");
      return;
    }

    if (transferNum <= 0) {
      showToast("Transfer amount must be greater than zero", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await transferAccountFunds({
        from_account_id: parseInt(fromAccountId),
        to_account_id: parseInt(toAccountId),
        amount: transferNum,
        description: description.trim() || undefined,
        date: date || undefined,
      });

      showToast(
        `Successfully transferred $${transferNum.toFixed(2)} to ${toAccount?.name || "account"}`,
        "success"
      );
      setAmount("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Transfer failed:", error);
      showToast(error.userMessage || error.message || "Failed to complete transfer", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MoorlyModal
      show={show}
      onClose={onClose}
      title="Transfer Funds"
      subtitle="Move funds between your accounts with dual ledger reconciliation"
      maxWidth="max-w-[480px]"
      disabled={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
        {/* Source & Destination Grid */}
        <div className="grid grid-cols-2 gap-3 items-center">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              From Account
            </label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="moorly-select"
              required
              disabled={isSubmitting}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (${parseFloat(acc.balance).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              To Account
            </label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="moorly-select"
              required
              disabled={isSubmitting}
            >
              {accounts
                .filter((acc) => acc.id !== parseInt(fromAccountId))
                .map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (${parseFloat(acc.balance).toFixed(2)})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Live Balance Impact Card */}
        {fromAccount && toAccount && transferNum > 0 && (
          <div
            className="p-3.5 rounded-[12px] flex items-center justify-between text-[12.5px]"
            style={{
              background: "var(--card-2)",
              border: "1px dashed var(--line-2)",
            }}
          >
            <div className="flex flex-col">
              <span className="font-semibold" style={{ color: "var(--ink-2)" }}>
                {fromAccount.name}
              </span>
              <span className="font-mono text-[13px] font-bold" style={{ color: "var(--bad)" }}>
                ${fromNewBalance.toFixed(2)}
              </span>
            </div>

            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              <ArrowRight size={14} weight="bold" />
            </div>

            <div className="flex flex-col text-right">
              <span className="font-semibold" style={{ color: "var(--ink-2)" }}>
                {toAccount.name}
              </span>
              <span className="font-mono text-[13px] font-bold" style={{ color: "var(--good)" }}>
                ${toNewBalance.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              Transfer Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="moorly-input font-mono font-bold"
              placeholder="0.00"
              required
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              Transfer Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="moorly-input"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
            Memo / Purpose (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="moorly-input"
            placeholder="e.g. Rainy day savings, Monthly allowance"
            disabled={isSubmitting}
          />
        </div>

        <div
          className="mt-2 pt-4 flex justify-end gap-2.5"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          <button
            type="button"
            onClick={onClose}
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
            <ArrowsLeftRight size={16} weight="bold" />
            <span>{isSubmitting ? "Transferring..." : "Complete Transfer"}</span>
          </button>
        </div>
      </form>
    </MoorlyModal>
  );
};

export default TransferModal;

