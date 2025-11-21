import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

// Import API functions
import {
  fetchCategories,
  fetchAccounts,
  fetchTransactions,
  fetchBudgets,
  createTransaction,
  deleteTransaction as apiDeleteTransaction,
} from "./utils/api";

// Import components
import Header from "./components/Header";
import TabNavigation from "./components/TabNavigation";
import Dashboard from "./components/Dashboard/Dashboard";
import TransactionTable from "./components/Transactions/TransactionTable";
import BudgetList from "./components/Budgets/BudgetList";
import AccountList from "./components/Accounts/AccountList";
import AddTransactionModal from "./components/Modal/AddTransactionModal";
import CategoryManager from "./components/Categories/CategoryManager";

function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState("login"); // 'login' or 'register'

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showModal, setShowModal] = useState(false);

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

      setCategories(categoriesData);
      setAccounts(accountsData);
      setTransactions(transactionsData || []);
      setBudgets(budgetsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const handleCreateTransaction = async (formData) => {
    try {
      const response = await createTransaction(formData);

      if (response.message) {
        setShowModal(false);
        loadData();
      } else {
        alert("Failed to create transaction");
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      alert("Failed to create transaction");
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      await apiDeleteTransaction(id);
      loadData();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction");
    }
  };

  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showAuthModal === "login" ? (
      <Login onSwitchToRegister={() => setShowAuthModal("register")} />
    ) : (
      <Register onSwitchToLogin={() => setShowAuthModal("login")} />
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <Header
          onRefresh={loadData}
          onAddTransaction={() => setShowModal(true)}
        />

        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "dashboard" && (
          <Dashboard transactions={transactions} categories={categories} />
        )}

        {activeTab === "transactions" && (
          <TransactionTable
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            onDelete={handleDeleteTransaction}
          />
        )}

        {activeTab === "budgets" && (
          <BudgetList
            budgets={budgets}
            categories={categories}
            onUpdate={loadData}
          />
        )}

        {activeTab === "accounts" && (
          <AccountList accounts={accounts} onUpdate={loadData} />
        )}
        {activeTab === "categories" && (
          <CategoryManager categories={categories} onUpdate={loadData} />
        )}

        <AddTransactionModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateTransaction}
          categories={categories}
          accounts={accounts}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
