import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import {
  fetchCategories,
  fetchAccounts,
  fetchTransactions,
  fetchBudgets,
  fetchAnalytics,
  fetchUserLimits,
  createTransaction,
  updateTransaction as apiUpdateTransaction,
  deleteTransaction as apiDeleteTransaction,
  createCategory,
  updateCategory,
  deleteCategory as apiDeleteCategory,
  createBudget,
  updateBudget,
  deleteBudget as apiDeleteBudget,
  createAccount,
  updateAccount,
  deleteAccount as apiDeleteAccount,
  transferFunds,
  importTransactions as apiImportTransactions,
  processRecurringTransactions as apiProcessRecurring,
} from "../utils/api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planLimits, setPlanLimits] = useState({
    is_premium: false,
    limits: {
      max_budgets: 3,
      max_accounts: 2,
      max_categories: 10,
    },
  });

  // Analytics states
  const [financialSummary, setFinancialSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    incomeCount: 0,
    expenseCount: 0,
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterAccount, setFilterAccount] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");
  const [filterFavorites, setFilterFavorites] = useState("all");
  const [datePreset, setDatePreset] = useState("all"); // 'all', 'this_month', 'last_30', 'this_quarter', 'ytd', 'custom'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Currency preference
  const [currency, setCurrencyState] = useState(() => {
    try {
      return localStorage.getItem("expense_tracker_currency") || "$";
    } catch {
      return "$";
    }
  });

  const setCurrency = (symbol) => {
    setCurrencyState(symbol);
    try {
      localStorage.setItem("expense_tracker_currency", symbol);
    } catch {}
  };

  // Fetch Data - Load essential data first, then ledger & analytics
  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const [categoriesData, accountsData] = await Promise.all([
        fetchCategories(),
        fetchAccounts(),
      ]);

      setCategories(categoriesData || []);
      setAccounts(accountsData || []);
      setLoading(false);

      Promise.all([
        fetchTransactions({ per_page: 500 }),
        fetchBudgets(),
        fetchAnalytics(),
        fetchUserLimits().catch(() => null),
      ])
        .then(([transactionsData, budgetsData, analyticsData, limitsData]) => {
          setTransactions(transactionsData || []);
          setBudgets(budgetsData || []);

          if (limitsData) {
            setPlanLimits(limitsData);
          } else if (user) {
            setPlanLimits({
              is_premium: !!user.is_premium,
              limits: {
                max_budgets: user.is_premium ? null : 3,
                max_accounts: user.is_premium ? null : 2,
                max_categories: user.is_premium ? null : 10,
              },
            });
          }

          if (analyticsData) {
            setFinancialSummary({
              totalIncome: analyticsData.summary.income || 0,
              totalExpense: analyticsData.summary.expense || 0,
              balance: analyticsData.summary.balance || 0,
              incomeCount: analyticsData.summary.income_count || 0,
              expenseCount: analyticsData.summary.expense_count || 0,
            });

            const formattedCategoryBreakdown = (
              analyticsData.category_breakdown || []
            ).map((cat) => ({
              ...cat,
              value: parseFloat(cat.total),
            }));
            setCategoryBreakdown(formattedCategoryBreakdown);
            setMonthlyData(analyticsData.monthly_trend || []);
          }
        })
        .catch((error) => {
          console.error("Error fetching secondary data:", error);
        });
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // Compute effective date bounds from preset
  const effectiveDateBounds = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    if (datePreset === "this_month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      return { start, end: todayStr };
    }
    if (datePreset === "last_30") {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      return { start: past.toISOString().split("T")[0], end: todayStr };
    }
    if (datePreset === "this_quarter") {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      const start = new Date(now.getFullYear(), qMonth, 1).toISOString().split("T")[0];
      return { start, end: todayStr };
    }
    if (datePreset === "ytd") {
      const start = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
      return { start, end: todayStr };
    }
    if (datePreset === "custom") {
      return { start: startDate || null, end: endDate || null };
    }
    return { start: null, end: null };
  }, [datePreset, startDate, endDate]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) {
      return [];
    }

    const searchLower = searchQuery.trim().toLowerCase();

    let filtered = transactions.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterAccount !== "all" && String(t.account_id) !== String(filterAccount)) return false;

      // Search query across description, notes, category
      if (searchLower) {
        const desc = (t.description || "").toLowerCase();
        const notes = (t.notes || "").toLowerCase();
        const catName = (t.category?.name || "").toLowerCase();
        const accName = (t.account?.name || "").toLowerCase();
        if (
          !desc.includes(searchLower) &&
          !notes.includes(searchLower) &&
          !catName.includes(searchLower) &&
          !accName.includes(searchLower)
        ) {
          return false;
        }
      }

      // Date preset bounds
      const txDate = String(t.date).split("T")[0];
      if (effectiveDateBounds.start && txDate < effectiveDateBounds.start) return false;
      if (effectiveDateBounds.end && txDate > effectiveDateBounds.end) return false;

      // Legacy Month filter
      if (filterMonth !== "all") {
        const tMonth = new Date(t.date).getMonth();
        if (tMonth !== parseInt(filterMonth)) return false;
      }

      // Amount range filter
      if (
        filterMinAmount !== "" &&
        parseFloat(t.amount) < parseFloat(filterMinAmount)
      )
        return false;
      if (
        filterMaxAmount !== "" &&
        parseFloat(t.amount) > parseFloat(filterMaxAmount)
      )
        return false;

      // Favorites filter
      if (filterFavorites !== "all") {
        const isFav =
          t.is_favorite === true ||
          t.is_favorite === 1 ||
          t.is_favorite === "1";
        if (filterFavorites === "true" && !isFav) return false;
        if (filterFavorites === "false" && isFav) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "amount":
          aVal = parseFloat(a.amount);
          bVal = parseFloat(b.amount);
          break;
        case "description":
          aVal = (a.description || "").toLowerCase();
          bVal = (b.description || "").toLowerCase();
          break;
        case "type":
          aVal = a.type;
          bVal = b.type;
          break;
        case "date":
        default:
          aVal = new Date(a.date);
          bVal = new Date(b.date);
          break;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    transactions,
    searchQuery,
    filterType,
    filterAccount,
    filterMonth,
    effectiveDateBounds,
    filterMinAmount,
    filterMaxAmount,
    filterFavorites,
    sortBy,
    sortOrder,
  ]);

  // Budget Analysis uses backend 'spent' calculation
  const budgetAnalysis = useMemo(() => {
    if (!Array.isArray(budgets)) return [];
    return budgets.map((budget) => {
      const spent = parseFloat(budget.spent) || 0;
      const amount = parseFloat(budget.amount) || 0;
      return {
        ...budget,
        category: budget.category_name || "Unknown",
        color: budget.category_color || "#6b7280",
        emoji: budget.category_emoji,
        spent,
        percentage: amount > 0 ? (spent / amount) * 100 : 0,
        remaining: Math.max(amount - spent, 0),
      };
    });
  }, [budgets]);

  // Actions
  const addTransaction = async (transactionData) => {
    try {
      const response = await createTransaction(transactionData);
      if (response) {
        await loadData();
        return true;
      }
    } catch (error) {
      console.error("Failed to add transaction", error);
      throw error;
    }
    return false;
  };

  const editTransaction = async (id, transactionData) => {
    try {
      const response = await apiUpdateTransaction(id, transactionData);
      if (response) {
        await loadData();
        return true;
      }
    } catch (error) {
      console.error("Failed to update transaction", error);
      throw error;
    }
    return false;
  };

  const deleteTransaction = async (id) => {
    try {
      await apiDeleteTransaction(id);
      await loadData();
    } catch (error) {
      console.error("Failed to delete transaction", error);
      throw error;
    }
  };

  const deleteMultipleTransactions = async (ids) => {
    try {
      await Promise.all(ids.map((id) => apiDeleteTransaction(id)));
      await loadData();
    } catch (error) {
      console.error("Failed to delete multiple transactions", error);
      throw error;
    }
  };

  const addCategory = async (data) => {
    try {
      await createCategory(data);
      await loadData();
    } catch (error) {
      console.error("Failed to add category", error);
      throw error;
    }
  };

  const editCategory = async (id, data) => {
    try {
      await updateCategory(id, data);
      await loadData();
    } catch (error) {
      console.error("Failed to update category", error);
      throw error;
    }
  };

  const removeCategory = async (id) => {
    try {
      await apiDeleteCategory(id);
      await loadData();
    } catch (error) {
      console.error("Failed to delete category", error);
      throw error;
    }
  };

  const addAccount = async (data) => {
    try {
      await createAccount(data);
      await loadData();
    } catch (error) {
      console.error("Failed to add account", error);
      throw error;
    }
  };

  const editAccount = async (id, data) => {
    try {
      await updateAccount(id, data);
      await loadData();
    } catch (error) {
      console.error("Failed to update account", error);
      throw error;
    }
  };

  const removeAccount = async (id) => {
    try {
      await apiDeleteAccount(id);
      await loadData();
    } catch (error) {
      console.error("Failed to delete account", error);
      throw error;
    }
  };

  const transferAccountFunds = async (transferData) => {
    try {
      const res = await transferFunds(transferData);
      await loadData();
      return res;
    } catch (error) {
      console.error("Transfer error:", error);
      throw error;
    }
  };

  const bulkImportTransactions = async (rows) => {
    try {
      const res = await apiImportTransactions(rows);
      await loadData();
      return res;
    } catch (error) {
      console.error("Bulk import error:", error);
      throw error;
    }
  };

  const triggerRecurringProcessing = async () => {
    try {
      const res = await apiProcessRecurring();
      await loadData();
      return res;
    } catch (error) {
      console.error("Recurring processing error:", error);
      throw error;
    }
  };

  const addBudget = async (data) => {
    try {
      await createBudget(data);
      await loadData();
    } catch (error) {
      console.error("Failed to add budget", error);
      throw error;
    }
  };

  const editBudget = async (id, data) => {
    try {
      await updateBudget(id, data);
      await loadData();
    } catch (error) {
      console.error("Failed to update budget", error);
      throw error;
    }
  };

  const removeBudget = async (id) => {
    try {
      await apiDeleteBudget(id);
      await loadData();
    } catch (error) {
      console.error("Failed to delete budget", error);
      throw error;
    }
  };

  const getCategoryName = (catId) => {
    const cat = categories.find((c) => c.id === parseInt(catId));
    return cat ? cat.name : "Unknown";
  };

  const getCategoryColor = (catId) => {
    const cat = categories.find((c) => c.id === parseInt(catId));
    return cat ? cat.color : "#6b7280";
  };

  const getAccountName = (accId) => {
    const acc = accounts.find((a) => a.id === parseInt(accId));
    return acc ? acc.name : "Unknown";
  };

  const value = {
    loading,
    transactions,
    categories,
    accounts,
    budgets,
    planLimits,
    searchQuery,
    setSearchQuery,
    filterType,
    filterAccount,
    filterMonth,
    filterMinAmount,
    filterMaxAmount,
    filterFavorites,
    datePreset,
    setDatePreset,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    sortBy,
    sortOrder,
    setFilterType,
    setFilterAccount,
    setFilterMonth,
    setFilterMinAmount,
    setFilterMaxAmount,
    setFilterFavorites,
    setSortBy,
    setSortOrder,
    currency,
    setCurrency,
    filteredTransactions,
    financialSummary,
    categoryBreakdown,
    monthlyData,
    budgetAnalysis,
    addTransaction,
    editTransaction,
    deleteTransaction,
    deleteMultipleTransactions,
    addCategory,
    editCategory,
    removeCategory,
    addAccount,
    editAccount,
    removeAccount,
    transferAccountFunds,
    bulkImportTransactions,
    triggerRecurringProcessing,
    addBudget,
    editBudget,
    removeBudget,
    getCategoryName,
    getCategoryColor,
    getAccountName,
    refreshData: loadData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export default AppContext;
