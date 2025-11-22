/**
 * TRANSACTION TABLE COMPONENT
 *
 * Displays all transactions in a table format with:
 * - Filtering by type (income/expense)
 * - Filtering by month
 * - Delete functionality
 *
 * Props:
 * - transactions: array - All transactions to display
 * - categories: array - For displaying category names
 * - accounts: array - For displaying account names
 * - onDelete: function - Callback when delete button clicked
 */

import React, { useState } from "react";

import { exportToCSV, exportToPDF } from "../../utils/Export";
import { useAuth } from "../../contexts/AuthContext";
import { useApp } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";
import FilterBar from "./FilterBar";
import TransactionRow from "./TransactionRow";
import ConfirmDialog from "../ConfirmDialog";

const TransactionTable = () => {
  const { user } = useAuth();
  const {
    filteredTransactions,
    categories,
    accounts,
    deleteTransaction,
    filterType,
    setFilterType,
    filterMonth,
    setFilterMonth,
  } = useApp();
  const { showToast } = useToast();

  // ==========================================
  // STATE FOR PAGINATION & EXPORT
  // ==========================================

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Export date range
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");

  // Confirmation dialog state
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex
  );

  // Reset to page 1 when filters change
  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    try {
      await deleteTransaction(deleteConfirm.id);
      showToast("Transaction deleted successfully!", "success");
      setDeleteConfirm({ show: false, id: null });
    } catch (error) {
      showToast("Failed to delete transaction", "error");
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <FilterBar
        filterType={filterType}
        setFilterType={(val) => handleFilterChange(setFilterType)(val)}
        filterMonth={filterMonth}
        setFilterMonth={(val) => handleFilterChange(setFilterMonth)(val)}
        exportStartDate={exportStartDate}
        setExportStartDate={setExportStartDate}
        exportEndDate={exportEndDate}
        setExportEndDate={setExportEndDate}
        onExportCSV={() => {
          const exportData = filteredTransactions.filter((t) => {
            if (!exportStartDate && !exportEndDate) return true;
            const tDate = new Date(t.date);
            if (exportStartDate && tDate < new Date(exportStartDate))
              return false;
            if (exportEndDate && tDate > new Date(exportEndDate)) return false;
            return true;
          });
          exportToCSV(exportData, categories, accounts, user?.name || "User");
        }}
        onExportPDF={() => {
          const exportData = filteredTransactions.filter((t) => {
            if (!exportStartDate && !exportEndDate) return true;
            const tDate = new Date(t.date);
            if (exportStartDate && tDate < new Date(exportStartDate))
              return false;
            if (exportEndDate && tDate > new Date(exportEndDate)) return false;
            return true;
          });
          exportToPDF(exportData, categories, accounts, user?.name || "User");
        }}
        filteredCount={
          filteredTransactions.filter((t) => {
            if (!exportStartDate && !exportEndDate) return true;
            const tDate = new Date(t.date);
            if (exportStartDate && tDate < new Date(exportStartDate))
              return false;
            if (exportEndDate && tDate > new Date(exportEndDate)) return false;
            return true;
          }).length
        }
      />

      {/* TRANSACTIONS TABLE */}
      <div
        style={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.2)",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            {/* TABLE HEADER */}
            <thead style={{ background: "rgba(255,255,255,0.05)" }}>
              <tr>
                <th
                  style={{
                    padding: "16px 24px",
                    textAlign: "left",
                    color: "#d1d5db",
                    fontWeight: "600",
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    padding: "16px 24px",
                    textAlign: "left",
                    color: "#d1d5db",
                    fontWeight: "600",
                  }}
                >
                  Description
                </th>
                <th
                  style={{
                    padding: "16px 24px",
                    textAlign: "left",
                    color: "#d1d5db",
                    fontWeight: "600",
                  }}
                >
                  Category
                </th>
                <th
                  style={{
                    padding: "16px 24px",
                    textAlign: "left",
                    color: "#d1d5db",
                    fontWeight: "600",
                  }}
                >
                  Account
                </th>
                <th
                  style={{
                    padding: "16px 24px",
                    textAlign: "right",
                    color: "#d1d5db",
                    fontWeight: "600",
                  }}
                >
                  Amount
                </th>
                <th
                  style={{
                    padding: "16px 24px",
                    textAlign: "right",
                    color: "#d1d5db",
                    fontWeight: "600",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>
              {paginatedTransactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  categories={categories}
                  accounts={accounts}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            padding: "16px 24px",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ color: "#d1d5db", fontSize: "14px" }}>
            Showing {startIndex + 1}-
            {Math.min(endIndex, filteredTransactions.length)} of{" "}
            {filteredTransactions.length} transactions
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                background:
                  currentPage === 1
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(168,85,247,0.2)",
                color: currentPage === 1 ? "#6b7280" : "#a855f7",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div style={{ display: "flex", gap: "4px" }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      background:
                        currentPage === page
                          ? "linear-gradient(to right, #a855f7, #ec4899)"
                          : "rgba(255,255,255,0.1)",
                      color: "white",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      cursor: "pointer",
                      fontWeight: currentPage === page ? "600" : "400",
                      fontSize: "14px",
                      minWidth: "40px",
                    }}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              style={{
                background:
                  currentPage === totalPages
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(168,85,247,0.2)",
                color: currentPage === totalPages ? "#6b7280" : "#a855f7",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
      <ConfirmDialog
        show={deleteConfirm.show}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
      />
    </div>
  );
};

export default TransactionTable;
