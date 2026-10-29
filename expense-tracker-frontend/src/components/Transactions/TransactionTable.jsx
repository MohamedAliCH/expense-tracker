import React, { useState, useEffect } from "react";
import {
  ArrowsLeftRight,
  Plus,
  UploadSimple,
  Repeat,
  CaretUp,
  CaretDown,
  ArrowsDownUp,
  Trash,
  DownloadSimple,
  X,
  CheckSquare,
} from "@phosphor-icons/react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { exportToCSV, exportToPDF } from "../../utils/Export";
import { useAuth } from "../../contexts/AuthContext";
import { useApp } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import FilterBar from "./FilterBar";
import TransactionRow from "./TransactionRow";
import TransactionModal from "./TransactionModal";
import ConfirmDialog from "../ConfirmDialog";
import EmptyState from "../Common/EmptyState";
import MagneticButton from "../Common/MagneticButton";
import CsvImportModal from "./CsvImportModal";
import ReceiptModal from "./ReceiptModal";

const TransactionTable = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const outletContext = useOutletContext() || {};
  const {
    filteredTransactions,
    categories,
    accounts,
    deleteTransaction,
    deleteMultipleTransactions,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterAccount,
    setFilterAccount,
    filterMinAmount,
    setFilterMinAmount,
    filterMaxAmount,
    setFilterMaxAmount,
    filterFavorites,
    setFilterFavorites,
    datePreset,
    setDatePreset,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currency,
    triggerRecurringProcessing,
  } = useApp();
  const { showToast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [receiptModalTx, setReceiptModalTx] = useState(null);
  const [isProcessingRecurring, setIsProcessingRecurring] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  // Sync initial URL search params on mount
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam && ["income", "expense", "all"].includes(typeParam)) {
      setFilterType(typeParam);
    }
    const accountParam = searchParams.get("account");
    if (accountParam) {
      setFilterAccount(accountParam);
    }
    const presetParam = searchParams.get("period");
    if (presetParam) {
      setDatePreset(presetParam);
    }
    const searchParam = searchParams.get("q");
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state to URL search params when filters change
  useEffect(() => {
    const params = {};
    if (filterType && filterType !== "all") params.type = filterType;
    if (filterAccount && filterAccount !== "all") params.account = filterAccount;
    if (datePreset && datePreset !== "all") params.period = datePreset;
    if (searchQuery && searchQuery.trim() !== "") params.q = searchQuery;

    setSearchParams(params, { replace: true });
  }, [filterType, filterAccount, datePreset, searchQuery, setSearchParams]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const allCurrentPageSelected =
    paginatedTransactions.length > 0 &&
    paginatedTransactions.every((t) => selectedIds.includes(t.id));

  const handleToggleSelectAll = () => {
    if (allCurrentPageSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedTransactions.some((t) => t.id === id))
      );
    } else {
      setSelectedIds((prev) => {
        const merged = new Set([...prev, ...paginatedTransactions.map((t) => t.id)]);
        return Array.from(merged);
      });
    }
  };

  const handleToggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkExportCSV = () => {
    const selectedTransactions = filteredTransactions.filter((t) =>
      selectedIds.includes(t.id)
    );
    exportToCSV(
      selectedTransactions,
      categories,
      accounts,
      `${user?.name || "User"}_selected`,
      currency
    );
    showToast(`Exported ${selectedTransactions.length} transactions to CSV.`, "success");
  };

  const handleDelete = async (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    try {
      await deleteTransaction(deleteConfirm.id);
      showToast("Transaction deleted successfully.", "success");
      setDeleteConfirm({ show: false, id: null });
      setSelectedIds((prev) => prev.filter((i) => i !== deleteConfirm.id));
    } catch (error) {
      showToast("Failed to delete transaction", "error");
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await deleteMultipleTransactions(selectedIds);
      showToast(`Removed ${selectedIds.length} transactions from ledger.`, "success");
      setSelectedIds([]);
      setBulkDeleteConfirm(false);
    } catch (err) {
      showToast("Failed to delete selected entries", "error");
    }
  };

  const handleProcessRecurring = async () => {
    setIsProcessingRecurring(true);
    try {
      const res = await triggerRecurringProcessing();
      showToast(
        res.processed_count > 0
          ? `Processed ${res.processed_count} due recurring transactions!`
          : "All recurring transactions are up to date.",
        "success"
      );
    } catch (err) {
      showToast("Failed to process recurring transactions", "error");
    } finally {
      setIsProcessingRecurring(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[26px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
              Transactions
            </h1>
            <span className="moorly-pill moorly-pill--accent">
              {filteredTransactions.length} total
            </span>
          </div>
          <p className="text-[13.5px] mt-0.5" style={{ color: "var(--muted)" }}>
            View, search, sort, filter, edit, import, and export transactions across your accounts.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Process Recurring Quick Trigger */}
          <button
            type="button"
            onClick={handleProcessRecurring}
            disabled={isProcessingRecurring}
            className="moorly-btn moorly-btn--ghost"
            title="Scan and post any recurring expenses or incomes due today"
          >
            <Repeat size={15} weight="bold" className={isProcessingRecurring ? "animate-spin" : ""} />
            <span className="hidden md:inline">Check Recurring</span>
          </button>

          {/* Import Bank CSV Button */}
          <button
            type="button"
            onClick={() => setShowCsvImport(true)}
            className="moorly-btn moorly-btn--ghost"
            title="Import transactions from bank CSV"
          >
            <UploadSimple size={16} weight="bold" />
            <span>Import CSV</span>
          </button>

          {outletContext.onAddTransaction && (
            <MagneticButton
              onClick={outletContext.onAddTransaction}
              className="moorly-btn moorly-btn--primary"
            >
              <Plus size={16} weight="bold" />
              <span>New Transaction</span>
            </MagneticButton>
          )}
        </div>
      </header>

      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={(val) => handleFilterChange(setSearchQuery)(val)}
        filterType={filterType}
        setFilterType={(val) => handleFilterChange(setFilterType)(val)}
        filterAccount={filterAccount}
        setFilterAccount={(val) => handleFilterChange(setFilterAccount)(val)}
        accounts={accounts}
        filterMinAmount={filterMinAmount}
        setFilterMinAmount={(val) => handleFilterChange(setFilterMinAmount)(val)}
        filterMaxAmount={filterMaxAmount}
        setFilterMaxAmount={(val) => handleFilterChange(setFilterMaxAmount)(val)}
        filterFavorites={filterFavorites}
        setFilterFavorites={(val) => handleFilterChange(setFilterFavorites)(val)}
        datePreset={datePreset}
        setDatePreset={(val) => handleFilterChange(setDatePreset)(val)}
        startDate={startDate}
        setStartDate={(val) => handleFilterChange(setStartDate)(val)}
        endDate={endDate}
        setEndDate={(val) => handleFilterChange(setEndDate)(val)}
        onExportCSV={() => {
          exportToCSV(filteredTransactions, categories, accounts, user?.name || "User", currency);
        }}
        onExportPDF={() => {
          exportToPDF(filteredTransactions, categories, accounts, user?.name || "User", currency);
        }}
        filteredCount={filteredTransactions.length}
      />

      {/* Floating Multi-Select Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            className="p-3 px-4 rounded-[14px] flex flex-wrap items-center justify-between gap-3 shadow-md"
            style={{
              background: "var(--accent-soft)",
              border: "1px solid var(--accent)",
              color: "var(--accent-text)",
            }}
          >
            <div className="flex items-center gap-2">
              <CheckSquare size={17} weight="fill" />
              <span className="font-semibold text-[13px]">
                {selectedIds.length} {selectedIds.length === 1 ? "entry" : "entries"} selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkExportCSV}
                className="moorly-btn moorly-btn--sm !h-[30px] !text-[12px]"
              >
                <DownloadSimple size={13} weight="bold" />
                <span>Export Selected</span>
              </button>
              <button
                type="button"
                onClick={() => setBulkDeleteConfirm(true)}
                className="moorly-btn moorly-btn--sm !h-[30px] !text-[12px]"
                style={{ background: "var(--bad)", color: "#fff" }}
              >
                <Trash size={13} weight="bold" />
                <span>Delete Selected</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="moorly-btn moorly-btn--sm moorly-btn--ghost !h-[30px] !text-[12px]"
              >
                <X size={12} weight="bold" />
                <span>Deselect</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredTransactions.length > 0 ? (
        <div className="moorly-card moorly-card--flush">
          <div className="overflow-x-auto">
            <table className="moorly-table">
              <thead>
                <tr>
                  <th className="w-10 pl-3.5 pr-1">
                    <input
                      type="checkbox"
                      checked={allCurrentPageSelected}
                      onChange={handleToggleSelectAll}
                      className="cursor-pointer rounded accent-[var(--accent)] w-3.5 h-3.5"
                      aria-label="Select all transactions on page"
                    />
                  </th>
                  <th
                    onClick={() => handleSort("date")}
                    className="cursor-pointer select-none hover:text-[var(--ink)] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date</span>
                      {sortBy === "date" ? (
                        sortOrder === "asc" ? (
                          <CaretUp size={13} weight="bold" />
                        ) : (
                          <CaretDown size={13} weight="bold" />
                        )
                      ) : (
                        <ArrowsDownUp size={12} weight="regular" className="opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("description")}
                    className="cursor-pointer select-none hover:text-[var(--ink)] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Description</span>
                      {sortBy === "description" ? (
                        sortOrder === "asc" ? (
                          <CaretUp size={13} weight="bold" />
                        ) : (
                          <CaretDown size={13} weight="bold" />
                        )
                      ) : (
                        <ArrowsDownUp size={12} weight="regular" className="opacity-40" />
                      )}
                    </div>
                  </th>
                  <th>Category</th>
                  <th>Account</th>
                  <th
                    onClick={() => handleSort("amount")}
                    className="text-right cursor-pointer select-none hover:text-[var(--ink)] transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Amount</span>
                      {sortBy === "amount" ? (
                        sortOrder === "asc" ? (
                          <CaretUp size={13} weight="bold" />
                        ) : (
                          <CaretDown size={13} weight="bold" />
                        )
                      ) : (
                        <ArrowsDownUp size={12} weight="regular" className="opacity-40" />
                      )}
                    </div>
                  </th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    categories={categories}
                    accounts={accounts}
                    currency={currency}
                    isSelected={selectedIds.includes(transaction.id)}
                    onToggleSelect={handleToggleSelectRow}
                    onEdit={(tx) => setEditingTx(tx)}
                    onDelete={handleDelete}
                    onViewReceipt={(tx) => setReceiptModalTx(tx)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={ArrowsLeftRight}
          title="No Transactions Found"
          message="No transactions match your active filters, or no entries have been added yet."
          actionLabel={outletContext.onAddTransaction ? "Add Transaction" : undefined}
          onAction={outletContext.onAddTransaction}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="text-[13px]" style={{ color: "var(--muted)" }}>
            Showing <strong style={{ color: "var(--ink)" }}>{startIndex + 1}</strong>–
            <strong style={{ color: "var(--ink)" }}>
              {Math.min(endIndex, filteredTransactions.length)}
            </strong>{" "}
            of <strong style={{ color: "var(--ink)" }}>{filteredTransactions.length}</strong> entries
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="moorly-btn moorly-btn--sm"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`moorly-btn moorly-btn--sm !w-8 !px-0 font-mono ${
                  currentPage === page ? "moorly-btn--primary" : ""
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="moorly-btn moorly-btn--sm"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <TransactionModal
        show={!!editingTx}
        editingTransaction={editingTx}
        onClose={() => setEditingTx(null)}
      />

      {/* Lightbox Receipt Modal */}
      <ReceiptModal
        show={!!receiptModalTx}
        onClose={() => setReceiptModalTx(null)}
        transaction={receiptModalTx}
      />

      {/* Bank Statement CSV Import Modal */}
      <CsvImportModal
        show={showCsvImport}
        onClose={() => setShowCsvImport(false)}
      />

      {/* Single Delete Confirmation */}
      <ConfirmDialog
        show={deleteConfirm.show}
        title="Remove Ledger Entry"
        message="Are you sure you want to permanently remove this transaction from the ledger?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        show={bulkDeleteConfirm}
        title={`Delete ${selectedIds.length} Transactions`}
        message={`Are you sure you want to permanently remove all ${selectedIds.length} selected entries from the ledger? This will automatically restore corresponding account balances.`}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </div>
  );
};

export default TransactionTable;
