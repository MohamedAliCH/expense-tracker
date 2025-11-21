/**
 * TRANSACTION MODAL COMPONENT
 *
 * Modal popup for adding new transactions with form:
 * - Transaction type (Income/Expense)
 * - Amount
 * - Category (filtered by type)
 * - Account
 * - Description
 * - Date
 *
 * Props:
 * - show: boolean - Controls modal visibility
 * - onClose: function - Callback to close modal
 * - onSubmit: function - Callback when form submitted
 * - categories: array - All categories
 * - accounts: array - All accounts
 */

import React, { useState } from "react";
import { useApp } from "../../contexts/AppContext";

const TransactionModal = ({ show, onClose }) => {
  const { categories, accounts, addTransaction } = useApp();

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
      alert("Please fill all fields");
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
        });
        onClose();
      } else {
        alert("Failed to add transaction");
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to add transaction");
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
          maxWidth: "28rem",
          width: "100%",
          border: "1px solid rgba(255,255,255,0.2)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* MODAL TITLE */}
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "white",
            marginBottom: "24px",
          }}
        >
          Add Transaction
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* TRANSACTION TYPE BUTTONS */}
          <div>
            <label
              style={{
                display: "block",
                color: "#d1d5db",
                marginBottom: "8px",
              }}
            >
              Type
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <button
                type="button"
                onClick={() => handleTypeChange("expense")}
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  fontWeight: "500",
                  border: "none",
                  cursor: "pointer",
                  background:
                    formData.type === "expense"
                      ? "#ef4444"
                      : "rgba(255,255,255,0.1)",
                  color: "white",
                  transition: "all 0.2s",
                }}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("income")}
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  fontWeight: "500",
                  border: "none",
                  cursor: "pointer",
                  background:
                    formData.type === "income"
                      ? "#10b981"
                      : "rgba(255,255,255,0.1)",
                  color: "white",
                  transition: "all 0.2s",
                }}
              >
                Income
              </button>
            </div>
          </div>

          {/* AMOUNT INPUT */}
          <div>
            <label
              style={{
                display: "block",
                color: "#d1d5db",
                marginBottom: "8px",
              }}
            >
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                padding: "8px 16px",
                color: "white",
                fontSize: "16px",
              }}
              placeholder="0.00"
            />
          </div>

          {/* CATEGORY SELECT - Filtered by type */}
          <div>
            <label
              style={{
                display: "block",
                color: "#d1d5db",
                marginBottom: "8px",
              }}
            >
              Category
            </label>
            <select
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                padding: "8px 16px",
                color: "white",
                fontSize: "16px",
              }}
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
            <label
              style={{
                display: "block",
                color: "#d1d5db",
                marginBottom: "8px",
              }}
            >
              Account
            </label>
            <select
              value={formData.account_id}
              onChange={(e) =>
                setFormData({ ...formData, account_id: e.target.value })
              }
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                padding: "8px 16px",
                color: "white",
                fontSize: "16px",
              }}
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
            <label
              style={{
                display: "block",
                color: "#d1d5db",
                marginBottom: "8px",
              }}
            >
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                padding: "8px 16px",
                color: "white",
                fontSize: "16px",
              }}
              placeholder="What was this for?"
            />
          </div>

          {/* DATE INPUT */}
          <div>
            <label
              style={{
                display: "block",
                color: "#d1d5db",
                marginBottom: "8px",
              }}
            >
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                padding: "8px 16px",
                color: "white",
                fontSize: "16px",
              }}
            />
          </div>

          {/* ACTION BUTTONS */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              paddingTop: "16px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.1)",
                color: "white",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
              }
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              style={{
                flex: 1,
                background: "linear-gradient(to right, #a855f7, #ec4899)",
                color: "white",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.2s",
              }}
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
