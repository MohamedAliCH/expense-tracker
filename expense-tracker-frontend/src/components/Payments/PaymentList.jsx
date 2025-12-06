import React, { useState, useEffect } from "react";
import {
  CreditCard,
  RefreshCw,
  ArrowRightLeft,
  CheckCircle,
} from "lucide-react";
import EmptyState from "../Common/EmptyState";
import { getPayments, syncPaymentToTransaction } from "../../services/api";
import "./PaymentList.css";

import { useApp } from "../../contexts/AppContext";

const PaymentList = () => {
  const { refreshData } = useApp();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  // Fetch all payments from API
  const fetchPayments = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const response = await getPayments();
      setPayments(response.data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sync a payment to create a transaction
  const handleSync = async (paymentId) => {
    setSyncing(paymentId);
    try {
      await syncPaymentToTransaction(paymentId);
      // Refresh payments list locally
      await fetchPayments(true);
      // Refresh global app data (transactions list)
      await refreshData();
      alert("Payment synced to transaction!");
    } catch (error) {
      console.error("Error syncing payment:", error);
      alert("Failed to sync payment");
    } finally {
      setSyncing(null);
    }
  };

  // Format currency
  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return <div className="payments-loading">Loading payments...</div>;
  }

  return (
    <div className="payments-container">
      <div className="payments-header">
        <h2>
          <CreditCard size={24} />
          Payment History
        </h2>
        <button onClick={fetchPayments} className="refresh-btn">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon="💳"
          title="No Payments Yet"
          message="Your payment history will appear here once you make a purchase."
        />
      ) : (
        <div className="payments-list">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className={`payment-card ${
                payment.synced_to_transaction ? "synced" : ""
              }`}
            >
              <div className="payment-info">
                <div className="payment-amount">
                  {formatAmount(payment.amount, payment.currency)}
                </div>
                <div className="payment-details">
                  <span className="payment-date">
                    {formatDate(payment.created_at)}
                  </span>
                  <span className={`payment-status ${payment.status}`}>
                    {payment.status}
                  </span>
                </div>
                {payment.description && (
                  <div className="payment-description">
                    {payment.description}
                  </div>
                )}
              </div>

              <div className="payment-actions">
                {payment.synced_to_transaction ? (
                  <span className="synced-badge">
                    <CheckCircle size={16} />
                    Synced
                  </span>
                ) : (
                  <button
                    onClick={() => handleSync(payment.id)}
                    disabled={syncing === payment.id}
                    className="sync-btn"
                  >
                    {syncing === payment.id ? (
                      "Syncing..."
                    ) : (
                      <>
                        <ArrowRightLeft size={16} />
                        Sync to Transaction
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentList;
