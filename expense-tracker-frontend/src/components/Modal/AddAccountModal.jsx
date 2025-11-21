import React, { useState } from "react";
import { X, Plus, CreditCard, DollarSign } from "lucide-react";
import api from "../../services/api";

const AddAccountModal = ({ showModal, onClose, onAccountAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "Checking",
    balance: "",
  });
  const [loading, setLoading] = useState(false);

  if (!showModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/accounts", formData);
      onAccountAdded();
      onClose();
      setFormData({ name: "", type: "Checking", balance: "" });
    } catch (error) {
      console.error("Error adding account:", error);
      alert("Failed to add account");
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
              <Plus className="text-purple-400" size={20} />
            </div>
            Add Account
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 ml-1">
              Account Name
            </label>
            <div className="relative group">
              <CreditCard
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
                placeholder="e.g., Main Checking"
              />
            </div>
          </div>

          {/* Type */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 ml-1">
              Account Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none"
            >
              <option value="Checking" className="bg-[#1e1b4b]">
                Checking
              </option>
              <option value="Savings" className="bg-[#1e1b4b]">
                Savings
              </option>
              <option value="Credit Card" className="bg-[#1e1b4b]">
                Credit Card
              </option>
              <option value="Cash" className="bg-[#1e1b4b]">
                Cash
              </option>
              <option value="Investment" className="bg-[#1e1b4b]">
                Investment
              </option>
            </select>
          </div>

          {/* Balance */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 ml-1">
              Current Balance
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
                value={formData.balance}
                onChange={(e) =>
                  setFormData({ ...formData, balance: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Adding Account..." : "Add Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;
