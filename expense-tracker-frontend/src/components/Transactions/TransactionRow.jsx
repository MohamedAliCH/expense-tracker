import React, { useState } from "react";
import { Trash, Star, FileText, Repeat, Paperclip, PencilSimple } from "@phosphor-icons/react";
import { updateTransaction } from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";

const TransactionRow = ({
  transaction,
  categories,
  accounts,
  currency = "$",
  isSelected = false,
  onToggleSelect,
  onEdit,
  onDelete,
  onViewReceipt,
}) => {
  const [isFavorite, setIsFavorite] = useState(
    transaction.is_favorite === 1 || transaction.is_favorite === true
  );
  const [showNotesTooltip, setShowNotesTooltip] = useState(false);

  const toggleFavorite = async () => {
    try {
      const newFavoriteStatus = !isFavorite;
      await updateTransaction(transaction.id, {
        is_favorite: newFavoriteStatus,
      });
      setIsFavorite(newFavoriteStatus);
    } catch (error) {
      console.error("Failed to toggle favorite", error);
    }
  };

  const getCategoryName = (catId) => {
    const cat = categories.find((c) => c.id === parseInt(catId));
    return cat ? cat.name : "Unclassified";
  };

  const getCategoryColor = (catId) => {
    const cat = categories.find((c) => c.id === parseInt(catId));
    return cat ? cat.color : "#4a6fa5";
  };

  const getAccountName = (accId) => {
    const acc = accounts.find((a) => a.id === parseInt(accId));
    return acc ? acc.name : "Primary";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isIncome = transaction.type === "income";
  const catColor = getCategoryColor(transaction.category_id);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group transition-colors ${isSelected ? "bg-[var(--accent-soft)]/40" : ""}`}
    >
      <td className="w-10 pl-3.5 pr-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect && onToggleSelect(transaction.id)}
          className="cursor-pointer rounded accent-[var(--accent)] w-3.5 h-3.5"
          aria-label={`Select transaction ${transaction.description}`}
        />
      </td>

      <td className="whitespace-nowrap text-[12.5px]" style={{ color: "var(--muted)" }}>
        {formatDate(transaction.date)}
      </td>

      <td>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-[13.5px]" style={{ color: "var(--ink)" }}>
            {transaction.description}
          </span>
          {transaction.is_recurring && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[6px] text-[10.5px] font-bold"
              style={{ background: "var(--accent-soft)", color: "var(--accent-text)" }}
              title={`Recurring ${transaction.recurring_frequency || "monthly"}`}
            >
              <Repeat size={11} weight="bold" />
              <span className="capitalize">{transaction.recurring_frequency || "cycle"}</span>
            </span>
          )}
        </div>
      </td>

      <td className="whitespace-nowrap">
        <span
          className="moorly-pill"
          style={{
            backgroundColor: catColor + "22",
            color: catColor,
          }}
        >
          {getCategoryName(transaction.category_id)}
        </span>
      </td>

      <td className="whitespace-nowrap text-[13px]" style={{ color: "var(--ink-2)" }}>
        {getAccountName(transaction.account_id)}
      </td>

      <td className="whitespace-nowrap text-right font-mono font-bold text-[13.5px]">
        <span style={{ color: isIncome ? "var(--good)" : "var(--ink)" }}>
          {isIncome ? "+" : "-"}{currency}{Math.abs(parseFloat(transaction.amount || 0)).toFixed(2)}
        </span>
      </td>

      <td className="whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-1">
          {/* Edit Transaction */}
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(transaction)}
              className="w-7 h-7 rounded-[8px] flex items-center justify-center opacity-70 group-hover:opacity-100 transition-colors hover:bg-[var(--card-3)]"
              style={{ color: "var(--ink-2)" }}
              title="Edit transaction details"
            >
              <PencilSimple size={15} weight="duotone" />
            </button>
          )}

          {/* Receipt View Button */}
          {transaction.receipt_path && (
            <button
              type="button"
              onClick={() => onViewReceipt && onViewReceipt(transaction)}
              className="w-7 h-7 rounded-[8px] flex items-center justify-center transition-colors hover:bg-[var(--card-3)]"
              style={{ color: "var(--accent)" }}
              title="View attached receipt"
            >
              <Paperclip size={15} weight="bold" />
            </button>
          )}

          {/* Favorite Toggle */}
          <button
            type="button"
            onClick={toggleFavorite}
            className="w-7 h-7 rounded-[8px] flex items-center justify-center transition-colors hover:bg-[var(--card-3)]"
            style={{
              color: isFavorite ? "var(--warm)" : "var(--muted)",
            }}
            title={isFavorite ? "Remove star" : "Star entry"}
          >
            <Star size={16} weight={isFavorite ? "fill" : "regular"} />
          </button>

          {/* Notes Hover Tooltip */}
          {transaction.notes && (
            <div
              className="relative"
              onMouseEnter={() => setShowNotesTooltip(true)}
              onMouseLeave={() => setShowNotesTooltip(false)}
            >
              <div
                className="w-7 h-7 rounded-[8px] flex items-center justify-center cursor-help"
                style={{ color: "var(--info)" }}
              >
                <FileText size={16} weight="duotone" />
              </div>

              <AnimatePresence>
                {showNotesTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 2 }}
                    className="moorly-modal absolute right-0 bottom-full mb-2 w-52 p-3 z-20 text-left"
                  >
                    <p className="text-[12px] whitespace-normal leading-relaxed" style={{ color: "var(--ink-2)" }}>
                      {transaction.notes}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(transaction.id)}
            className="w-7 h-7 rounded-[8px] flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all hover:bg-[var(--bad-soft)]"
            style={{ color: "var(--bad)" }}
            title="Delete transaction"
          >
            <Trash size={16} weight="duotone" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

export default TransactionRow;
