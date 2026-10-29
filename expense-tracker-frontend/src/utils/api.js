const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Helper function to get headers with auth token
const getHeaders = (includeContentType = true) => {
  const token = localStorage.getItem("token");
  return {
    ...(includeContentType && { "Content-Type": "application/json" }),
    Accept: "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Extract the most descriptive error message from a Laravel JSON response
export const extractApiErrorMessage = (errorData, fallback = "An unexpected error occurred") => {
  if (!errorData) return fallback;
  if (errorData.errors && typeof errorData.errors === "object") {
    const firstFieldErrors = Object.values(errorData.errors).flat();
    if (firstFieldErrors.length > 0) {
      return firstFieldErrors[0];
    }
  }
  return errorData.error || errorData.message || fallback;
};

// Helper function to handle API responses
const handleResponse = async (response, options = {}) => {
  if (!response.ok) {
    if (response.status === 401 && !options.skipAuthRedirect) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/register")
      ) {
        window.location.href = "/login";
      }
    }

    const errorData = await response.json().catch(() => ({}));
    const message = extractApiErrorMessage(
      errorData,
      `HTTP ${response.status}: ${response.statusText}`
    );
    const err = new Error(message);
    err.status = response.status;
    err.userMessage = message;
    err.data = errorData;
    throw err;
  }
  return response.json();
};

// Auth endpoints
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response, { skipAuthRedirect: true });
};

export const registerUser = async (
  name,
  email,
  password,
  password_confirmation
) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ name, email, password, password_confirmation }),
  });
  return handleResponse(response, { skipAuthRedirect: true });
};

export const logoutUser = async () => {
  const response = await fetch(`${API_URL}/logout`, {
    method: "POST",
    headers: getHeaders(),
  });
  return handleResponse(response, { skipAuthRedirect: true });
};

export const updateUserProfile = async (data) => {
  const response = await fetch(`${API_URL}/user/profile`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateUserPassword = async (data) => {
  const response = await fetch(`${API_URL}/user/password`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// Fetch functions
export const fetchCategories = async () => {
  const response = await fetch(`${API_URL}/categories`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const fetchAccounts = async () => {
  const response = await fetch(`${API_URL}/accounts`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const fetchTransactions = async (params = {}) => {
  let url = `${API_URL}/transactions`;
  const queryParts = [];

  const perPage = params.per_page || 500;
  queryParts.push(`per_page=${perPage}`);

  if (params.type && params.type !== "all") queryParts.push(`type=${params.type}`);
  if (params.category_id && params.category_id !== "all") queryParts.push(`category_id=${params.category_id}`);
  if (params.account_id && params.account_id !== "all") queryParts.push(`account_id=${params.account_id}`);
  if (params.start_date) queryParts.push(`start_date=${params.start_date}`);
  if (params.end_date) queryParts.push(`end_date=${params.end_date}`);
  if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);

  if (queryParts.length > 0) {
    url += `?${queryParts.join("&")}`;
  }

  const response = await fetch(url, {
    headers: getHeaders(),
    cache: "no-store",
  });
  const data = await handleResponse(response);
  return data.data !== undefined ? data.data : data;
};

export const fetchBudgets = async () => {
  const response = await fetch(`${API_URL}/budgets`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const fetchAnalytics = async (params = {}) => {
  let url = `${API_URL}/analytics`;
  const queryParts = [];
  if (params.start_date) queryParts.push(`start_date=${params.start_date}`);
  if (params.end_date) queryParts.push(`end_date=${params.end_date}`);
  if (queryParts.length > 0) url += `?${queryParts.join("&")}`;

  const response = await fetch(url, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const fetchUserLimits = async () => {
  const response = await fetch(`${API_URL}/user/limits`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// Transaction CRUD & Advanced Operations
export const createTransaction = async (data) => {
  const isFormData = data instanceof FormData;
  const response = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: getHeaders(!isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateTransaction = async (id, data) => {
  const isFormData = data instanceof FormData;
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: "PUT",
    headers: getHeaders(!isFormData),
    body: isFormData ? data : JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteTransaction = async (id) => {
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const uploadTransactionReceipt = async (id, file) => {
  const formData = new FormData();
  formData.append("receipt", file);

  const response = await fetch(`${API_URL}/transactions/${id}/receipt`, {
    method: "POST",
    headers: getHeaders(false),
    body: formData,
  });
  return handleResponse(response);
};

export const importTransactions = async (transactionsArray) => {
  const response = await fetch(`${API_URL}/transactions/import`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ transactions: transactionsArray }),
  });
  return handleResponse(response);
};

export const processRecurringTransactions = async () => {
  const response = await fetch(`${API_URL}/transactions/process-recurring`, {
    method: "POST",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// Category CRUD
export const createCategory = async (data) => {
  const response = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateCategory = async (id, data) => {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteCategory = async (id) => {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// Account CRUD & Transfers
export const createAccount = async (data) => {
  const response = await fetch(`${API_URL}/accounts`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateAccount = async (id, data) => {
  const response = await fetch(`${API_URL}/accounts/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteAccount = async (id) => {
  const response = await fetch(`${API_URL}/accounts/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const transferFunds = async (transferData) => {
  const response = await fetch(`${API_URL}/accounts/transfer`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(transferData),
  });
  return handleResponse(response);
};

// Budget CRUD
export const createBudget = async (data) => {
  const response = await fetch(`${API_URL}/budgets`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateBudget = async (id, data) => {
  const response = await fetch(`${API_URL}/budgets/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteBudget = async (id) => {
  const response = await fetch(`${API_URL}/budgets/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// ==========================================
// SUBSCRIPTION & PAYMENTS API
// ==========================================

export const createCheckoutSession = async (priceId) => {
  const response = await fetch(`${API_URL}/subscription/checkout`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ price_id: priceId }),
  });
  return handleResponse(response);
};

export const getSubscriptionStatus = async () => {
  const response = await fetch(`${API_URL}/subscription/status`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const cancelSubscription = async () => {
  const response = await fetch(`${API_URL}/subscription/cancel`, {
    method: "POST",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const resumeSubscription = async () => {
  const response = await fetch(`${API_URL}/subscription/resume`, {
    method: "POST",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createPortalSession = async () => {
  const response = await fetch(`${API_URL}/subscription/portal`, {
    method: "POST",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getPayments = async () => {
  const response = await fetch(`${API_URL}/payments`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const syncPaymentToTransaction = async (paymentId) => {
  const response = await fetch(`${API_URL}/payments/${paymentId}/sync`, {
    method: "POST",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const bulkSyncPayments = async (paymentIds) => {
  const response = await fetch(`${API_URL}/payments/bulk-sync`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ payment_ids: paymentIds }),
  });
  return handleResponse(response);
};

export const getUserLimits = fetchUserLimits;

// ==========================================
// OCEANIC AI ADVISOR ENDPOINTS
// ==========================================

export const getAiAnalysis = async (refresh = false) => {
  const url = `${API_URL}/ai/analysis${refresh ? "?refresh=true" : ""}`;
  const response = await fetch(url, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const queryAiAdvisor = async (prompt) => {
  const response = await fetch(`${API_URL}/ai/query`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ prompt }),
  });
  return handleResponse(response);
};

export const categorizeWithAi = async (descriptionOrItems, amount = 0) => {
  const isBatch = Array.isArray(descriptionOrItems);
  const payload = isBatch
    ? { items: descriptionOrItems }
    : { description: descriptionOrItems, amount };

  const response = await fetch(`${API_URL}/ai/categorize`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

