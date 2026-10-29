import React, { useState } from "react";
import { Plus, Tag } from "@phosphor-icons/react";
import { useApp } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";
import CategoryItem from "./CategoryItem";
import ConfirmDialog from "../ConfirmDialog";
import EmptyState from "../Common/EmptyState";
import MagneticButton from "../Common/MagneticButton";
import MoorlyModal from "../Common/MoorlyModal";
import PlanLimitBadge from "../Common/PlanLimitBadge";
import { CATEGORY_ICON_OPTIONS } from "../Common/CategoryIcon";
import { motion } from "framer-motion";

const NAUTICAL_SWATCHES = [
  "#1f7a8c",
  "#2a9d8f",
  "#4a6fa5",
  "#d97724",
  "#c85a32",
  "#bc4749",
  "#52796f",
  "#3d5a80",
];

const CategoryManager = () => {
  const { categories, addCategory, editCategory, removeCategory } = useApp();
  const { showToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [formData, setFormData] = useState({
    name: "",
    color: "#1f7a8c",
    type: "expense",
    emoji: "dining",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = (type = "expense") => {
    setEditingCategory(null);
    setFormData({
      name: "",
      color: type === "income" ? "#2a9d8f" : "#1f7a8c",
      type,
      emoji: type === "income" ? "income" : "dining",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingCategory) {
        await editCategory(editingCategory.id, formData);
        showToast("Category updated successfully.", "success");
      } else {
        await addCategory(formData);
        showToast("Category created successfully.", "success");
      }

      setShowModal(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("Error saving category:", error);
      showToast(error.userMessage || error.message || "Failed to save category", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color || "#1f7a8c",
      type: category.type,
      emoji: category.emoji || "dining",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    try {
      await removeCategory(deleteConfirm.id);
      showToast("Category deleted successfully.", "success");
      setDeleteConfirm({ show: false, id: null });
    } catch (error) {
      console.error("Error deleting category:", error);
      showToast(error.userMessage || error.message || "Failed to delete category", "error");
    }
  };

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");
  const customCategoriesCount = categories.filter((c) => !c.is_system).length;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[26px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
              Categories
            </h1>
            <PlanLimitBadge
              count={customCategoriesCount}
              limitKey="max_categories"
              label="custom"
            />
          </div>
          <p className="text-[13.5px] mt-0.5" style={{ color: "var(--muted)" }}>
            Organize income and expenses with customizable categories and color-coded icons.
          </p>
        </div>

        <MagneticButton
          onClick={() => openCreateModal("expense")}
          className="moorly-btn moorly-btn--primary self-start sm:self-auto"
        >
          <Plus size={16} weight="bold" />
          <span>New Category</span>
        </MagneticButton>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Expense Categories */}
        <section className="moorly-card flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
                Expense Categories
              </h2>
              <p className="text-[12px]" style={{ color: "var(--muted)" }}>
                Track and classify your everyday spending
              </p>
            </div>
            <span className="moorly-pill moorly-pill--bad">
              {expenseCategories.length} categories
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {expenseCategories.length > 0 ? (
              expenseCategories.map((cat) => (
                <CategoryItem
                  key={cat.id}
                  category={cat}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <EmptyState
                icon={Tag}
                title="No Expense Categories"
                message="Create categories to organize and track your expenses."
                actionLabel="Add Expense Category"
                onAction={() => openCreateModal("expense")}
              />
            )}
          </div>
        </section>

        {/* Income Categories */}
        <section className="moorly-card flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
                Income Categories
              </h2>
              <p className="text-[12px]" style={{ color: "var(--muted)" }}>
                Track salary, freelance, investments, and earnings
              </p>
            </div>
            <span className="moorly-pill moorly-pill--good">
              {incomeCategories.length} categories
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {incomeCategories.length > 0 ? (
              incomeCategories.map((cat) => (
                <CategoryItem
                  key={cat.id}
                  category={cat}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <EmptyState
                icon={Tag}
                title="No Income Categories"
                message="Create categories to organize your incoming revenue streams."
                actionLabel="Add Income Category"
                onAction={() => openCreateModal("income")}
              />
            )}
          </div>
        </section>
      </div>

      <MoorlyModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategory ? "Edit Category" : "New Category"}
        maxWidth="max-w-[460px]"
        disabled={isSubmitting}
      >
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              Category Type
            </label>
            <div className="moorly-seg w-full">
              {["expense", "income"].map((t) => {
                const active = formData.type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t })}
                    className={`moorly-seg__btn flex-1 justify-center ${active ? "is-active" : ""}`}
                    disabled={isSubmitting}
                  >
                    {active && (
                      <motion.span
                        layoutId="catModalTypeSeg"
                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        className="absolute inset-0 rounded-[8px]"
                        style={{
                          background: "var(--card)",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.12), inset 0 0 0 1px var(--line)",
                        }}
                      />
                    )}
                    <span className="relative z-10 capitalize">
                      {t === "expense" ? "Expense" : "Income"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              Category Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="moorly-input"
              placeholder="e.g. Groceries, Freelance, Utilities"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              Icon
            </label>
            <div className="grid grid-cols-8 gap-1.5">
              {CATEGORY_ICON_OPTIONS.map(({ key, label, Icon }) => {
                const selected = formData.emoji === key;
                return (
                  <button
                    key={key}
                    type="button"
                    title={label}
                    onClick={() => setFormData({ ...formData, emoji: key })}
                    className="h-9 rounded-[10px] flex items-center justify-center transition-all"
                    style={{
                      background: selected ? "var(--accent)" : "var(--card-2)",
                      color: selected ? "var(--accent-ink)" : "var(--ink-2)",
                      boxShadow: selected
                        ? "0 4px 10px -4px var(--accent)"
                        : "inset 0 0 0 1px var(--line)",
                    }}
                    disabled={isSubmitting}
                  >
                    <Icon size={17} weight={selected ? "fill" : "duotone"} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              Accent Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {NAUTICAL_SWATCHES.map((hex) => {
                const active = formData.color?.toLowerCase() === hex.toLowerCase();
                return (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: hex })}
                    className="w-8 h-8 rounded-[10px] transition-transform"
                    style={{
                      backgroundColor: hex,
                      transform: active ? "scale(1.1)" : "scale(1)",
                      boxShadow: active
                        ? `0 0 0 2px var(--bg), 0 0 0 4px ${hex}`
                        : "inset 0 0 0 1px rgba(255,255,255,0.25)",
                    }}
                  />
                );
              })}
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-8 h-8 rounded-[10px] cursor-pointer border-0 bg-transparent"
                title="Custom color"
              />
            </div>
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
                : editingCategory
                ? "Save Changes"
                : "Create Category"}
            </button>
          </div>
        </form>
      </MoorlyModal>

      <ConfirmDialog
        show={deleteConfirm.show}
        title="Delete Category"
        message="Are you sure you want to delete this category? Ensure no active transactions or budgets depend on it."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
      />
    </div>
  );
};

export default CategoryManager;
