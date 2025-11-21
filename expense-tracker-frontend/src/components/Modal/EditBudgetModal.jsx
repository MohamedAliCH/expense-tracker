import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import api from "../../services/api";

const EditBudgetModal = ({
  showModal,
  onClose,
  budget,
  categories,
  onBudgetUpdated,
}) => {
  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    period: "monthly",
    start_date: "",
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        category_id: budget.category_id,
        amount: budget.amount,
        period: budget.period,
        start_date: budget.start_date,
      });
    }
  }, [budget]);

  if (!showModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/budgets/${budget.id}`, formData);
      onBudgetUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating budget:", error);
      alert("Failed to update budget");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Edit Budget</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Category</label>
            <select
              className="glass-input"
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Amount</label>
            <input
              type="number"
              className="glass-input"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Period</label>
            <select
              className="glass-input"
              value={formData.period}
              onChange={(e) =>
                setFormData({ ...formData, period: e.target.value })
              }
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <button type="submit" className="glass-button w-full mt-6">
            Update Budget
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditBudgetModal;
