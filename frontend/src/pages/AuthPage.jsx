import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Mail, Lock, User, Eye, EyeOff, Moon, Sun, Building, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import './AuthPage.css';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginContext, user: authUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(location.pathname !== '/register');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  useEffect(() => {
    if (authUser) navigate(authUser.role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard');
  }, [authUser, navigate]);

  useEffect(() => { setIsLogin(location.pathname !== '/register'); }, [location.pathname]);

  const handleToggle = (mode) => {
    setIsLogin(mode === 'login');
    navigate(mode === 'login' ? '/login' : '/register');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await api.post('/api/auth/login', { email: formData.email, password: formData.password });
        loginContext(res.data);
        toast.success('Welcome back!');
        navigate(res.data.role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard');
      } else {
        if (formData.password !== formData.confirmPassword) throw new Error("Passwords don't match");
        const res = await api.post('/api/auth/register', { name: formData.name, email: formData.email, password: formData.password });
        loginContext(res.data);
        toast.success('Account created!');
        navigate('/select-role');
      }
    } catch (err) {
      toast.error(err.response?.data?.details || err.response?.data?.error || err.message || 'Authentication failed');
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } });
      if (error) throw error;
    } catch (err) { toast.error(err.message || 'Google login failed'); }
  };

  return (
    <div className={`auth-page-v2 ${!isDarkMode ? 'light' : ''}`}>
      <div className="auth-wrapper">
        {/* Navigation */}
        <div className="auth-nav">
          <Link to="/" className="auth-logo-link">
            <img src="/logo.png" alt="easyPG" style={{ height: '32px', objectFit: 'contain' }} />
          </Link>
          <button 
            className="theme-btn"
            onClick={toggleTheme}
            type="button"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Main Content */}
        <div className="auth-container-v2">
          {/* Left Decorative Section */}
          <div className="auth-decoration">
            <div className="decoration-card">
              <div className="decoration-header">
                <h2>Modern Living, <br/>Simplified.</h2>
                <p>The all-in-one management suite for modern property owners and happy tenants.</p>
              </div>
              <div className="decoration-features">
                <div className="feature-item">
                  <div className="feature-check">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4>Smart Operations</h4>
                    <p>Automate your workflow and save hours every week.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-check">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4>Secure Infrastructure</h4>
                    <p>Bank-grade encryption for all your sensitive data.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-check">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4>Unified Experience</h4>
                    <p>One platform for billing, maintenance, and communication.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="auth-form-section">
            <div className="form-container">
              {/* Form Header */}
              <div className="form-header">
                <h1>{isLogin ? 'Welcome Back' : 'Get Started'}</h1>
                <p>{isLogin ? 'Enter your credentials to access your dashboard' : 'Create an account to start managing your property'}</p>
              </div>

              {/* Toggle Buttons */}
              <div className="form-tabs">
                <button 
                  className={`tab-btn ${isLogin ? 'active' : ''}`}
                  onClick={() => handleToggle('login')}
                  type="button"
                >
                  Sign In
                </button>
                <button 
                  className={`tab-btn ${!isLogin ? 'active' : ''}`}
                  onClick={() => handleToggle('register')}
                  type="button"
                >
                  Sign Up
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="auth-form-v2">
                {!isLogin && (
                  <div className="form-group-v2">
                    <label>Full Name</label>
                    <div className="input-field">
                      <User size={20} />
                      <input 
                        type="text" 
                        placeholder="John Doe"
                        value={formData.name} 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}
                
                <div className="form-group-v2">
                  <label>Email Address</label>
                  <div className="input-field">
                    <Mail size={20} />
                    <input 
                      type="email" 
                      placeholder="name@company.com"
                      value={formData.email} 
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                      required
                    />
                  </div>
                </div>

                <div className="form-group-v2">
                  <label>Password</label>
                  <div className="input-field">
                    <Lock size={20} />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••"
                      value={formData.password} 
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                      required
                    />
                    <button 
                      type="button" 
                      className="eye-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="form-group-v2">
                    <label>Confirm Password</label>
                    <div className="input-field">
                      <Lock size={20} />
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        placeholder="••••••••"
                        value={formData.confirmPassword} 
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
                        required={!isLogin}
                      />
                      <button 
                        type="button" 
                        className="eye-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 size={20} className="spin" />{isLogin ? 'Authenticating...' : 'Preparing Workspace...'}</>
                  ) : (
                    <>{isLogin ? 'Continue to Dashboard' : 'Create My Account'}</>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="divider">
                <span>or continue with</span>
              </div>

              {/* Google Button */}
              <button 
                onClick={handleGoogleLogin} 
                className="google-btn-v2"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google Account
              </button>

              {/* Footer */}
              <p className="form-footer">
                {isLogin ? "New to AntiGravity?" : 'Already a member?'}{' '}
                <button 
                  type="button" 
                  onClick={() => handleToggle(isLogin ? 'register' : 'login')} 
                  className="link-btn"
                >
                  {isLogin ? 'Sign up for free' : 'Sign in here'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

