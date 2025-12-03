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
import "./Transactions.css";

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
    filterMinAmount,
    setFilterMinAmount,
    filterMaxAmount,
    setFilterMaxAmount,
    filterFavorites,
    setFilterFavorites,
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
    <div className="transactions-container">
      <FilterBar
        filterType={filterType}
        setFilterType={(val) => handleFilterChange(setFilterType)(val)}
        filterMonth={filterMonth}
        setFilterMonth={(val) => handleFilterChange(setFilterMonth)(val)}
        filterMinAmount={filterMinAmount}
        setFilterMinAmount={(val) =>
          handleFilterChange(setFilterMinAmount)(val)
        }
        filterMaxAmount={filterMaxAmount}
        setFilterMaxAmount={(val) =>
          handleFilterChange(setFilterMaxAmount)(val)
        }
        filterFavorites={filterFavorites}
        setFilterFavorites={(val) =>
          handleFilterChange(setFilterFavorites)(val)
        }
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
      <div className="table-container">
        <div className="table-scroll">
          <table className="transaction-table">
            {/* TABLE HEADER */}
            <thead className="table-head">
              <tr>
                <th className="table-header-cell">Date</th>
                <th className="table-header-cell">Description</th>
                <th className="table-header-cell">Category</th>
                <th className="table-header-cell">Account</th>
                <th className="table-header-cell right">Amount</th>
                <th className="table-header-cell right">Actions</th>
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
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {startIndex + 1}-
            {Math.min(endIndex, filteredTransactions.length)} of{" "}
            {filteredTransactions.length} transactions
          </div>

          <div className="pagination-controls">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`pagination-btn ${
                currentPage === 1 ? "disabled" : "active"
              }`}
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`page-number-btn ${
                      currentPage === page ? "active" : "inactive"
                    }`}
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
              className={`pagination-btn ${
                currentPage === totalPages ? "disabled" : "active"
              }`}
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
