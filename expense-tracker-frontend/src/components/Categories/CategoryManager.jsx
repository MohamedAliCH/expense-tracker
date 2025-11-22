import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";
import CategoryItem from "./CategoryItem";
import ConfirmDialog from "../ConfirmDialog";

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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "white" }}>
          Manage Categories
        </h2>
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
          Add Category
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Expense Categories */}
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <h3
            style={{
              color: "#f87171",
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "16px",
            }}
          >
            📦 Expense Categories
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
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
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <h3
            style={{
              color: "#4ade80",
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "16px",
            }}
          >
            📈 Income Categories
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
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
              padding: "24px",
              maxWidth: "450px",
              width: "100%",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{ fontSize: "24px", fontWeight: "bold", color: "white" }}
              >
                {editingCategory ? "Edit Category" : "Add Category"}
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
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#d1d5db",
                    marginBottom: "8px",
                    fontSize: "14px",
                  }}
                >
                  Icon
                </label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {/* Emoji input */}
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) =>
                      setFormData({ ...formData, emoji: e.target.value })
                    }
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      color: "white",
                      fontSize: "24px",
                      textAlign: "center",
                    }}
                    placeholder="Type an emoji or click below"
                    maxLength="4"
                  />

                  {/* Popular emoji suggestions */}
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#9ca3af",
                        marginBottom: "8px",
                      }}
                    >
                      Popular choices:
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(6, 1fr)",
                        gap: "8px",
                      }}
                    >
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
                          style={{
                            background:
                              formData.emoji === emoji
                                ? "rgba(168,85,247,0.3)"
                                : "rgba(255,255,255,0.05)",
                            border:
                              formData.emoji === emoji
                                ? "2px solid #a855f7"
                                : "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                            padding: "8px",
                            fontSize: "24px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                      fontStyle: "italic",
                    }}
                  >
                    💡 Tip: On Windows, press <strong>Win + .</strong> to open
                    emoji picker
                  </div>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    color: "#d1d5db",
                    marginBottom: "8px",
                  }}
                >
                  Category Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
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
                  placeholder="e.g., Groceries"
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
                  Color
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  style={{
                    width: "100%",
                    height: "50px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
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
                    onClick={() =>
                      setFormData({ ...formData, type: "expense" })
                    }
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      background:
                        formData.type === "expense"
                          ? "#ef4444"
                          : "rgba(255,255,255,0.1)",
                      color: "white",
                      fontWeight: "500",
                    }}
                  >
                    📦 Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "income" })}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      background:
                        formData.type === "income"
                          ? "#10b981"
                          : "rgba(255,255,255,0.1)",
                      color: "white",
                      fontWeight: "500",
                    }}
                  >
                    📈 Income
                  </button>
                </div>
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
