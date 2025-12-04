import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";
import BudgetCard from "./BudgetCard";
import ConfirmDialog from "../ConfirmDialog";
import "../Common/Forms.css";
import "./Budgets.css";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

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
    } finally {
      setIsSubmitting(false);
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
    <div className="budgets-container">
      <div className="budgets-header">
        <h2 className="budgets-title">Manage Budgets</h2>
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
          className="add-budget-btn"
        >
          <Plus size={20} />
          Add Budget
        </button>
      </div>

      <div className="budgets-grid">
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
        <div className="budget-modal-overlay">
          <div className="budget-modal-content">
            <div className="budget-modal-header">
              <h3 className="budget-modal-title">
                {editingBudget ? "Edit Budget" : "Add Budget"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="close-modal-btn"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="budget-form">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className="form-select"
                  required
                  disabled={isSubmitting}
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

              <div className="form-group">
                <label className="form-label">Budget Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="form-input"
                  placeholder="0.00"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Period</label>
                <select
                  value={formData.period}
                  onChange={(e) =>
                    setFormData({ ...formData, period: e.target.value })
                  }
                  className="form-select"
                  disabled={isSubmitting}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className="form-input"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : editingBudget
                  ? "Update Budget"
                  : "Create Budget"}
              </button>
            </form>
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
