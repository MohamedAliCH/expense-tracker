import React, { useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../utils/api";

const CategoryManager = ({ categories, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
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
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData);
      }

      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: "", color: "#a855f7", type: "expense", emoji: "📊" });
      onUpdate();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category");
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
    if (
      !window.confirm(
        "Are you sure? This will affect all related transactions."
      )
    ) {
      return;
    }

    try {
      await deleteCategory(id);
      onUpdate();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
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
              <div
                key={cat.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
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
                      background: `${cat.color}33`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    {cat.emoji || "📊"}
                  </div>
                  <span style={{ color: "white", fontWeight: "500" }}>
                    {cat.name}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleEdit(cat)}
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
                    onClick={() => handleDelete(cat.id)}
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
              <div
                key={cat.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
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
                      background: `${cat.color}33`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    {cat.emoji || "📊"}
                  </div>
                  <span style={{ color: "white", fontWeight: "500" }}>
                    {cat.name}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleEdit(cat)}
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
                    onClick={() => handleDelete(cat.id)}
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
                  Emoji
                </label>
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
                  placeholder="📊"
                  maxLength="2"
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
    </div>
  );
};

export default CategoryManager;
