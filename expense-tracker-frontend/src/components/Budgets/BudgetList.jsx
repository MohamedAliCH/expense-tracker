import React, { useState } from "react";
import { Plus, ChartPieSlice } from "@phosphor-icons/react";
import { useApp } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";
import BudgetCard from "./BudgetCard";
import ConfirmDialog from "../ConfirmDialog";
import EmptyState from "../Common/EmptyState";
import MagneticButton from "../Common/MagneticButton";
import MoorlyModal from "../Common/MoorlyModal";
import PlanLimitBadge from "../Common/PlanLimitBadge";

const BudgetList = () => {
  const { budgetAnalysis, categories, addBudget, editBudget, removeBudget } = useApp();
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

  const openCreateModal = () => {
    setEditingBudget(null);
    setFormData({
      category_id: "",
      amount: "",
      period: "monthly",
      start_date: new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingBudget) {
        await editBudget(editingBudget.id, formData);
        showToast("Budget updated successfully.", "success");
      } else {
        await addBudget(formData);
        showToast("Budget created successfully.", "success");
      }

      setShowModal(false);
      setEditingBudget(null);
    } catch (error) {
      console.error("Error saving budget:", error);
      showToast(error.userMessage || error.message || "Failed to save budget", "error");
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
      start_date: budget.start_date
        ? String(budget.start_date).split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    try {
      await removeBudget(deleteConfirm.id);
      showToast("Budget deleted successfully.", "success");
      setDeleteConfirm({ show: false, id: null });
    } catch (error) {
      console.error("Error deleting budget:", error);
      showToast(error.userMessage || error.message || "Failed to delete budget", "error");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[26px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
              Budgets
            </h1>
            <PlanLimitBadge
              count={budgetAnalysis?.length || 0}
              limitKey="max_budgets"
              label="budgets"
            />
          </div>
          <p className="text-[13.5px] mt-0.5" style={{ color: "var(--muted)" }}>
            Set spending limits and track your financial targets across weekly, monthly, and yearly cycles.
          </p>
        </div>

        <MagneticButton
          onClick={openCreateModal}
          className="moorly-btn moorly-btn--primary self-start sm:self-auto"
        >
          <Plus size={16} weight="bold" />
          <span>New Budget</span>
        </MagneticButton>
      </header>

      {budgetAnalysis && budgetAnalysis.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetAnalysis.map((budget, idx) => (
            <BudgetCard
              key={budget.id}
              index={idx}
              budget={budget}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ChartPieSlice}
          title="No Budgets Configured"
          message="Set spending limits for your expense categories to monitor progress and avoid overspending."
          actionLabel="Create First Budget"
          onAction={openCreateModal}
        />
      )}

      <MoorlyModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editingBudget ? "Edit Budget" : "New Budget"}
        maxWidth="max-w-[460px]"
        disabled={isSubmitting}
      >
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              Category
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="moorly-select"
              required
              disabled={isSubmitting}
            >
              <option value="">Select category...</option>
              {categories
                .filter((c) => c.type === "expense")
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
                Budget Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="moorly-input font-mono"
                placeholder="0.00"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
                Period
              </label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="moorly-select"
                disabled={isSubmitting}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="moorly-input"
              required
              disabled={isSubmitting}
            />
          </div>

          <div
            className="mt-2 pt-4 flex justify-end gap-2.5"
            style={{ borderTop: "1px solid var(--line)" }}
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
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
                : editingBudget
                ? "Save Changes"
                : "Create Budget"}
            </button>
          </div>
        </form>
      </MoorlyModal>

      <ConfirmDialog
        show={deleteConfirm.show}
        title="Delete Budget"
        message="Are you sure you want to remove this budget? Historical transactions will not be affected."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
      />
    </div>
  );
};

export default BudgetList;
