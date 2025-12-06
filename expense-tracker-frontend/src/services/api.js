import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==========================================
// SUBSCRIPTION API
// ==========================================

// Creates a Stripe Checkout page for subscription
// Returns URL to redirect user to Stripe payment page
export const createCheckoutSession = async (priceId) => {
  const response = await api.post("/subscription/checkout", {
    price_id: priceId,
  });
  return response.data;
};

// Gets user's current subscription status (premium/free, limits, expiry)
export const getSubscriptionStatus = async () => {
  const response = await api.get("/subscription/status");
  return response.data;
};

// Cancels subscription at end of billing period (user keeps access until then)
export const cancelSubscription = async () => {
  const response = await api.post("/subscription/cancel");
  return response.data;
};

// Reactivates a canceled subscription before it ends
export const resumeSubscription = async () => {
  const response = await api.post("/subscription/resume");
  return response.data;
};

// Opens Stripe Customer Portal (update payment method, view invoices, cancel)
export const createPortalSession = async () => {
  const response = await api.post("/subscription/portal");
  return response.data;
};

// ==========================================
// PAYMENTS API (Payment Tracking Feature)
// ==========================================

// Gets list of all Stripe payments made by user
export const getPayments = async () => {
  const response = await api.get("/payments");
  return response.data;
};

// Converts a Stripe payment into an income transaction in expense tracker
export const syncPaymentToTransaction = async (paymentId) => {
  const response = await api.post(`/payments/${paymentId}/sync`);
  return response.data;
};

// Syncs multiple payments to transactions at once
export const bulkSyncPayments = async (paymentIds) => {
  const response = await api.post("/payments/bulk-sync", {
    payment_ids: paymentIds,
  });
  return response.data;
};

// Gets user's feature limits based on plan (max budgets, accounts, etc.)
export const getUserLimits = async () => {
  const response = await api.get("/user/limits");
  return response.data;
};

export default api;
