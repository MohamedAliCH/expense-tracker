import React, { useState } from "react";
import { Repeat, ArrowsClockwise, CalendarBlank } from "@phosphor-icons/react";
import { useToast } from "../../contexts/ToastContext";

const UpcomingRecurring = ({
  transactions = [],
  categories = [],
  currency = "$",
  triggerRecurringProcessing,
}) => {
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const recurringTx = transactions.filter(
    (t) => t.is_recurring === true || t.is_recurring === 1 || t.is_recurring === "1"
  );

  const calculateMonthlyBurn = () => {
    return recurringTx.reduce((acc, t) => {
      const amount = parseFloat(t.amount || 0);
      const freq = t.recurring_frequency || "monthly";
      let monthlyEquivalent = amount;

      if (freq === "weekly") {
        monthlyEquivalent = amount * 4.33;
      } else if (freq === "yearly") {
        monthlyEquivalent = amount / 12;
      }

      return t.type === "expense" ? acc + monthlyEquivalent : acc - monthlyEquivalent;
    }, 0);
  };

  const netMonthlyBurn = calculateMonthlyBurn();

  const handleProcess = async () => {
    if (!triggerRecurringProcessing) return;
    setIsProcessing(true);
    try {
      const res = await triggerRecurringProcessing();
      showToast(
        res.processed_count > 0
          ? `Generated ${res.processed_count} recurring transactions for today!`
          : "All recurring entries are current.",
        "success"
      );
    } catch (err) {
      showToast("Failed to process recurring transactions.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (recurringTx.length === 0) {
    return null;
  }

  return (
    <section className="moorly-card moorly-card--flush flex flex-col">
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b" style={{ borderColor: "var(--line)" }}>
        <div className="flex items-center gap-3">
          <span
            className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0"
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent-text)",
              boxShadow: "inset 0 0 0 1px var(--line)",
            }}
          >
            <Repeat size={18} weight="bold" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
                Recurring Commitments
              </h2>
              <span className="moorly-pill moorly-pill--plain text-[11px] font-mono">
                {recurringTx.length} active
              </span>
            </div>
            <p className="text-[12.5px] mt-0.5" style={{ color: "var(--muted)" }}>
              Estimated Net Commitment:{" "}
              <strong className="font-mono font-bold" style={{ color: netMonthlyBurn >= 0 ? "var(--bad)" : "var(--good)" }}>
                {netMonthlyBurn >= 0 ? "" : "-"}{currency}{Math.abs(netMonthlyBurn).toFixed(2)} / month
              </strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleProcess}
          disabled={isProcessing}
          className="moorly-btn moorly-btn--sm moorly-btn--ghost"
          title="Scan and create any recurring transactions due today"
        >
          <ArrowsClockwise size={14} weight="bold" className={isProcessing ? "animate-spin" : ""} />
          <span>{isProcessing ? "Checking..." : "Check Due Cycles"}</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="moorly-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th>Frequency</th>
              <th>Next Due Date</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {recurringTx.map((tx) => {
              const cat = categories.find((c) => c.id === parseInt(tx.category_id));
              const isIncome = tx.type === "income";

              return (
                <tr key={tx.id}>
                  <td>
                    <span className="font-semibold text-[13.5px]" style={{ color: "var(--ink)" }}>
                      {tx.description}
                    </span>
                  </td>
                  <td className="whitespace-nowrap">
                    <span
                      className="moorly-pill"
                      style={{
                        backgroundColor: (cat?.color || "#4a6fa5") + "22",
                        color: cat?.color || "var(--accent-text)",
                      }}
                    >
                      {cat?.name || "Standard"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[11px] font-bold capitalize"
                      style={{ background: "var(--card-3)", color: "var(--ink-2)" }}
                    >
                      <Repeat size={11} weight="bold" />
                      <span>{tx.recurring_frequency || "monthly"}</span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap text-[12.5px] font-mono" style={{ color: "var(--muted)" }}>
                    <div className="flex items-center gap-1.5">
                      <CalendarBlank size={13} weight="bold" />
                      <span>{tx.next_recurring_date ? String(tx.next_recurring_date).split("T")[0] : "Active"}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap text-right font-mono font-bold text-[13.5px]">
                    <span style={{ color: isIncome ? "var(--good)" : "var(--ink)" }}>
                      {isIncome ? "+" : "-"}{currency}{Math.abs(parseFloat(tx.amount || 0)).toFixed(2)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default UpcomingRecurring;
