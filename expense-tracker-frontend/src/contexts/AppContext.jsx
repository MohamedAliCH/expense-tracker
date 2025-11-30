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
  createTransaction,
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
} from "../utils/api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");
  const [filterFavorites, setFilterFavorites] = useState("all"); // 'all', 'true', 'false'
  const [sortBy, setSortBy] = useState("date"); // 'date', 'amount', 'description', 'type'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc', 'desc'

  // Fetch Data
  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const [categoriesData, accountsData, transactionsData, budgetsData] =
        await Promise.all([
          fetchCategories(),
          fetchAccounts(),
          fetchTransactions(),
          fetchBudgets(),
        ]);

      setCategories(categoriesData || []);
      setAccounts(accountsData || []);
      setTransactions(transactionsData || []);
      setBudgets(budgetsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Optional: Add toast notification here
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // --- Computed Values ---

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    // Safety check: ensure transactions is an array
    if (!Array.isArray(transactions)) {
      return [];
    }

    let filtered = transactions.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
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

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "amount":
          aVal = parseFloat(a.amount);
          bVal = parseFloat(b.amount);
          break;
        case "description":
          aVal = a.description.toLowerCase();
          bVal = b.description.toLowerCase();
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
    filterType,
    filterMonth,
    filterMinAmount,
    filterMaxAmount,
    filterFavorites,
    sortBy,
    sortOrder,
  ]);

  // Financial Summary
  const financialSummary = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const expense = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      incomeCount: filteredTransactions.filter((t) => t.type === "income")
        .length,
      expenseCount: filteredTransactions.filter((t) => t.type === "expense")
        .length,
    };
  }, [filteredTransactions]);

  // Category Breakdown
  const categoryBreakdown = useMemo(() => {
    return categories
      .filter((c) => c.type === "expense")
      .map((cat) => {
        const total = filteredTransactions
          .filter(
            (t) =>
              t.type === "expense" &&
              (parseInt(t.category_id) === cat.id || t.category?.id === cat.id)
          )
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        return { ...cat, total, value: total };
      })
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [categories, filteredTransactions]);

  // Monthly Data (Last 6 Months)
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthLabel = date.toLocaleString("default", { month: "short" });

      // Safety check: ensure transactions is an array
      if (!Array.isArray(transactions)) {
        return { month: monthLabel, income: 0, expense: 0 };
      }

      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return (
          tDate.getMonth() === date.getMonth() &&
          tDate.getFullYear() === date.getFullYear()
        );
      });

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + parseFloat(t.amount), 0);
      const expense = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + parseFloat(t.amount), 0);

      return { month: monthLabel, income, expense };
    });
  }, [transactions]);

  // Budget Analysis
  const budgetAnalysis = useMemo(() => {
    return budgets.map((budget) => {
      const category = categories.find(
        (c) => c.id === parseInt(budget.category_id)
      );

      // Safety check: ensure transactions is an array
      const spent = Array.isArray(transactions)
        ? transactions
            .filter(
              (t) =>
                t.type === "expense" &&
                parseInt(t.category_id) === parseInt(budget.category_id)
            )
            .reduce((sum, t) => sum + parseFloat(t.amount), 0)
        : 0;

      return {
        ...budget,
        category: category?.name || "Unknown",
        color: category?.color || "#6b7280",
        emoji: category?.emoji,
        spent,
        percentage: (spent / budget.amount) * 100,
        remaining: Math.max(budget.amount - spent, 0),
      };
    });
  }, [budgets, categories, transactions]);

  // --- Actions ---

  // Transactions
  const addTransaction = async (transactionData) => {
    try {
      const response = await createTransaction(transactionData);
      if (response) {
        await loadData(); // Reload to get fresh data
        return true;
      }
    } catch (error) {
      console.error("Failed to add transaction", error);
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

  // Categories
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

  // Accounts
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

  // Budgets
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

  // Helpers
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
    filterType,
    filterMonth,
    filterMinAmount,
    filterMaxAmount,
    filterFavorites,
    sortBy,
    sortOrder,
    setFilterType,
    setFilterMonth,
    setFilterMinAmount,
    setFilterMaxAmount,
    setFilterFavorites,
    setSortBy,
    setSortOrder,
    filteredTransactions,
    financialSummary,
    categoryBreakdown,
    monthlyData,
    budgetAnalysis,
    addTransaction,
    deleteTransaction,
    addCategory,
    editCategory,
    removeCategory,
    addAccount,
    editAccount,
    removeAccount,
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
