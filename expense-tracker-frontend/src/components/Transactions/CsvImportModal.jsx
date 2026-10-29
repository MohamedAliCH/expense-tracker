import React, { useState } from "react";
import Papa from "papaparse";
import { UploadSimple, FileText, CheckCircle, Sparkle } from "@phosphor-icons/react";
import { useApp } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";
import MoorlyModal from "../Common/MoorlyModal";
import { categorizeWithAi } from "../../utils/api";

const CsvImportModal = ({ show, onClose }) => {
  const { accounts, categories, bulkImportTransactions } = useApp();
  const { showToast } = useToast();

  const [file, setFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [columnMap, setColumnMap] = useState({
    date: "",
    amount: "",
    description: "",
    type: "",
  });
  const [defaultAccountId, setDefaultAccountId] = useState(accounts[0]?.id || "");
  const [defaultCategoryId, setDefaultCategoryId] = useState(categories[0]?.id || "");
  const [useAiCategorization, setUseAiCategorization] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiStatus, setAiStatus] = useState("");

  const autoDetectColumns = (headers) => {
    const map = { date: "", amount: "", description: "", type: "" };
    headers.forEach((h) => {
      const lower = h.trim().toLowerCase();
      if (!map.date && (lower.includes("date") || lower.includes("time") || lower.includes("posted"))) {
        map.date = h;
      } else if (!map.amount && (lower.includes("amount") || lower.includes("total") || lower.includes("debit") || lower.includes("credit"))) {
        map.amount = h;
      } else if (!map.description && (lower.includes("desc") || lower.includes("memo") || lower.includes("payee") || lower.includes("name"))) {
        map.description = h;
      } else if (!map.type && lower.includes("type")) {
        map.type = h;
      }
    });
    return map;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      showToast("Please upload a valid .csv file", "error");
      return;
    }

    setFile(selectedFile);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          showToast("The CSV file appears to be empty", "error");
          return;
        }

        const headers = results.meta.fields || [];
        setCsvHeaders(headers);
        setRawRows(results.data);
        setColumnMap(autoDetectColumns(headers));
      },
      error: (err) => {
        console.error("CSV parse error:", err);
        showToast("Failed to parse CSV file", "error");
      },
    });
  };

  const handleImport = async () => {
    if (!defaultAccountId) {
      showToast("Please choose a default account for imported rows", "error");
      return;
    }
    if (!defaultCategoryId) {
      showToast("Please choose a default category for imported rows", "error");
      return;
    }
    if (!columnMap.amount || !columnMap.description) {
      showToast("Please map at least Amount and Description columns", "error");
      return;
    }

    setIsSubmitting(true);
    setAiStatus("");
    try {
      let mappedRows = rawRows
        .map((row) => {
          const rawAmount = String(row[columnMap.amount] || "").replace(/[^0-9.-]+/g, "");
          const amount = Math.abs(parseFloat(rawAmount)) || 0;
          if (amount <= 0) return null;

          let rawDate = columnMap.date ? row[columnMap.date] : "";
          let validDate = new Date().toISOString().split("T")[0];
          if (rawDate) {
            const parsed = new Date(rawDate);
            if (!isNaN(parsed.getTime())) {
              validDate = parsed.toISOString().split("T")[0];
            }
          }

          let type = "expense";
          if (columnMap.type && row[columnMap.type]) {
            const tLower = String(row[columnMap.type]).toLowerCase();
            if (tLower.includes("in") || tLower.includes("credit") || tLower.includes("deposit")) {
              type = "income";
            }
          } else if (parseFloat(rawAmount) > 0 && String(row[columnMap.amount] || "").includes("+")) {
            type = "income";
          }

          return {
            account_id: parseInt(defaultAccountId),
            category_id: parseInt(defaultCategoryId),
            amount,
            type,
            description: String(row[columnMap.description] || "Imported item").trim().slice(0, 255),
            date: validDate,
            notes: "Imported via Bank CSV",
          };
        })
        .filter(Boolean);

      if (mappedRows.length === 0) {
        showToast("No valid transactions could be parsed from the file", "error");
        setIsSubmitting(false);
        return;
      }

      // If AI auto-categorization is enabled, run batch detection
      if (useAiCategorization && mappedRows.length > 0) {
        setAiStatus("Auto-categorizing with Oceanic AI...");
        try {
          const batchItems = mappedRows.slice(0, 100).map((r) => ({
            description: r.description,
            amount: r.amount,
          }));
          const aiRes = await categorizeWithAi(batchItems);
          if (Array.isArray(aiRes?.data)) {
            mappedRows = mappedRows.map((row, idx) => {
              const matched = aiRes.data[idx];
              if (matched && matched.category_id) {
                return { ...row, category_id: matched.category_id };
              }
              return row;
            });
          }
        } catch {
          // Gracefully fallback to defaultCategoryId
        }
      }

      setAiStatus("Writing to ledger...");
      const res = await bulkImportTransactions(mappedRows);
      showToast(res.message || `Successfully imported ${mappedRows.length} transactions`, "success");
      onClose();
    } catch (error) {
      console.error("Import error:", error);
      showToast(error.userMessage || error.message || "Failed to import transactions", "error");
    } finally {
      setIsSubmitting(false);
      setAiStatus("");
    }
  };

  return (
    <MoorlyModal
      show={show}
      onClose={onClose}
      title="Import Bank CSV"
      subtitle="Upload a bank export CSV to automatically populate transactions and update balances"
      maxWidth="max-w-[560px]"
      disabled={isSubmitting}
    >
      <div className="p-6 flex flex-col gap-4">
        {/* Upload Zone */}
        {!file ? (
          <label className="border-2 border-dashed rounded-[16px] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors hover:border-[var(--accent)]" style={{ borderColor: "var(--line-2)", background: "var(--card-2)" }}>
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-3" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              <UploadSimple size={24} weight="bold" />
            </div>
            <span className="text-[14px] font-bold" style={{ color: "var(--ink)" }}>
              Choose a CSV file or drag it here
            </span>
            <span className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>
              Standard bank statements, credit card exports, or accounting CSVs
            </span>
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>
        ) : (
          <div className="p-3.5 rounded-[12px] flex items-center justify-between" style={{ background: "var(--card-2)", border: "1px solid var(--line)" }}>
            <div className="flex items-center gap-2.5">
              <FileText size={22} weight="duotone" style={{ color: "var(--accent)" }} />
              <div>
                <p className="text-[13px] font-bold" style={{ color: "var(--ink)" }}>
                  {file.name}
                </p>
                <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>
                  {rawRows.length} rows found · {csvHeaders.length} columns
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setFile(null); setRawRows([]); setCsvHeaders([]); }}
              className="text-[12px] font-semibold underline"
              style={{ color: "var(--muted)" }}
            >
              Change file
            </button>
          </div>
        )}

        {/* Column Mapping & Defaults */}
        {rawRows.length > 0 && (
          <div className="flex flex-col gap-3.5 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold" style={{ color: "var(--ink-2)" }}>
                  Target Account
                </label>
                <select
                  value={defaultAccountId}
                  onChange={(e) => setDefaultAccountId(e.target.value)}
                  className="moorly-select"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold" style={{ color: "var(--ink-2)" }}>
                  Default Category
                </label>
                <select
                  value={defaultCategoryId}
                  onChange={(e) => setDefaultCategoryId(e.target.value)}
                  className="moorly-select"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
                  Amount Column
                </label>
                <select
                  value={columnMap.amount}
                  onChange={(e) => setColumnMap({ ...columnMap, amount: e.target.value })}
                  className="moorly-select !h-9 !text-[12.5px]"
                >
                  <option value="">Select column...</option>
                  {csvHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
                  Description Column
                </label>
                <select
                  value={columnMap.description}
                  onChange={(e) => setColumnMap({ ...columnMap, description: e.target.value })}
                  className="moorly-select !h-9 !text-[12.5px]"
                >
                  <option value="">Select column...</option>
                  {csvHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
                  Date Column
                </label>
                <select
                  value={columnMap.date}
                  onChange={(e) => setColumnMap({ ...columnMap, date: e.target.value })}
                  className="moorly-select !h-9 !text-[12.5px]"
                >
                  <option value="">(Default: Today)</option>
                  {csvHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
                  Type Column (Optional)
                </label>
                <select
                  value={columnMap.type}
                  onChange={(e) => setColumnMap({ ...columnMap, type: e.target.value })}
                  className="moorly-select !h-9 !text-[12.5px]"
                >
                  <option value="">(Default: Expense)</option>
                  {csvHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* AI Auto-Categorize Toggle */}
            <div
              className="p-3 rounded-[12px] flex items-center justify-between border"
              style={{
                background: "var(--card-2)",
                borderColor: useAiCategorization ? "var(--accent)" : "var(--border)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0"
                  style={{
                    background: useAiCategorization ? "var(--accent)" : "var(--card-3)",
                    color: useAiCategorization ? "var(--accent-ink)" : "var(--muted)",
                  }}
                >
                  <Sparkle size={15} weight="duotone" />
                </span>
                <div>
                  <p className="text-[12.5px] font-bold" style={{ color: "var(--ink)" }}>
                    Oceanic AI Auto-Categorization
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--muted)" }}>
                    Predict category for each row based on payee/memo descriptions
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={useAiCategorization}
                onChange={(e) => setUseAiCategorization(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-[var(--accent)]"
              />
            </div>

            {/* Preview of first 3 rows */}
            <div className="mt-1 rounded-[10px] overflow-hidden" style={{ border: "1px solid var(--line)" }}>
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ background: "var(--card-3)", color: "var(--muted)" }}>
                Sample Preview (First 3 entries)
              </div>
              <div className="divide-y text-[12px]" style={{ divideColor: "var(--line)" }}>
                {rawRows.slice(0, 3).map((r, i) => (
                  <div key={i} className="px-3 py-2 flex items-center justify-between">
                    <span className="truncate max-w-[240px] font-medium" style={{ color: "var(--ink)" }}>
                      {columnMap.description ? r[columnMap.description] || "—" : "—"}
                    </span>
                    <span className="font-mono font-bold" style={{ color: "var(--ink-2)" }}>
                      ${columnMap.amount ? r[columnMap.amount] || "0.00" : "0.00"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-2 pt-4 flex justify-end gap-2.5" style={{ borderTop: "1px solid var(--line)" }}>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="moorly-btn moorly-btn--ghost">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={isSubmitting || rawRows.length === 0}
            className="moorly-btn moorly-btn--primary"
          >
            {useAiCategorization ? (
              <Sparkle size={16} weight="duotone" />
            ) : (
              <CheckCircle size={16} weight="bold" />
            )}
            <span>
              {isSubmitting
                ? aiStatus || "Importing..."
                : `Import ${rawRows.length} Rows`}
            </span>
          </button>
        </div>
      </div>
    </MoorlyModal>
  );
};

export default CsvImportModal;
