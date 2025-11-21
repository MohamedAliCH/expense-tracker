import React, { useState } from "react";
import { X, Plus, Tag } from "lucide-react";
import api from "../../services/api";

const AddCategoryModal = ({ showModal, onClose, onCategoryAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    color: "#3b82f6",
    type: "expense",
  });
  const [loading, setLoading] = useState(false);

  if (!showModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/categories", formData);
      onCategoryAdded();
      onClose();
      setFormData({ name: "", color: "#3b82f6", type: "expense" });
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#84cc16",
    "#10b981",
    "#06b6d4",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#d946ef",
    "#f43f5e",
    "#64748b",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1e1b4b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Plus className="text-purple-400" size={20} />
            </div>
            Add Category
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-4 p-1 bg-white/5 rounded-xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "income" })}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                formData.type === "income"
                  ? "bg-emerald-500 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "expense" })}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                formData.type === "expense"
                  ? "bg-rose-500 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Expense
            </button>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 ml-1">
              Category Name
            </label>
            <div className="relative group">
              <Tag
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors"
                size={18}
              />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                placeholder="e.g., Groceries"
              />
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 ml-1">
              Color
            </label>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full transition-all ${
                      formData.color === color
                        ? "ring-2 ring-white scale-110"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Adding Category..." : "Add Category"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
