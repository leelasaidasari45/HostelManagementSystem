import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Lazy load all pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
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
const SelectPlanPage = lazy(() => import('./pages/SelectPlanPage'));

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

  // Mandatory Payment Setup for Owners
  if (user.role === 'owner' && !user.payment_setup_complete && window.location.pathname !== '/select-plan') {
    return <Navigate to="/select-plan" replace />;
  }

  if (roleType && user.role !== roleType) {
    return <Navigate to={user.role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard'} replace />;
  }

  return children;
};

// Global Loading Fallback
const LoadingScreen = () => (
  <div className="flex justify-center items-center h-screen bg-[#0f172a]">
    <Loader2 size={48} className="animate-spin text-indigo-500" />
  </div>
);

import { setupPushNotifications } from './utils/PushNotifications';
import MobileSplash from './components/MobileSplash';

function App() {
  const [showSplash, setShowSplash] = React.useState(false);
  const [hasSplashed, setHasSplashed] = React.useState(false);

  React.useEffect(() => {
    setupPushNotifications();
    
    // Check if mobile view and if we haven't splashed in this SESSION (using sessionStorage)
    const isMobile = window.innerWidth <= 768;
    const sessionSplashed = sessionStorage.getItem('hasSplashed');

    if (isMobile && !sessionSplashed && !hasSplashed) {
      setShowSplash(true);
      const timer = setTimeout(() => {
        setShowSplash(false);
        setHasSplashed(true);
        sessionStorage.setItem('hasSplashed', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasSplashed]);

  if (showSplash) return <MobileSplash />;

  return (
    <AuthProvider>
    <Router>
      <HostelProvider>
        <div className="app-container">
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
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/select-plan" element={<ProtectedRoute roleType="owner"><SelectPlanPage /></ProtectedRoute>} />
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
      </HostelProvider>
    </Router>
    </AuthProvider>
  );
}

export default App;

