const API_URL = "http://localhost:8000/api";

// Helper function to get headers with auth token
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Auth endpoints
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
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
  return response.json();
};

export const logoutUser = async () => {
  const response = await fetch(`${API_URL}/logout`, {
    method: "POST",
    headers: getHeaders(),
  });
  return response.json();
};

// Update existing functions to include auth headers
export const fetchCategories = async () => {
  const response = await fetch(`${API_URL}/categories`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  return response.json();
};

export const fetchAccounts = async () => {
  const response = await fetch(`${API_URL}/accounts`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  return response.json();
};

export const fetchTransactions = async () => {
  const response = await fetch(`${API_URL}/transactions`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  return response.json();
};

export const fetchBudgets = async () => {
  const response = await fetch(`${API_URL}/budgets`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  return response.json();
};

export const createTransaction = async (data) => {
  const response = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create transaction");
  }
  return response.json();
};

export const updateTransaction = async (id, data) => {
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update transaction");
  }
  return response.json();
};

export const deleteTransaction = async (id) => {
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete transaction");
  }
  return response.json();
};

export const fetchAnalytics = async () => {
  const response = await fetch(`${API_URL}/analytics`, {
    headers: getHeaders(),
  });
  return response.json();
};

// Category CRUD
export const createCategory = async (data) => {
  const response = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateCategory = async (id, data) => {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteCategory = async (id) => {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return response.json();
};

// Account CRUD
export const createAccount = async (data) => {
  const response = await fetch(`${API_URL}/accounts`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateAccount = async (id, data) => {
  const response = await fetch(`${API_URL}/accounts/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteAccount = async (id) => {
  const response = await fetch(`${API_URL}/accounts/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return response.json();
};

// Budget CRUD
export const createBudget = async (data) => {
  const response = await fetch(`${API_URL}/budgets`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateBudget = async (id, data) => {
  const response = await fetch(`${API_URL}/budgets/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteBudget = async (id) => {
  const response = await fetch(`${API_URL}/budgets/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return response.json();
};
