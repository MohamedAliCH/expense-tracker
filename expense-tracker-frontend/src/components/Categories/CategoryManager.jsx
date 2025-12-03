import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";
import CategoryItem from "./CategoryItem";
import ConfirmDialog from "../ConfirmDialog";
import "./Categories.css";

const CategoryManager = () => {
  const { categories, addCategory, editCategory, removeCategory } = useApp();
  const { showToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [formData, setFormData] = useState({
    name: "",
    color: "#a855f7",
    type: "expense",
    emoji: "📊",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await editCategory(editingCategory.id, formData);
        showToast("Category updated successfully!", "success");
      } else {
        await addCategory(formData);
        showToast("Category created successfully!", "success");
      }

      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: "", color: "#a855f7", type: "expense", emoji: "📊" });
    } catch (error) {
      console.error("Error saving category:", error);
      showToast(error.message || "Failed to save category", "error");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      type: category.type,
      emoji: category.emoji || "📊",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    try {
      await removeCategory(deleteConfirm.id);
      showToast("Category deleted successfully!", "success");
      setDeleteConfirm({ show: false, id: null });
    } catch (error) {
      console.error("Error deleting category:", error);
      showToast(error.message || "Failed to delete category", "error");
    }
  };

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  return (
    <div className="category-manager">
      <div className="category-header">
        <h2 className="category-title">Manage Categories</h2>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({
              name: "",
              color: "#a855f7",
              type: "expense",
              emoji: "📊",
            });
            setShowModal(true);
          }}
          className="category-add-button"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className="category-grid">
        {/* Expense Categories */}
        <div className="category-section">
          <h3 className="category-section-title expense">
            📦 Expense Categories
          </h3>
          <div className="category-list">
            {expenseCategories.map((cat) => (
              <CategoryItem
                key={cat.id}
                category={cat}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>

        {/* Income Categories */}
        <div className="category-section">
          <h3 className="category-section-title income">
            📈 Income Categories
          </h3>
          <div className="category-list">
            {incomeCategories.map((cat) => (
              <CategoryItem
                key={cat.id}
                category={cat}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="category-modal-overlay">
          <div className="category-modal">
            <div className="category-modal-header">
              <h3 className="category-modal-title">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="category-modal-close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="category-form">
              <div className="category-form-group">
                <label className="category-label">Icon</label>
                <div className="category-emoji-suggestions">
                  {/* Emoji input */}
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) =>
                      setFormData({ ...formData, emoji: e.target.value })
                    }
                    className="category-emoji-input"
                    placeholder="Type an emoji or click below"
                    maxLength="4"
                  />

                  {/* Popular emoji suggestions */}
                  <div>
                    <div className="category-emoji-label">Popular choices:</div>
                    <div className="category-emoji-grid">
                      {[
                        "🍽️",
                        "🚗",
                        "🛍️",
                        "💡",
                        "🏥",
                        "🎮",
                        "💰",
                        "💼",
                        "📈",
                        "🏠",
                        "✈️",
                        "🎓",
                      ].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormData({ ...formData, emoji })}
                          className={`category-emoji-button ${
                            formData.emoji === emoji ? "selected" : ""
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="category-emoji-tip">
                    💡 Tip: On Windows, press <strong>Win + .</strong> to open
                    emoji picker
                  </div>
                </div>
              </div>

              <div className="category-form-group">
                <label className="category-label">Category Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="category-input"
                  placeholder="e.g., Groceries"
                />
              </div>

              <div className="category-form-group">
                <label className="category-label">Color</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="category-color-input"
                />
              </div>

              <div className="category-form-group">
                <label className="category-label">Type</label>
                <div className="category-type-buttons">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, type: "expense" })
                    }
                    className={`category-type-button ${
                      formData.type === "expense" ? "expense" : ""
                    }`}
                  >
                    📦 Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "income" })}
                    className={`category-type-button ${
                      formData.type === "income" ? "income" : ""
                    }`}
                  >
                    📈 Income
                  </button>
                </div>
              </div>

              <button onClick={handleSubmit} className="category-submit-button">
                {editingCategory ? "Update Category" : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
      <ConfirmDialog
        show={deleteConfirm.show}
        title="Delete Category"
        message="Are you sure you want to delete this category? Make sure it has no transactions or budgets associated with it."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
      />
    </div>
  );
};

export default CategoryManager;
