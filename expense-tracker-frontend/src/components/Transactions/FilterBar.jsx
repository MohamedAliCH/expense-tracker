import React from "react";
import { Filter, Download } from "lucide-react";

const FilterBar = ({
  filterType,
  setFilterType,
  filterMonth,
  setFilterMonth,
  exportStartDate,
  setExportStartDate,
  exportEndDate,
  setExportEndDate,
  onExportCSV,
  onExportPDF,
  filteredCount,
}) => {
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
            onChange={(e) => setFilterType(e.target.value)}
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
            onChange={(e) => setFilterMonth(e.target.value)}
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
              onClick={onExportCSV}
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
              onClick={onExportPDF}
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
              {filteredCount} transaction{filteredCount !== 1 ? "s" : ""} will
              be exported
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
