import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Lazy load all pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const OwnerDashboard = lazy(() => import('./pages/owner/OwnerDashboard'));
const CreateHostel = lazy(() => import('./pages/owner/CreateHostel'));
const RoomsPage = lazy(() => import('./pages/owner/RoomsPage'));
const TenantsPage = lazy(() => import('./pages/owner/TenantsPage'));
const PastTenantsPage = lazy(() => import('./pages/owner/PastTenantsPage'));
const ComplaintsPage = lazy(() => import('./pages/owner/ComplaintsPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const TenantDashboard = lazy(() => import('./pages/tenant/TenantDashboard'));
const JoinHostel = lazy(() => import('./pages/tenant/JoinHostel'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const SelectRolePage = lazy(() => import('./pages/SelectRolePage'));

import { Navigate } from 'react-router-dom';
import { HostelProvider } from './context/HostelContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, roleType }) => {
  const { user, loadingAuth } = useAuth();
  
  if (loadingAuth) {
    return <div className="flex justify-center items-center h-screen"><Loader2 size={48} className="animate-spin text-accent" /></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect unassigned users to role selection
  if (user.role === 'unassigned' && window.location.pathname !== '/select-role') {
    return <Navigate to="/select-role" replace />;
  }

  if (roleType && user.role !== roleType) {
    // If owner tries tenant page or vice versa, send to their own landing dashboard
    const destination = user.role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard';
    return <Navigate to={destination} replace />;
  }

  return children;
};

// Global Loading Fallback
const LoadingScreen = () => (
  <div className="flex flex-col justify-center items-center h-screen bg-[#0f172a] text-white">
    <div className="relative flex flex-col items-center">
      <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      <div className="mt-8 text-center text-[11px] uppercase tracking-[0.2em] opacity-60 font-medium">
        Loading Dashboard Please Wait<span className="animate-pulse">...</span>
      </div>
    </div>
    <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
      .animate-pulse {
        animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
    `}</style>
  </div>
);

import MobileSplash from './components/MobileSplash';
import { ThemeProvider } from './context/ThemeContext';


function AppContent() {
  const { loadingAuth } = useAuth();
  
  // Check if we already splashed this session
  const [showSplash, setShowSplash] = React.useState(() => {
    const isMobile = window.innerWidth <= 768;
    const sessionSplashed = sessionStorage.getItem('hasSplashed');
    return isMobile && !sessionSplashed;
  });

  React.useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('hasSplashed', 'true');
      }, 2800); // 2.5s display + 0.3s fade buffer
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  if (showSplash) return <MobileSplash />;

  // GLOBAL SPINNER: If backend is still cold, show the premium loader for ALL pages
  if (loadingAuth) return <LoadingScreen />;

  return (
    <div className="app-container relative">
      <Toaster position="top-right" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }} 
      />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/select-role" element={<SelectRolePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/owner/dashboard" element={<ProtectedRoute roleType="owner"><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/owner/create-hostel" element={<ProtectedRoute roleType="owner"><CreateHostel /></ProtectedRoute>} />
          <Route path="/owner/rooms" element={<ProtectedRoute roleType="owner"><RoomsPage /></ProtectedRoute>} />
          <Route path="/owner/complaints" element={<ProtectedRoute roleType="owner"><ComplaintsPage /></ProtectedRoute>} />
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
