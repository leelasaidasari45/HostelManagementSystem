import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import api from './api';

// Warm up the backend immediately on app load (prevents Render cold start delay)
api.get('/').catch(() => {});


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
const JoinHostel = lazy(() => import('./pages/tenant/JoinHostel'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const SelectRolePage = lazy(() => import('./pages/SelectRolePage'));
const SelectPlanPage = lazy(() => import('./pages/SelectPlanPage'));

import { Navigate } from 'react-router-dom';
import { HostelProvider } from './context/HostelContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, roleType }) => {
  const { user, loadingAuth } = useAuth();
  
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

  // Gate: owner hasn't set up any subscription → force to /select-plan
  const hasActiveSub = user?.subscription_status === 'active' || user?.subscription_status === 'trial';
  if (
    user.role === 'owner' &&
    !user.payment_setup_complete &&
    !hasActiveSub &&
    window.location.pathname !== '/select-plan'
  ) {
    return <Navigate to="/select-plan" replace />;
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

// Detect Capacitor native platform
const isNative = typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() ||
   window.cordova !== undefined ||
   /android/i.test(navigator.userAgent) && window.location.protocol === 'file:');

function AppContent() {
  // Show splash: always on native app, or on mobile browser first visit
  const [showSplash, setShowSplash] = React.useState(() => {
    const sessionSplashed = sessionStorage.getItem('hasSplashed');
    if (sessionSplashed) return false;
    // Always show splash on native Capacitor app
    if (isNative) return true;
    // On mobile browser, only show on first visit
    return window.innerWidth <= 900;
  });

  React.useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('hasSplashed', 'true');
      }, 2800);
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

  if (showSplash) return <MobileSplash />;

  // No more global spinner — pages render immediately.
  // Only ProtectedRoute components block while loadingAuth is true.
  return (
    <div className="app-container relative">
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
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/select-role" element={<SelectRolePage />} />
          <Route path="/select-plan" element={<ProtectedRoute roleType="owner"><SelectPlanPage /></ProtectedRoute>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/owner/dashboard" element={<ProtectedRoute roleType="owner"><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/owner/create-hostel" element={<ProtectedRoute roleType="owner"><CreateHostel /></ProtectedRoute>} />
          <Route path="/owner/rooms" element={<ProtectedRoute roleType="owner"><RoomsPage /></ProtectedRoute>} />
          <Route path="/owner/complaints" element={<ProtectedRoute roleType="owner"><ComplaintsPage /></ProtectedRoute>} />
          <Route path="/owner/billing" element={<ProtectedRoute roleType="owner"><BillingPage /></ProtectedRoute>} />
          <Route path="/owner/tenants" element={<ProtectedRoute roleType="owner"><TenantsPage /></ProtectedRoute>} />
          <Route path="/owner/past-tenants" element={<ProtectedRoute roleType="owner"><PastTenantsPage /></ProtectedRoute>} />
          <Route path="/tenant/join" element={<ProtectedRoute roleType="tenant"><JoinHostel /></ProtectedRoute>} />
          <Route path="/tenant/dashboard" element={<ProtectedRoute roleType="tenant"><TenantDashboard /></ProtectedRoute>} />
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
