import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { ToastProvider } from "./contexts/ToastContext";
import Header from "./components/Header";
import TransactionModal from "./components/Transactions/TransactionModal";
import ProfileModal from "./components/Auth/ProfileModal";
import AiAdvisorModal from "./components/Dashboard/AiAdvisorModal";
import SeaBackdrop from "./components/Common/SeaBackdrop";
import CommandFinder from "./components/Common/CommandFinder";
import { DashboardSkeleton } from "./components/Common/MoorlySkeleton";

// Route-level code splitting for faster initial bundle load
const Login = lazy(() => import("./components/Auth/Login"));
const Register = lazy(() => import("./components/Auth/Register"));
const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));
const TransactionTable = lazy(() => import("./components/Transactions/TransactionTable"));
const BudgetList = lazy(() => import("./components/Budgets/BudgetList"));
const AccountList = lazy(() => import("./components/Accounts/AccountList"));
const CategoryManager = lazy(() => import("./components/Categories/CategoryManager"));
const UpgradePage = lazy(() => import("./components/Premium/UpgradePage"));
const PaymentList = lazy(() => import("./components/Payments/PaymentList"));
const SubscriptionSuccess = lazy(() => import("./components/Premium/SubscriptionSuccess"));
const SubscriptionCanceled = lazy(() => import("./components/Premium/SubscriptionCanceled"));

const LoadingScreen = () => (
  <div className="min-h-[100dvh] flex items-center justify-center p-6">
    <SeaBackdrop />
    <div className="moorly-card flex items-center gap-3.5 px-6 py-4">
      <div
        className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
      />
      <span className="text-[13px] font-semibold tracking-wide" style={{ color: "var(--ink-2)" }}>
        Preparing Expense Tracker...
      </span>
    </div>
  </div>
);

const PrivateLayout = ({ theme, onToggleTheme }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showFinder, setShowFinder] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdvisor, setShowAdvisor] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Finder shortcut (Cmd+K or Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowFinder((prev) => !prev);
        return;
      }

      // Do not trigger single-key hotkeys when typing in form inputs, textareas, or contentEditable
      const target = e.target;
      const tagName = target?.tagName?.toLowerCase();
      const isInput =
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        target?.isContentEditable;

      if (isInput) return;

      // Ignore if modifier keys are pressed
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setShowModal(true);
      } else if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        onToggleTheme();
      } else if (e.key === "x" || e.key === "X") {
        e.preventDefault();
        navigate("/accounts");
      } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        setShowProfile(true);
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        setShowAdvisor(true);
      } else if (e.key === "/") {
        e.preventDefault();
        setShowFinder(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, onToggleTheme]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col relative">
      <SeaBackdrop />

      <Header
        onAddTransaction={() => setShowModal(true)}
        onOpenFinder={() => setShowFinder(true)}
        onOpenProfile={() => setShowProfile(true)}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <main className="flex-1 w-full max-w-[1500px] mx-auto px-3 sm:px-6 pt-5 pb-28 lg:pb-12">
        <Suspense fallback={<DashboardSkeleton />}>
          <Outlet context={{ onAddTransaction: () => setShowModal(true) }} />
        </Suspense>
      </main>

      <TransactionModal
        show={showModal}
        onClose={() => setShowModal(false)}
      />

      <ProfileModal
        show={showProfile}
        onClose={() => setShowProfile(false)}
      />

      <CommandFinder
        show={showFinder}
        onClose={() => setShowFinder(false)}
        onAddTransaction={() => setShowModal(true)}
        onOpenProfile={() => setShowProfile(true)}
        onOpenAdvisor={() => setShowAdvisor(true)}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <AiAdvisorModal
        show={showAdvisor}
        onClose={() => setShowAdvisor(false)}
      />
    </div>
  );
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-[100dvh] relative">
      <SeaBackdrop />
      <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
    </div>
  );
};

function App() {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem("moorly:theme");
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (parsed === "dark" || parsed === "light") return parsed;
      }
      // Auto-detect system preference if no user preference is stored
      if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
      return "light";
    } catch {
      return "light";
    }
  });

  // Listen to OS system color-scheme changes if no explicit user override exists
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      if (localStorage.getItem("moorly:theme") === null) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("moorly:theme", JSON.stringify(theme));
    } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

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
            <Route element={<PrivateLayout theme={theme} onToggleTheme={toggleTheme} />}>
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

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
