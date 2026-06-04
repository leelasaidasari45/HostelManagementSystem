import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import api from './api';

// Warm up the backend immediately on app load (prevents Render cold start delay)
api.get('/').catch(() => {});

// Import SubscriptionGuard for owner routes
import SubscriptionGuard from './components/SubscriptionGuard';

// Lazy load all pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const OwnerDashboard = lazy(() => import('./pages/owner/OwnerDashboard'));
const CreateHostel = lazy(() => import('./pages/owner/CreateHostel'));
const RoomsPage = lazy(() => import('./pages/owner/RoomsPage'));
const TenantsPage = lazy(() => import('./pages/owner/TenantsPage'));
const PastTenantsPage = lazy(() => import('./pages/owner/PastTenantsPage'));
const ComplaintsPage = lazy(() => import('./pages/owner/ComplaintsPage'));
const BillingPage = lazy(() => import('./pages/owner/BillingPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const TenantDashboard = lazy(() => import('./pages/tenant/TenantDashboard'));
const SearchHostels = lazy(() => import('./pages/tenant/SearchHostels'));
const JoinHostel = lazy(() => import('./pages/tenant/JoinHostel'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const SelectRolePage = lazy(() => import('./pages/SelectRolePage'));
const SelectPlanPage = lazy(() => import('./pages/SelectPlanPage'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const BankAccountsPage = lazy(() => import('./pages/owner/BankAccountsPage'));

import { Navigate } from 'react-router-dom';
import { HostelProvider } from './context/HostelContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, roleType }) => {
  const { user, loadingAuth, isSubscriptionValid } = useAuth();
  
  // If we have a cached user, render immediately — don't block with spinner
  if (loadingAuth && !user) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 9999 }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, var(--aurora-1), var(--aurora-2), var(--aurora-3))',
          animation: 'progressBar 1.5s ease-in-out infinite',
          backgroundSize: '200% 100%',
        }} />
        <style>{`
          @keyframes progressBar {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'unassigned' && window.location.pathname !== '/select-role') {
    return <Navigate to="/select-role" replace />;
  }

  // Gate: owner must have valid subscription or trial
  if (user.role === 'owner' && !isSubscriptionValid(user)) {
    if (window.location.pathname !== '/select-plan') {
      return <Navigate to="/select-plan" replace />;
    }
  }

  if (roleType && user.role !== roleType) {
    const destination = user.role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard';
    return <Navigate to={destination} replace />;
  }

  return children;
};

// Slim top progress bar — far less jarring than a full-screen spinner
const LoadingScreen = () => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 9999, background: 'var(--bg-base)' }}>
    <div style={{
      height: '100%',
      background: 'linear-gradient(90deg, var(--aurora-1), var(--aurora-2), var(--aurora-3))',
      backgroundSize: '200% 100%',
      animation: 'progressSweep 1.2s ease-in-out infinite',
    }} />
    <style>{`
      @keyframes progressSweep {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

import MobileSplash from './components/MobileSplash';
import { ThemeProvider } from './context/ThemeContext';
import { usePushNotifications } from './hooks/usePushNotifications';

// Detect Capacitor native platform
const isNative = typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() ||
   window.cordova !== undefined ||
   /android/i.test(navigator.userAgent) && window.location.protocol === 'file:');

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();

  // Initialize push notifications (for native mobile app)
  usePushNotifications(user);

  // Log page visits on path change
  React.useEffect(() => {
    api.post('/api/admin/visit', { page: location.pathname }).catch(() => {});
  }, [location.pathname]);

  // Show splash: always show for 3 seconds when the website is opened
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // Android hardware back button — navigate back or show exit prompt
  React.useEffect(() => {
    if (!isNative) return;
    let App;
    const setup = async () => {
      try {
        const cap = await import('@capacitor/app');
        App = cap.App;
        App.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back();
          } else {
            // At root — ask user if they want to exit
            if (window.confirm('Exit easyPG?')) {
              App.exitApp();
            }
          }
        });
      } catch (e) {}
    };
    setup();
    return () => { if (App) App.removeAllListeners(); };
  }, []);

  // No more global spinner — pages render immediately.
  // Only ProtectedRoute components block while loadingAuth is true.
  return (
    <div className="app-container relative">
      {showSplash && <MobileSplash />}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-bright)',
            border: '1px solid var(--border-muted)',
            borderRadius: '10px',
            boxShadow: 'var(--shadow-md)',
            fontSize: '.9rem',
            fontFamily: "'Inter', sans-serif",
            padding: '.75rem 1rem',
          },
          success: { iconTheme: { primary: '#34d399', secondary: 'transparent' } },
          error: { iconTheme: { primary: '#f87171', secondary: 'transparent' } },
        }}
      />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={isNative ? <Navigate to="/login" replace /> : <LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/select-role" element={<SelectRolePage />} />
          <Route path="/select-plan" element={<ProtectedRoute roleType="owner"><SelectPlanPage /></ProtectedRoute>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/owner/dashboard" element={<ProtectedRoute roleType="owner"><SubscriptionGuard><OwnerDashboard /></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/owner/create-hostel" element={<ProtectedRoute roleType="owner"><SubscriptionGuard><CreateHostel /></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/owner/rooms" element={<ProtectedRoute roleType="owner"><SubscriptionGuard><RoomsPage /></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/owner/complaints" element={<ProtectedRoute roleType="owner"><SubscriptionGuard><ComplaintsPage /></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/owner/billing" element={<ProtectedRoute roleType="owner"><SubscriptionGuard><BillingPage /></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/owner/tenants" element={<ProtectedRoute roleType="owner"><SubscriptionGuard><TenantsPage /></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/owner/past-tenants" element={<ProtectedRoute roleType="owner"><SubscriptionGuard><PastTenantsPage /></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/owner/bank-accounts" element={<ProtectedRoute roleType="owner"><SubscriptionGuard><BankAccountsPage /></SubscriptionGuard></ProtectedRoute>} />
          <Route path="/tenant/search" element={<ProtectedRoute roleType="tenant"><SearchHostels /></ProtectedRoute>} />
          <Route path="/tenant/join" element={<ProtectedRoute roleType="tenant"><JoinHostel /></ProtectedRoute>} />
          <Route path="/tenant/dashboard" element={<ProtectedRoute roleType="tenant"><TenantDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <HostelProvider>
            <AppContent />
          </HostelProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
// Triggering Vercel Rebuild 04/27/2026 19:35:00
