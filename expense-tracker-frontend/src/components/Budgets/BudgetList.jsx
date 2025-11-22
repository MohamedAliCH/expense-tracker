import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";
import BudgetCard from "./BudgetCard";
import ConfirmDialog from "../ConfirmDialog";

const BudgetList = () => {
  const { budgetAnalysis, categories, addBudget, editBudget, removeBudget } =
    useApp();
  const { showToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    period: "monthly",
    start_date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingBudget) {
        await editBudget(editingBudget.id, formData);
        showToast("Budget updated successfully!", "success");
      } else {
        await addBudget(formData);
        showToast("Budget created successfully!", "success");
      }

      setShowModal(false);
      setEditingBudget(null);
      setFormData({
        category_id: "",
        amount: "",
        period: "monthly",
        start_date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Error saving budget:", error);
      showToast("Failed to save budget", "error");
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
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    try {
      await removeBudget(deleteConfirm.id);
      showToast("Budget deleted successfully!", "success");
      setDeleteConfirm({ show: false, id: null });
    } catch (error) {
      console.error("Error deleting budget:", error);
      showToast("Failed to delete budget", "error");
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
          <BudgetCard
            key={budget.id}
            budget={budget}
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

      {/* CONFIRMATION DIALOG */}
      <ConfirmDialog
        show={deleteConfirm.show}
        title="Delete Budget"
        message="Are you sure you want to delete this budget? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
      />
    </div>
  );
};

export default BudgetList;
