import React, { useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { createBudget, updateBudget, deleteBudget } from "../../utils/api";

const BudgetList = ({ budgets, categories, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    period: "monthly",
    start_date: new Date().toISOString().split("T")[0],
  });

  const budgetAnalysis = budgets.map((budget) => {
    const category = categories.find((c) => c.id === budget.category_id);
    return {
      id: budget.id,
      category: budget.category?.name || category?.name || "Unknown",
      color: budget.category?.color || category?.color || "#6b7280",
      emoji: budget.category?.emoji || category?.emoji || "📊",
      amount: parseFloat(budget.amount),
      spent: parseFloat(budget.spent || 0),
      percentage: budget.percentage || 0,
      remaining: parseFloat(budget.remaining || 0),
      category_id: budget.category_id,
      period: budget.period,
      start_date: budget.start_date,
    };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, formData);
      } else {
        await createBudget(formData);
      }

      setShowModal(false);
      setEditingBudget(null);
      setFormData({
        category_id: "",
        amount: "",
        period: "monthly",
        start_date: new Date().toISOString().split("T")[0],
      });
      onUpdate();
    } catch (error) {
      console.error("Error saving budget:", error);
      alert("Failed to save budget");
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category_id: budget.category_id,
      amount: budget.amount,
      period: budget.period,
      start_date: budget.start_date,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) {
      return;
    }

    try {
      await deleteBudget(id);
      onUpdate();
    } catch (error) {
      console.error("Error deleting budget:", error);
      alert("Failed to delete budget");
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
          Manage Budgets
        </h2>
        <button
          onClick={() => {
            setEditingBudget(null);
            setFormData({
              category_id: "",
              amount: "",
              period: "monthly",
              start_date: new Date().toISOString().split("T")[0],
            });
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
          Add Budget
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "24px",
        }}
      >
        {budgetAnalysis.map((budget) => (
          <div
            key={budget.id}
            style={{
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid rgba(255,255,255,0.2)",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    background: `${budget.color}33`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                  }}
                >
                  {budget.emoji || "📊"}
                </div>
                <span
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: "18px",
                  }}
                >
                  {budget.category}
                </span>
              </div>

              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "20px",
                    color: budget.percentage > 100 ? "#f87171" : "#4ade80",
                  }}
                >
                  {budget.percentage.toFixed(0)}%
                </span>
                <button
                  onClick={() => handleEdit(budget)}
                  style={{
                    background: "rgba(168,85,247,0.2)",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px",
                    cursor: "pointer",
                    color: "#a855f7",
                  }}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(budget.id)}
                  style={{
                    background: "rgba(239,68,68,0.2)",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px",
                    cursor: "pointer",
                    color: "#ef4444",
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                }}
              >
                <span style={{ color: "#9ca3af" }}>Spent</span>
                <span style={{ color: "white", fontWeight: "500" }}>
                  ${budget.spent.toFixed(2)}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                }}
              >
                <span style={{ color: "#9ca3af" }}>Budget</span>
                <span style={{ color: "white", fontWeight: "500" }}>
                  ${budget.amount.toFixed(2)}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                }}
              >
                <span style={{ color: "#9ca3af" }}>Remaining</span>
                <span
                  style={{
                    fontWeight: "500",
                    color: budget.remaining >= 0 ? "#4ade80" : "#f87171",
                  }}
                >
                  ${Math.abs(budget.remaining).toFixed(2)}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  marginTop: "4px",
                }}
              >
                <span style={{ color: "#9ca3af" }}>Period</span>
                <span
                  style={{
                    color: "white",
                    fontWeight: "500",
                    textTransform: "capitalize",
                  }}
                >
                  {budget.period}
                </span>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "9999px",
                height: "12px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "12px",
                  borderRadius: "9999px",
                  width: `${Math.min(budget.percentage, 100)}%`,
                  backgroundColor:
                    budget.percentage > 100 ? "#ef4444" : budget.color,
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            {budget.percentage > 90 && (
              <p
                style={{
                  color: "#fbbf24",
                  fontSize: "14px",
                  marginTop: "12px",
                  fontWeight: "500",
                }}
              >
                ⚠️{" "}
                {budget.percentage > 100
                  ? "Budget exceeded!"
                  : "Almost at budget limit"}
              </p>
            )}
          </div>
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
                {editingBudget ? "Edit Budget" : "Add Budget"}
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
                    padding: "12px 16px",
                    color: "white",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Select category</option>
                  {categories
                    .filter((c) => c.type === "expense")
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji || "📊"} {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    color: "#d1d5db",
                    marginBottom: "8px",
                  }}
                >
                  Budget Amount
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
                    padding: "12px 16px",
                    color: "white",
                    fontSize: "16px",
                  }}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    color: "#d1d5db",
                    marginBottom: "8px",
                  }}
                >
                  Period
                </label>
                <select
                  value={formData.period}
                  onChange={(e) =>
                    setFormData({ ...formData, period: e.target.value })
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
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    color: "#d1d5db",
                    marginBottom: "8px",
                  }}
                >
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
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
                />
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
                {editingBudget ? "Update Budget" : "Create Budget"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetList;
