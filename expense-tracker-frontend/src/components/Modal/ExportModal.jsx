import React, { useState } from "react";
import { X, Download, FileText, FileSpreadsheet, Calendar } from "lucide-react";
import api from "../../services/api";

const ExportModal = ({ isOpen, onClose }) => {
  const [format, setFormat] = useState("pdf");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await api.get("/reports/export", {
        params: {
          format,
          start_date: dateRange.start,
          end_date: dateRange.end,
        },
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const extension = format === "pdf" ? "pdf" : "xlsx";
      link.setAttribute("download", `transactions_report.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export report. Please try again.");
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
            <Download className="text-purple-400" size={24} />
            Export Transactions
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormat("pdf")}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                  format === "pdf"
                    ? "bg-purple-500/20 border-purple-500 text-white"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                }`}
              >
                <FileText size={24} />
                <span className="font-medium">PDF</span>
              </button>
              <button
                onClick={() => setFormat("excel")}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                  format === "excel"
                    ? "bg-green-500/20 border-green-500 text-white"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                }`}
              >
                <FileSpreadsheet size={24} />
                <span className="font-medium">Excel</span>
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Calendar size={16} />
              Date Range (Optional)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-gray-400">From</span>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-400">To</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download size={18} />
                Export Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
