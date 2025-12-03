import React from "react";
import { Filter, Download } from "lucide-react";
import "./Transactions.css";

const FilterBar = ({
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
  exportStartDate,
  setExportStartDate,
  exportEndDate,
  setExportEndDate,
  onExportCSV,
  onExportPDF,
  filteredCount,
}) => {
  return (
    <div className="transactions-container">
      {/* FILTER SECTION */}
      <div className="filter-section">
        <div className="filter-controls">
          <div className="filter-label">
            <Filter size={20} color="#9ca3af" />
            <span className="filter-label-text">Filters:</span>
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>

          {/* Month Filter */}
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(2024, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>

          {/* Amount Range Filters */}
          <div className="amount-range-inputs">
            <input
              type="number"
              placeholder="Min Amount"
              value={filterMinAmount}
              onChange={(e) => setFilterMinAmount(e.target.value)}
              className="filter-input"
            />
            <span className="filter-separator">-</span>
            <input
              type="number"
              placeholder="Max Amount"
              value={filterMaxAmount}
              onChange={(e) => setFilterMaxAmount(e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Favorites Filter */}
          <select
            value={filterFavorites}
            onChange={(e) => setFilterFavorites(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Transactions</option>
            <option value="true">⭐ Favorites Only</option>
            <option value="false">Non-Favorites</option>
          </select>

          {/* Clear Filters Button */}
          {(filterMinAmount ||
            filterMaxAmount ||
            filterFavorites !== "all") && (
            <button
              onClick={() => {
                setFilterMinAmount("");
                setFilterMaxAmount("");
                setFilterFavorites("all");
              }}
              className="clear-filters-btn"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="export-section">
        <div className="export-container">
          {/* Left Side: Title & Date Inputs */}
          <div className="export-controls">
            {/* Export Header */}
            <div className="filter-label">
              <Download size={20} color="#9ca3af" />
              <span className="filter-label-text">Export:</span>
            </div>

            {/* Date Range Inputs */}
            <div className="date-range-inputs">
              <input
                type="date"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
                className="date-input"
              />
              <span className="filter-separator">to</span>
              <input
                type="date"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
                className="date-input"
              />

              {(exportStartDate || exportEndDate) && (
                <button
                  onClick={() => {
                    setExportStartDate("");
                    setExportEndDate("");
                  }}
                  className="clear-filters-btn"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Side: Action Buttons */}
          <div className="export-actions">
            <span className="filtered-count">({filteredCount})</span>

            <button onClick={onExportCSV} className="export-btn csv">
              CSV
            </button>

            <button onClick={onExportPDF} className="export-btn pdf">
              PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
