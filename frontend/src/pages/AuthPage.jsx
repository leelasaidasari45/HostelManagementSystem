import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, Loader2, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import './AuthPage.css';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginContext, user: authUser } = useAuth();
  
  // Set initial mode based on path
  const [isLogin, setIsLogin] = useState(location.pathname !== '/register');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Redirect if already logged in
  useEffect(() => {
    if (authUser) {
      navigate(authUser.role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard');
    }
  }, [authUser, navigate]);

  // Sync state if URL changes
  useEffect(() => {
    setIsLogin(location.pathname !== '/register');
  }, [location.pathname]);

  const handleToggle = (mode) => {
    setIsLogin(mode === 'login');
    navigate(mode === 'login' ? '/login' : '/register');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login Flow
        const res = await api.post('/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        loginContext(res.data);
        toast.success('Welcome back!');
        navigate(res.data.role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard');
      } else {
        // Register Flow
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords don't match");
        }
        const res = await api.post('/api/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        loginContext(res.data);
        toast.success('Account created successfully!');
        navigate('/select-role');
      }
    } catch (err) {
      const msg = err.response?.data?.details || err.response?.data?.error || err.message || 'Authentication failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err.message || 'Google login failed');
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card-unified">
        
        {/* Left Side Branding */}
        <div className="auth-side-branding">
          <div className="branding-content">
            <h1 className="branding-title">easy<span>PG.</span></h1>
            <p className="branding-subtitle">Your hostel management, reimagined.</p>
            
            <div className="branding-features">
              <div className="feature-item">
                <div className="feature-dot"></div>
                <span>Unified dashboard for all your properties</span>
              </div>
              <div className="feature-item">
                <div className="feature-dot"></div>
                <span>Real-time tenant & room tracking</span>
              </div>
              <div className="feature-item">
                <div className="feature-dot"></div>
                <span>Seamless automated rent management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="auth-side-form">
          <div className="auth-tab-switcher">
            <button 
              className={`tab-btn ${isLogin ? 'active' : ''}`}
              onClick={() => handleToggle('login')}
            >
              Sign in
            </button>
            <button 
              className={`tab-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => handleToggle('register')}
            >
              Create account
            </button>
          </div>

          <div className="auth-form-header">
            <h2>{isLogin ? 'Welcome back' : 'Get started'}</h2>
            <p>{isLogin ? 'Sign in to continue to your workspace' : 'Create an account to start managing'}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-main-form">
            {!isLogin && (
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <User size={16} className="text-muted" /> Full Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <Mail size={16} className="text-muted" /> Email Address
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            {isLogin ? (
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <Lock size={16} className="text-muted" /> Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <div className="text-right mt-1">
                  <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>
                    Forgot password?
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                  <label className="form-label flex items-center gap-2">
                    <Lock size={16} className="text-muted" /> Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label flex items-center gap-2">
                    <Lock size={16} className="text-muted" /> Confirm
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : (isLogin ? <LogIn size={18} /> : <UserPlus size={18} />)}
              {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign in' : 'Create account')}
            </button>
          </form>

          <div className="divider">or continue with</div>

          <div className="auth-social-login">
            <button onClick={handleGoogleLogin} className="social-btn">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
              <span>Continue with Google</span>
            </button>
          </div>

          <p className="text-center mt-8 text-muted" style={{ fontSize: '0.9rem' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"} {' '}
            <button 
              onClick={() => handleToggle(isLogin ? 'register' : 'login')}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: '600' }}
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
