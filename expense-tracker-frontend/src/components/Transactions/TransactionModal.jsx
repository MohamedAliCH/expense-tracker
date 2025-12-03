import React, { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";
import "./Transactions.css";

const TransactionModal = ({ show, onClose }) => {
  const { categories, accounts, addTransaction } = useApp();
  const { showToast } = useToast();

  // ==========================================
  // FORM STATE
  // ==========================================

  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category_id: "",
    account_id: "",
    description: "",
    date: new Date().toISOString().split("T")[0], // Today's date
    is_favorite: false,
    notes: "",
  });

  // ==========================================
  // FORM HANDLERS
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.amount ||
      !formData.category_id ||
      !formData.account_id ||
      !formData.description
    ) {
      showToast("Please fill all fields", "error");
      return;
    }

    try {
      const success = await addTransaction(formData);
      if (success) {
        // Reset form
        setFormData({
          type: "expense",
          amount: "",
          category_id: "",
          account_id: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
          is_favorite: false,
          notes: "",
        });
        showToast("Transaction created successfully!", "success");
        onClose();
      } else {
        showToast("Failed to add transaction", "error");
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      showToast("Failed to add transaction", "error");
    }
  };

  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      type,
      category_id: "", // Reset category when type changes
    });
  };

  // ==========================================
  // RENDER - Return null if not showing
  // ==========================================

  if (!show) return null;

  return (
    <div className="transaction-modal-overlay">
      <div className="transaction-modal-content">
        {/* MODAL TITLE */}
        <h2 className="transaction-modal-title">Add Transaction</h2>

        <div className="transaction-form">
          {/* TRANSACTION TYPE BUTTONS */}
          <div>
            <label className="modal-label">Type</label>
            <div className="type-toggle-grid">
              <button
                type="button"
                onClick={() => handleTypeChange("expense")}
                className={`type-btn expense ${
                  formData.type === "expense" ? "active" : ""
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("income")}
                className={`type-btn income ${
                  formData.type === "income" ? "active" : ""
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* AMOUNT INPUT */}
          <div>
            <label className="modal-label">Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="modal-input"
              placeholder="0.00"
            />
          </div>

          {/* CATEGORY SELECT - Filtered by type */}
          <div>
            <label className="modal-label">Category</label>
            <select
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              className="modal-select"
            >
              <option value="">Select category</option>
              {categories
                .filter((c) => c.type === formData.type) // Only show matching type
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          {/* ACCOUNT SELECT */}
          <div>
            <label className="modal-label">Account</label>
            <select
              value={formData.account_id}
              onChange={(e) =>
                setFormData({ ...formData, account_id: e.target.value })
              }
              className="modal-select"
            >
              <option value="">Select account</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* DESCRIPTION INPUT */}
          <div>
            <label className="modal-label">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="modal-input"
              placeholder="What was this for?"
            />
          </div>

          {/* DATE INPUT */}
          <div>
            <label className="modal-label">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="modal-input"
            />
          </div>

          {/* NOTES TEXTAREA */}
          <div>
            <label className="modal-label">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="modal-textarea"
              placeholder="Add any additional notes..."
            />
          </div>

          {/* FAVORITE CHECKBOX */}
          <div className="checkbox-wrapper">
            <input
              type="checkbox"
              id="is_favorite"
              checked={formData.is_favorite}
              onChange={(e) =>
                setFormData({ ...formData, is_favorite: e.target.checked })
              }
              className="checkbox-input"
            />
            <label htmlFor="is_favorite" className="checkbox-label">
              ⭐ Mark as Favorite
            </label>
          </div>

          {/* ACTION BUTTONS */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="modal-btn cancel"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="modal-btn submit"
            >
              Add Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
