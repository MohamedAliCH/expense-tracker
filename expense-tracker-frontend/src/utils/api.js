const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Helper function to get headers with auth token
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
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
  return handleResponse(response);
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
  return handleResponse(response);
};

export const logoutUser = async () => {
  const response = await fetch(`${API_URL}/logout`, {
    method: "POST",
    headers: getHeaders(),
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

export const fetchTransactions = async () => {
  const response = await fetch(`${API_URL}/transactions`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const fetchBudgets = async () => {
  const response = await fetch(`${API_URL}/budgets`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const fetchAnalytics = async () => {
  const response = await fetch(`${API_URL}/analytics`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// Transaction CRUD
export const createTransaction = async (data) => {
  console.log("API: Creating transaction", data);
  const response = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateTransaction = async (id, data) => {
  console.log("API: Updating transaction", id, data);
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteTransaction = async (id) => {
  console.log("API: Deleting transaction", id);
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// Category CRUD
export const createCategory = async (data) => {
  console.log("API: Creating category", data);
  const response = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateCategory = async (id, data) => {
  console.log("API: Updating category", id, data);
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteCategory = async (id) => {
  console.log("API: Deleting category", id);
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// Account CRUD
export const createAccount = async (data) => {
  console.log("API: Creating account", data);
  const response = await fetch(`${API_URL}/accounts`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const result = await handleResponse(response);
  console.log("API: Account created", result);
  return result;
};

export const updateAccount = async (id, data) => {
  console.log("API: Updating account", id, data);
  const response = await fetch(`${API_URL}/accounts/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const result = await handleResponse(response);
  console.log("API: Account updated", result);
  return result;
};

export const deleteAccount = async (id) => {
  console.log("API: Deleting account", id);
  const response = await fetch(`${API_URL}/accounts/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  const result = await handleResponse(response);
  console.log("API: Account deleted", result);
  return result;
};

// Budget CRUD
export const createBudget = async (data) => {
  console.log("API: Creating budget", data);
  const response = await fetch(`${API_URL}/budgets`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateBudget = async (id, data) => {
  console.log("API: Updating budget", id, data);
  const response = await fetch(`${API_URL}/budgets/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteBudget = async (id) => {
  console.log("API: Deleting budget", id);
  const response = await fetch(`${API_URL}/budgets/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);

};