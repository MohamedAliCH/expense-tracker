import React, { useState, useEffect } from "react";
import {
  CreditCard,
  ArrowsClockwise,
  ArrowsLeftRight,
  CheckCircle,
} from "@phosphor-icons/react";
import EmptyState from "../Common/EmptyState";
import { getPayments, syncPaymentToTransaction } from "../../utils/api";
import { useApp } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";
import { motion } from "framer-motion";

const PaymentList = () => {
  const { refreshData } = useApp();
  const { showToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(null);

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPayments = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const response = await getPayments();
      setPayments(response.data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      showToast("Failed to load statements", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (paymentId) => {
    setSyncing(paymentId);
    try {
      await syncPaymentToTransaction(paymentId);
      await fetchPayments(true);
      await refreshData();
      showToast("Statement synced to ledger!", "success");
    } catch (error) {
      console.error("Error syncing payment:", error);
      showToast("Failed to sync statement", "error");
    } finally {
      setSyncing(null);
    }
  };

  const formatAmount = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (currency || "USD").toUpperCase(),
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="moorly-card flex items-center gap-3 px-6 py-4">
          <ArrowsClockwise size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
          <span className="text-[13px] font-semibold" style={{ color: "var(--ink-2)" }}>
            Loading agency statements...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
              Agency Statements
            </h1>
            <span className="moorly-pill moorly-pill--accent">
              {payments.length} records
            </span>
          </div>
          <p className="text-[13.5px] mt-0.5" style={{ color: "var(--muted)" }}>
            Reconcile Stripe settlement records and bind them directly into your ledger.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchPayments(false)}
          className="moorly-btn self-start sm:self-auto"
        >
          <ArrowsClockwise size={16} weight="bold" />
          <span>Refresh statements</span>
        </button>
      </header>

      {payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No Agency Statements Found"
          message="Settlement statements will appear here automatically once billing activity occurs."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {payments.map((payment, idx) => {
            const isSucceeded =
              payment.status === "succeeded" || payment.status === "completed";

            return (
              <motion.article
                key={payment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, type: "spring", stiffness: 380, damping: 30 }}
                className="moorly-card flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className="text-[24px] font-bold font-mono tracking-tight block"
                      style={{ color: "var(--ink)" }}
                    >
                      {formatAmount(payment.amount, payment.currency)}
                    </span>
                    <span className="text-[12px] font-medium" style={{ color: "var(--muted)" }}>
                      {formatDate(payment.created_at)}
                    </span>
                  </div>

                  <span
                    className={`moorly-pill capitalize ${
                      isSucceeded ? "moorly-pill--good" : "moorly-pill--warn"
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>

                {payment.description && (
                  <div
                    className="text-[13px] p-3 rounded-[11px]"
                    style={{
                      background: "var(--card-2)",
                      color: "var(--ink-2)",
                      boxShadow: "inset 0 0 0 1px var(--line)",
                    }}
                  >
                    {payment.description}
                  </div>
                )}

                <div
                  className="pt-3 flex items-center justify-end"
                  style={{ borderTop: "1px solid var(--line)" }}
                >
                  {payment.synced_to_transaction ? (
                    <span className="moorly-pill moorly-pill--good">
                      <CheckCircle size={14} weight="fill" />
                      <span>Bound to ledger</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSync(payment.id)}
                      disabled={syncing === payment.id}
                      className="moorly-btn moorly-btn--primary w-full"
                    >
                      {syncing === payment.id ? (
                        <>
                          <ArrowsClockwise size={16} className="animate-spin" />
                          <span>Binding...</span>
                        </>
                      ) : (
                        <>
                          <ArrowsLeftRight size={16} weight="bold" />
                          <span>Bind to ledger</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PaymentList;
