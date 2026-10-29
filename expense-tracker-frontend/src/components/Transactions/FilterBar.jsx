import React from "react";
import { DownloadSimple, Star, X, MagnifyingGlass } from "@phosphor-icons/react";
import { motion } from "framer-motion";

const TYPE_OPTIONS = [
  { id: "all", label: "All entries" },
  { id: "income", label: "Inflows" },
  { id: "expense", label: "Outflows" },
];

const DATE_PRESETS = [
  { id: "all", label: "All time" },
  { id: "this_month", label: "This month" },
  { id: "last_30", label: "Last 30d" },
  { id: "this_quarter", label: "Quarter" },
  { id: "ytd", label: "YTD" },
  { id: "custom", label: "Custom..." },
];

const FilterBar = ({
  searchQuery = "",
  setSearchQuery,
  filterType,
  setFilterType,
  filterAccount = "all",
  setFilterAccount,
  accounts = [],
  filterMinAmount,
  setFilterMinAmount,
  filterMaxAmount,
  setFilterMaxAmount,
  filterFavorites,
  setFilterFavorites,
  datePreset = "all",
  setDatePreset,
  startDate = "",
  setStartDate,
  endDate = "",
  setEndDate,
  onExportCSV,
  onExportPDF,
  filteredCount,
}) => {
  const hasActiveFilters =
    searchQuery ||
    filterAccount !== "all" ||
    filterMinAmount ||
    filterMaxAmount ||
    filterFavorites !== "all" ||
    filterType !== "all" ||
    datePreset !== "all";

  return (
    <div className="moorly-card p-3.5 sm:p-4 flex flex-col gap-3">
      {/* Top Row: Search + Segmented Type Switcher + Date Presets */}
      <div className="flex flex-wrap items-center gap-2.5 justify-between">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Live Search Input */}
          <div className="relative flex-1 min-w-[180px] max-w-[280px]">
            <MagnifyingGlass
              size={15}
              weight="bold"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--muted)" }}
            />
            <input
              type="text"
              placeholder="Search description, memo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              className="moorly-input !h-[38px] !pl-9 !text-[13px]"
            />
          </div>

          {/* Type Segmented Control */}
          <div className="moorly-seg" role="group" aria-label="Filter by entry type">
            {TYPE_OPTIONS.map((opt) => {
              const active = filterType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFilterType(opt.id)}
                  className={`moorly-seg__btn !h-[32px] !px-2.5 !text-[12px] ${active ? "is-active" : ""}`}
                >
                  {active && (
                    <motion.span
                      layoutId="txTypeSeg"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-[8px]"
                      style={{
                        background: "var(--card)",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.12), inset 0 0 0 1px var(--line)",
                      }}
                    />
                  )}
                  <span className="relative z-10">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Account Filter Dropdown */}
          {accounts.length > 0 && (
            <div className="flex items-center gap-1.5">
              <select
                value={filterAccount}
                onChange={(e) => setFilterAccount && setFilterAccount(e.target.value)}
                className="moorly-select !h-[34px] !text-[12px] !w-auto !py-0 !pl-2.5 !pr-7 font-medium"
                title="Filter by account"
              >
                <option value="all">All accounts</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Presets Selector */}
          <div className="moorly-seg !p-0.5 overflow-x-auto hide-scrollbar">
            {DATE_PRESETS.map((p) => {
              const active = datePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setDatePreset && setDatePreset(p.id)}
                  className={`moorly-seg__btn !h-[30px] !px-2 !text-[11.5px] ${active ? "is-active" : ""}`}
                >
                  {active && (
                    <motion.span
                      layoutId="txDatePresetSeg"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-[7px]"
                      style={{
                        background: "var(--card)",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.12), inset 0 0 0 1px var(--line)",
                      }}
                    />
                  )}
                  <span className="relative z-10">{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Amount Range */}
          <div className="hidden md:flex items-center gap-1.5">
            <input
              type="number"
              placeholder="Min $"
              value={filterMinAmount}
              onChange={(e) => setFilterMinAmount(e.target.value)}
              className="moorly-input !w-[80px] !h-[34px] !text-[12px] font-mono"
            />
            <span className="text-xs" style={{ color: "var(--muted)" }}>–</span>
            <input
              type="number"
              placeholder="Max $"
              value={filterMaxAmount}
              onChange={(e) => setFilterMaxAmount(e.target.value)}
              className="moorly-input !w-[80px] !h-[34px] !text-[12px] font-mono"
            />
          </div>

          {/* Starred Toggle */}
          <button
            type="button"
            onClick={() =>
              setFilterFavorites(filterFavorites === "true" ? "all" : "true")
            }
            className="moorly-btn moorly-btn--sm !h-[34px]"
            style={{
              background: filterFavorites === "true" ? "var(--warm-soft)" : "var(--card)",
              color: filterFavorites === "true" ? "var(--warm-text)" : "var(--ink-2)",
            }}
          >
            <Star size={14} weight={filterFavorites === "true" ? "fill" : "regular"} />
            <span className="text-[12px]">Starred</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                if (setSearchQuery) setSearchQuery("");
                if (setFilterAccount) setFilterAccount("all");
                setFilterMinAmount("");
                setFilterMaxAmount("");
                setFilterFavorites("all");
                setFilterType("all");
                if (setDatePreset) setDatePreset("all");
                if (setStartDate) setStartDate("");
                if (setEndDate) setEndDate("");
              }}
              className="moorly-btn moorly-btn--sm moorly-btn--ghost !h-[34px] !text-[12px]"
            >
              <X size={13} weight="bold" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right Side: Export Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <span className="moorly-pill moorly-pill--plain font-mono !text-[11.5px]">
            {filteredCount} {filteredCount === 1 ? "entry" : "entries"}
          </span>

          <button
            type="button"
            onClick={onExportCSV}
            className="moorly-btn moorly-btn--sm !h-[34px] !text-[12px]"
          >
            <DownloadSimple size={13} weight="bold" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={onExportPDF}
            className="moorly-btn moorly-btn--sm !h-[34px] !text-[12px]"
          >
            <DownloadSimple size={13} weight="bold" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Expandable Custom Date Range Inputs */}
      {datePreset === "custom" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="pt-2 border-t flex flex-wrap items-center gap-3 text-[12.5px]"
          style={{ borderColor: "var(--line)" }}
        >
          <span className="font-semibold" style={{ color: "var(--ink-2)" }}>
            Custom Range:
          </span>
          <div className="flex items-center gap-2">
            <label className="text-xs" style={{ color: "var(--muted)" }}>From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate && setStartDate(e.target.value)}
              className="moorly-input !h-[32px] !text-[12px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs" style={{ color: "var(--muted)" }}>To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate && setEndDate(e.target.value)}
              className="moorly-input !h-[32px] !text-[12px]"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FilterBar;
