import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Calendar,
  DollarSign,
  Tag,
  CreditCard,
  FileText,
} from "lucide-react";
import api from "../../services/api";

const EditTransactionModal = ({
  showModal,
  onClose,
  transaction,
  categories,
  accounts,
  onTransactionUpdated,
}) => {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense",
    category_id: "",
    account_id: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category_id: transaction.category_id,
        account_id: transaction.account_id,
        date: transaction.date.split("T")[0],
      });
    }
  }, [transaction]);

  if (!showModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/transactions/${transaction.id}`, formData);
      onTransactionUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Failed to update transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1e1b4b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Save className="text-purple-400" size={20} />
            </div>
            Edit Transaction
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

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 ml-1">
              Amount
            </label>
            <div className="relative group">
              <DollarSign
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors"
                size={18}
              />
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 ml-1">
              Description
            </label>
            <div className="relative group">
              <FileText
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors"
                size={18}
              />
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                placeholder="What was this for?"
              />
            </div>
          </div>

          {/* Category & Account */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 ml-1">
                Category
              </label>
              <div className="relative group">
                <Tag
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors"
                  size={18}
                />
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none"
                >
                  <option value="" className="bg-[#1e1b4b]">
                    Select Category
                  </option>
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                      className="bg-[#1e1b4b]"
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 ml-1">
                Account
              </label>
              <div className="relative group">
                <CreditCard
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors"
                  size={18}
                />
                <select
                  required
                  value={formData.account_id}
                  onChange={(e) =>
                    setFormData({ ...formData, account_id: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none"
                >
                  <option value="" className="bg-[#1e1b4b]">
                    Select Account
                  </option>
                  {accounts.map((account) => (
                    <option
                      key={account.id}
                      value={account.id}
                      className="bg-[#1e1b4b]"
                    >
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 ml-1">
              Date
            </label>
            <div className="relative group">
              <Calendar
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors"
                size={18}
              />
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Saving Changes..." : "Update Transaction"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;
