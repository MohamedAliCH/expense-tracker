import React, { useState, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";
import { motion } from "framer-motion";
import { Star, Repeat, Paperclip, X, Sparkle } from "@phosphor-icons/react";
import MoorlyModal from "../Common/MoorlyModal";
import { categorizeWithAi } from "../../utils/api";

const TransactionModal = ({ show, onClose, editingTransaction = null }) => {
  const { categories, accounts, addTransaction, editTransaction } = useApp();
  const { showToast } = useToast();
  const [shakeError, setShakeError] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [aiSuggesting, setAiSuggesting] = useState(false);

  const handleAiSuggestCategory = async () => {
    if (!formData.description || formData.description.length < 3) {
      showToast("Enter a description first for AI categorization", "info");
      return;
    }
    setAiSuggesting(true);
    try {
      const res = await categorizeWithAi(formData.description, parseFloat(formData.amount || 0));
      if (res?.data?.category_id) {
        setFormData((prev) => ({
          ...prev,
          category_id: String(res.data.category_id),
        }));
        showToast(`Matched to "${res.data.category_name}" via AI`, "success");
      }
    } catch {
      showToast("AI categorization unavailable", "info");
    } finally {
      setAiSuggesting(false);
    }
  };

  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category_id: "",
    account_id: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    is_favorite: false,
    notes: "",
    is_recurring: false,
    recurring_frequency: "monthly",
  });

  useEffect(() => {
    if (editingTransaction && show) {
      setFormData({
        type: editingTransaction.type || "expense",
        amount: editingTransaction.amount || "",
        category_id: editingTransaction.category_id || "",
        account_id: editingTransaction.account_id || "",
        description: editingTransaction.description || "",
        date: editingTransaction.date
          ? String(editingTransaction.date).split("T")[0]
          : new Date().toISOString().split("T")[0],
        is_favorite: !!editingTransaction.is_favorite,
        notes: editingTransaction.notes || "",
        is_recurring: !!editingTransaction.is_recurring,
        recurring_frequency: editingTransaction.recurring_frequency || "monthly",
      });
      setReceiptFile(null);
    } else if (!editingTransaction && show) {
      setFormData({
        type: "expense",
        amount: "",
        category_id: "",
        account_id: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        is_favorite: false,
        notes: "",
        is_recurring: false,
        recurring_frequency: "monthly",
      });
      setReceiptFile(null);
    }
  }, [editingTransaction, show]);

  const triggerWiggle = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 450);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.amount ||
      !formData.category_id ||
      !formData.account_id ||
      !formData.description
    ) {
      triggerWiggle();
      showToast("Please fill in all required fields", "error");
      return;
    }

    try {
      let payload;
      if (receiptFile) {
        payload = new FormData();
        payload.append("type", formData.type);
        payload.append("amount", formData.amount);
        payload.append("category_id", formData.category_id);
        payload.append("account_id", formData.account_id);
        payload.append("description", formData.description);
        payload.append("date", formData.date);
        payload.append("is_favorite", formData.is_favorite ? "1" : "0");
        if (formData.notes) payload.append("notes", formData.notes);
        payload.append("is_recurring", formData.is_recurring ? "1" : "0");
        payload.append("recurring_frequency", formData.recurring_frequency);
        payload.append("receipt", receiptFile);
      } else {
        payload = { ...formData };
      }

      let success;
      if (editingTransaction) {
        success = await editTransaction(editingTransaction.id, payload);
      } else {
        success = await addTransaction(payload);
      }

      if (success) {
        setFormData({
          type: "expense",
          amount: "",
          category_id: "",
          account_id: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
          is_favorite: false,
          notes: "",
          is_recurring: false,
          recurring_frequency: "monthly",
        });
        setReceiptFile(null);
        showToast(
          editingTransaction
            ? "Transaction updated successfully."
            : "Transaction saved successfully.",
          "success"
        );
        onClose();
      } else {
        triggerWiggle();
        showToast("Failed to save transaction.", "error");
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
      triggerWiggle();
      showToast(error.userMessage || error.message || "Failed to save transaction.", "error");
    }
  };

  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      type,
      category_id: "",
    });
  };

  const isEditing = Boolean(editingTransaction);

  return (
    <MoorlyModal
      show={show}
      onClose={onClose}
      title={isEditing ? "Edit Transaction" : "New Transaction"}
      subtitle={
        isEditing
          ? `Modify transaction #${editingTransaction.id} details`
          : "Record an expense, income, or recurring commitment"
      }
      maxWidth="max-w-[500px]"
      shake={shakeError}
    >
      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
        {/* Segmented Type Switcher */}
        <div className="moorly-seg w-full">
          {[
            { id: "expense", label: "Expense" },
            { id: "income", label: "Income" },
          ].map((tab) => {
            const active = formData.type === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTypeChange(tab.id)}
                className={`moorly-seg__btn flex-1 justify-center ${active ? "is-active" : ""}`}
              >
                {active && (
                  <motion.span
                    layoutId="txModalSeg"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-[8px]"
                    style={{
                      background: "var(--card)",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.12), inset 0 0 0 1px var(--line)",
                    }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="moorly-input font-mono font-bold"
              placeholder="0.00"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              Effective Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="moorly-input"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="moorly-input"
            placeholder="e.g. Grocery store, Client invoice, Coffee"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
                Category
              </label>
              {formData.description && formData.description.length >= 3 && (
                <button
                  type="button"
                  onClick={handleAiSuggestCategory}
                  disabled={aiSuggesting}
                  className="text-[11px] font-mono flex items-center gap-1 transition-opacity hover:opacity-80"
                  style={{ color: "var(--accent)" }}
                  title="Auto-detect category with AI"
                >
                  <Sparkle size={12} weight="duotone" />
                  <span>{aiSuggesting ? "Detecting..." : "AI Match"}</span>
                </button>
              )}
            </div>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="moorly-select"
            >
              <option value="">Select category...</option>
              {categories
                .filter((c) => c.type === formData.type)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              Account
            </label>
            <select
              value={formData.account_id}
              onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
              className="moorly-select"
            >
              <option value="">Select account...</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recurring Controls */}
        <div
          className="p-3 rounded-[12px] flex items-center justify-between gap-3"
          style={{ background: "var(--card-2)", border: "1px solid var(--line-2)" }}
        >
          <button
            type="button"
            onClick={() => setFormData({ ...formData, is_recurring: !formData.is_recurring })}
            className="flex items-center gap-2.5 text-[12.5px] font-semibold text-left"
            style={{ color: formData.is_recurring ? "var(--accent)" : "var(--ink-2)" }}
          >
            <span
              className="w-6 h-6 rounded-[8px] flex items-center justify-center transition-colors"
              style={{
                background: formData.is_recurring ? "var(--accent-soft)" : "var(--card)",
                color: formData.is_recurring ? "var(--accent)" : "var(--muted)",
                boxShadow: "inset 0 0 0 1px var(--line)",
              }}
            >
              <Repeat size={14} weight="bold" />
            </span>
            <span>Recurring cycle</span>
          </button>

          {formData.is_recurring && (
            <select
              value={formData.recurring_frequency}
              onChange={(e) => setFormData({ ...formData, recurring_frequency: e.target.value })}
              className="moorly-select !h-8 !w-auto !text-[12px] !py-0 !px-2.5 font-semibold"
            >
              <option value="weekly">Every Week</option>
              <option value="monthly">Every Month</option>
              <option value="yearly">Every Year</option>
            </select>
          )}
        </div>

        {/* Receipt Attachment Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-semibold flex items-center justify-between" style={{ color: "var(--ink-2)" }}>
            <span className="flex items-center gap-1.5">
              <Paperclip size={14} weight="bold" />
              <span>Attach Receipt / Invoice (Optional)</span>
            </span>
            {receiptFile && (
              <button
                type="button"
                onClick={() => setReceiptFile(null)}
                className="text-[11.5px] font-medium flex items-center gap-1 hover:underline"
                style={{ color: "var(--bad)" }}
              >
                <X size={12} weight="bold" />
                <span>Remove</span>
              </button>
            )}
          </label>

          {!receiptFile ? (
            <label className="border border-dashed rounded-[10px] px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:border-[var(--accent)] transition-colors" style={{ borderColor: "var(--line-2)", background: "var(--card-2)" }}>
              <span className="text-[12px]" style={{ color: "var(--muted)" }}>
                Upload receipt image or PDF (max 10MB)
              </span>
              <span className="moorly-btn moorly-btn--ghost !h-7 !text-[11.5px] !px-2.5">
                Browse
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={(e) => {
                  if (e.target.files?.[0]) setReceiptFile(e.target.files[0]);
                }}
                className="hidden"
              />
            </label>
          ) : (
            <div className="px-3 py-2 rounded-[10px] flex items-center justify-between text-[12px]" style={{ background: "var(--accent-soft)", color: "var(--accent-text)", border: "1px solid var(--accent)" }}>
              <span className="truncate max-w-[320px] font-medium">
                {receiptFile.name} ({(receiptFile.size / 1024).toFixed(0)} KB)
              </span>
              <span className="font-bold text-[11px] uppercase">Ready</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="moorly-textarea resize-none"
            placeholder="Additional notes or memo..."
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, is_favorite: !formData.is_favorite })}
            className="flex items-center gap-2.5 text-[13px] font-semibold"
            style={{ color: formData.is_favorite ? "var(--warm-text)" : "var(--ink-2)" }}
          >
            <span
              className="w-6 h-6 rounded-[8px] flex items-center justify-center transition-colors"
              style={{
                background: formData.is_favorite ? "var(--warm-soft)" : "var(--card-2)",
                color: formData.is_favorite ? "var(--warm)" : "var(--muted)",
                boxShadow: "inset 0 0 0 1px var(--line-2)",
              }}
            >
              <Star size={14} weight={formData.is_favorite ? "fill" : "regular"} />
            </span>
            <span>Mark as favorite</span>
          </button>
        </div>

        <div
          className="flex items-center justify-end gap-2.5 pt-4 mt-1"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="moorly-btn moorly-btn--ghost"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="moorly-btn moorly-btn--primary"
          >
            {isEditing ? "Save Changes" : `Save ${formData.type === "expense" ? "Expense" : "Income"}`}
          </button>
        </div>
      </form>
    </MoorlyModal>
  );
};

export default TransactionModal;
