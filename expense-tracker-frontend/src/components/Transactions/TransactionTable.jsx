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
import { Filter, Trash2, Download } from "lucide-react";
import { exportToCSV, exportToPDF } from "../../utils/Export";
import { useAuth } from "../../contexts/AuthContext";

const TransactionTable = ({ transactions, categories, accounts, onDelete }) => {
  const { user } = useAuth();

  // ==========================================
  // STATE FOR FILTERS
  // ==========================================

  const [filterType, setFilterType] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Export date range
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  // Get category name by ID
  const getCategoryName = (catId) => {
    const cat = categories.find((c) => c.id === parseInt(catId));
    return cat ? cat.name : "Unknown";
  };

  // Get category color by ID
  const getCategoryColor = (catId) => {
    const cat = categories.find((c) => c.id === parseInt(catId));
    return cat ? cat.color : "#6b7280";
  };

  // Get account name by ID
  const getAccountName = (accId) => {
    const acc = accounts.find((a) => a.id === parseInt(accId));
    return acc ? acc.name : "Unknown";
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ==========================================
  // FILTER TRANSACTIONS
  // ==========================================

  const filteredTransactions = transactions.filter((t) => {
    if (filterType !== "all" && t.type !== filterType) return false;

    if (filterMonth !== "all") {
      const tMonth = new Date(t.date).getMonth();
      if (tMonth !== parseInt(filterMonth)) return false;
    }

    return true;
  });

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

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* FILTER SECTION */}
      <div
        style={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Filter size={20} color="#9ca3af" />
            <span style={{ color: "#d1d5db", fontWeight: "500" }}>
              Filters:
            </span>
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => handleFilterChange(setFilterType)(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              padding: "8px 16px",
              color: "white",
              cursor: "pointer",
            }}
          >
            <option value="all">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>

          {/* Month Filter */}
          <select
            value={filterMonth}
            onChange={(e) => handleFilterChange(setFilterMonth)(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              padding: "8px 16px",
              color: "white",
              cursor: "pointer",
            }}
          >
            <option value="all">All Months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(2024, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Export Section */}
      <div
        style={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          padding: "16px 24px",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Export Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Download size={20} color="#9ca3af" />
            <span style={{ color: "#d1d5db", fontWeight: "500" }}>
              Export Transactions
            </span>
          </div>

          {/* Date Range Inputs */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label style={{ color: "#9ca3af", fontSize: "12px" }}>
                From Date
              </label>
              <input
                type="date"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  color: "white",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label style={{ color: "#9ca3af", fontSize: "12px" }}>
                To Date
              </label>
              <input
                type="date"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  color: "white",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              />
            </div>

            {(exportStartDate || exportEndDate) && (
              <button
                onClick={() => {
                  setExportStartDate("");
                  setExportEndDate("");
                }}
                style={{
                  background: "rgba(239,68,68,0.2)",
                  color: "#f87171",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(239,68,68,0.3)",
                  cursor: "pointer",
                  fontSize: "12px",
                  marginTop: "18px",
                }}
              >
                Clear Dates
              </button>
            )}
          </div>

          {/* Export Buttons */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={() => {
                const exportData = filteredTransactions.filter((t) => {
                  if (!exportStartDate && !exportEndDate) return true;
                  const tDate = new Date(t.date);
                  if (exportStartDate && tDate < new Date(exportStartDate))
                    return false;
                  if (exportEndDate && tDate > new Date(exportEndDate))
                    return false;
                  return true;
                });
                exportToCSV(
                  exportData,
                  categories,
                  accounts,
                  user?.name || "User"
                );
              }}
              style={{
                background: "rgba(34,197,94,0.2)",
                color: "#4ade80",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid rgba(34,197,94,0.3)",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              📄 Export CSV
            </button>

            <button
              onClick={() => {
                const exportData = filteredTransactions.filter((t) => {
                  if (!exportStartDate && !exportEndDate) return true;
                  const tDate = new Date(t.date);
                  if (exportStartDate && tDate < new Date(exportStartDate))
                    return false;
                  if (exportEndDate && tDate > new Date(exportEndDate))
                    return false;
                  return true;
                });
                exportToPDF(
                  exportData,
                  categories,
                  accounts,
                  user?.name || "User"
                );
              }}
              style={{
                background: "rgba(239,68,68,0.2)",
                color: "#f87171",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid rgba(239,68,68,0.3)",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              📑 Export PDF
            </button>

            <span
              style={{
                color: "#9ca3af",
                fontSize: "13px",
                fontStyle: "italic",
              }}
            >
              {(() => {
                const exportData = filteredTransactions.filter((t) => {
                  if (!exportStartDate && !exportEndDate) return true;
                  const tDate = new Date(t.date);
                  if (exportStartDate && tDate < new Date(exportStartDate))
                    return false;
                  if (exportEndDate && tDate > new Date(exportEndDate))
                    return false;
                  return true;
                });
                return `${exportData.length} transaction${
                  exportData.length !== 1 ? "s" : ""
                } will be exported`;
              })()}
            </span>
          </div>
        </div>
      </div>

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
                <tr
                  key={transaction.id}
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {/* Date */}
                  <td style={{ padding: "16px 24px", color: "#d1d5db" }}>
                    {formatDate(transaction.date)}
                  </td>

                  {/* Description */}
                  <td
                    style={{
                      padding: "16px 24px",
                      color: "white",
                      fontWeight: "500",
                    }}
                  >
                    {transaction.description}
                  </td>

                  {/* Category Badge */}
                  <td style={{ padding: "16px 24px" }}>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "9999px",
                        fontSize: "14px",
                        fontWeight: "500",
                        backgroundColor:
                          getCategoryColor(transaction.category_id) + "66",
                        color: getCategoryColor(transaction.category_id),
                      }}
                    >
                      {getCategoryName(transaction.category_id)}
                    </span>
                  </td>

                  {/* Account */}
                  <td style={{ padding: "16px 24px", color: "#d1d5db" }}>
                    {getAccountName(transaction.account_id)}
                  </td>

                  {/* Amount - Green for income, Red for expense */}
                  <td
                    style={{
                      padding: "16px 24px",
                      textAlign: "right",
                      fontWeight: "bold",
                      color:
                        transaction.type === "income" ? "#4ade80" : "#f87171",
                    }}
                  >
                    {transaction.type === "income" ? "+" : "-"}$
                    {parseFloat(transaction.amount).toFixed(2)}
                  </td>

                  {/* Delete Button */}
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <button
                      onClick={() => onDelete(transaction.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#f87171",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#ef4444")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#f87171")
                      }
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
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
    </div>
  );
};

export default TransactionTable;
