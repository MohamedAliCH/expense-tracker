import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import "./App.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { ToastProvider } from "./contexts/ToastContext";
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
import UpgradePage from "./components/Premium/UpgradePage";
import PaymentList from "./components/Payments/PaymentList";
import SubscriptionSuccess from "./components/Premium/SubscriptionSuccess";
import SubscriptionCanceled from "./components/Premium/SubscriptionCanceled";

// Layout for authenticated routes
const PrivateLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <Header onAddTransaction={() => setShowModal(true)} />
        <TabNavigation />
        <Outlet />

        <TransactionModal
          show={showModal}
          onClose={() => setShowModal(false)}
        />
      </div>
    </div>
  );
};

// Public route wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Private Routes */}
            <Route element={<PrivateLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<TransactionTable />} />
              <Route path="/budgets" element={<BudgetList />} />
              <Route path="/accounts" element={<AccountList />} />
              <Route path="/categories" element={<CategoryManager />} />
              <Route path="/upgrade" element={<UpgradePage />} />
              <Route path="/payments" element={<PaymentList />} />
              <Route
                path="/subscription/success"
                element={<SubscriptionSuccess />}
              />
              <Route
                path="/subscription/canceled"
                element={<SubscriptionCanceled />}
              />
            </Route>

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
