import React, { useState } from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Header from "./components/Header";
import TabNavigation from "./components/Common/TabNavigation";
import Dashboard from "./components/Dashboard/Dashboard";
import TransactionTable from "./components/Transactions/TransactionTable";
import BudgetList from "./components/Budgets/BudgetList";
import AccountList from "./components/Accounts/AccountList";
import TransactionModal from "./components/Transactions/TransactionModal";
import CategoryManager from "./components/Categories/CategoryManager";

function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState("login");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showModal, setShowModal] = useState(false);

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

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <Header
          onAddTransaction={() => setShowModal(true)}
          // onRefresh is now handled within components via context if needed,
          // or we can expose refreshData from context and pass it here if Header needs it.
          // For now, let's assume Header might need a refresh prop or we update Header to use context too.
          // Let's pass a dummy function or update Header later.
          // Actually, Header usually has a refresh button. Let's leave it for now and update Header to use context if needed.
        />

        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "transactions" && <TransactionTable />}
        {activeTab === "budgets" && <BudgetList />}
        {activeTab === "accounts" && <AccountList />}
        {activeTab === "categories" && <CategoryManager />}

        <TransactionModal
          show={showModal}
          onClose={() => setShowModal(false)}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
