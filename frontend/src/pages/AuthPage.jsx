import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Mail, Lock, User, Eye, EyeOff, Moon, Sun, Building, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import './AuthPage.css';

const languages = [
  { id: 'en', native: 'English', english: 'English' },
  { id: 'hi', native: 'हिंदी', english: 'Hindi' },
  { id: 'gu', native: 'ગુજરાતી', english: 'Gujarati' },
  { id: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada' },
  { id: 'ta', native: 'தமிழ்', english: 'Tamil' },
  { id: 'te', native: 'తెలుగు', english: 'Telugu' },
  { id: 'bn', native: 'বাংলা', english: 'Bangla' },
  { id: 'mr', native: 'मراठी', english: 'Marathi' },
];

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginContext, user: authUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Layout and Flow States
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileStep, setMobileStep] = useState(() => {
    const savedLang = localStorage.getItem('easyPG_lang');
    return savedLang ? 'email' : 'language';
  });
  const [selectedLang, setSelectedLang] = useState('en');
  const [emailInput, setEmailInput] = useState('');
  const [mobileRole, setMobileRole] = useState('owner'); // default registration role

  const [isLogin, setIsLogin] = useState(location.pathname !== '/register');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  // Handle mobile detection resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // ==================== MOBILE AUTH LAYOUTS ====================
  if (isMobile) {
    return (
      <div className={`mobile-auth-wrapper ${!isDarkMode ? 'light' : ''}`}>
        
        {/* Step 1: Language selection */}
        {mobileStep === 'language' && (
          <div className="mobile-auth-container lang-selection-screen">
            <div className="mobile-auth-header-row">
              <h2>Choose Language</h2>
              <button className="close-btn" onClick={() => setMobileStep('email')}>&times;</button>
            </div>
            <p className="lang-note">
              Note: Some translations are still in progress. We appreciate your patience as we work to improve the app's language support.
            </p>
            
            <div className="lang-grid">
              {languages.map((lang) => {
                const isSelected = selectedLang === lang.id;
                return (
                  <div 
                    key={lang.id} 
                    className={`lang-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedLang(lang.id)}
                  >
                    <div className="lang-card-main">
                      <span className="lang-native">{lang.native}</span>
                      <span className="lang-english">{lang.english}</span>
                    </div>
                    {isSelected && (
                      <div className="lang-tick">
                        <CheckCircle2 size={18} fill="#2563eb" color="#ffffff" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="bottom-btn-container">
              <button 
                className="mobile-continue-btn"
                onClick={() => {
                  localStorage.setItem('easyPG_lang', selectedLang);
                  setMobileStep('email');
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Email input screen */}
        {mobileStep === 'email' && (
          <div className="mobile-auth-container email-entry-screen">
            <div className="mobile-auth-top-actions">
              <button className="lang-select-btn" onClick={() => setMobileStep('language')}>
                🌐 {languages.find(l => l.id === selectedLang)?.english || 'English'}
              </button>
            </div>
            
            <div className="mobile-auth-hero">
              <div className="app-circle-logo">
                <span>easyPG</span>
              </div>
              <h1 className="app-super-title">easyPG</h1>
              <p className="app-super-subtitle">India's Renting SuperApp 🚀</p>
            </div>
            
            <div className="mobile-auth-form-card">
              <label className="mobile-input-label">Login with email</label>
              <div className="mobile-input-field">
                <Mail size={18} className="mobile-input-icon" />
                <input 
                  type="email" 
                  placeholder="name@company.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="mobile-email-input"
                />
              </div>
              
              <button 
                className="mobile-continue-btn"
                disabled={loading}
                onClick={async () => {
                  if (!emailInput || !emailInput.includes('@')) {
                    toast.error('Please enter a valid email address');
                    return;
                  }
                  setLoading(true);
                  try {
                    // Check if user exists
                    const { data, error } = await supabase
                      .from('users')
                      .select('id, name')
                      .eq('email', emailInput.trim().toLowerCase())
                      .maybeSingle();
                    
                    if (error) throw error;
                    
                    if (data) {
                      // User exists -> go to password login
                      setFormData(prev => ({ ...prev, email: emailInput.trim().toLowerCase() }));
                      setMobileStep('password_login');
                    } else {
                      // User does not exist -> show warning and suggest signup
                      toast.error('Account not found. Please Sign Up!');
                    }
                  } catch (err) {
                    toast.error(err.message || 'Error checking user account');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Continue'}
              </button>

              <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                New to easyPG?{' '}
                <span 
                  style={{ color: '#2563eb', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }} 
                  onClick={() => {
                    setFormData(prev => ({ ...prev, email: emailInput.trim().toLowerCase() }));
                    setMobileStep('register');
                  }}
                >
                  Sign Up
                </span>
              </p>
              
              <p className="mobile-disclaimer">
                By continuing you agree to our <br/>
                <a href="/terms" target="_blank" rel="noreferrer">Terms of Service</a> & <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Password Login screen */}
        {mobileStep === 'password_login' && (
          <div className="mobile-auth-container password-entry-screen">
            <div className="mobile-auth-hero">
              <div className="app-circle-logo">
                <span>easyPG</span>
              </div>
              <h1 className="app-super-title">Welcome Back</h1>
              <p className="app-super-subtitle" style={{ fontSize: '.9rem', color: 'var(--text-dim)' }}>
                Enter password for <strong style={{color: 'var(--text-bright)'}}>{formData.email}</strong>
              </p>
            </div>
            
            <div className="mobile-auth-form-card">
              <div className="mobile-input-field">
                <Lock size={18} className="mobile-input-icon" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mobile-email-input"
                />
                <button 
                  type="button" 
                  className="mobile-eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <button 
                className="mobile-continue-btn"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    const res = await api.post('/api/auth/login', { email: formData.email, password: formData.password });
                    loginContext(res.data);
                    toast.success('Welcome back!');
                    navigate(res.data.role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard');
                  } catch (err) {
                    toast.error(err.response?.data?.details || err.response?.data?.error || err.message || 'Login failed');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Log In'}
              </button>
              
              <div className="password-links">
                <Link to="/forgot-password" style={{ color: '#2563eb', fontSize: '.85rem', textDecoration: 'none' }}>Forgot password?</Link>
                <span className="back-link" onClick={() => setMobileStep('email')}>Change email</span>
              </div>

              <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                New to easyPG?{' '}
                <span 
                  style={{ color: '#2563eb', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }} 
                  onClick={() => setMobileStep('register')}
                >
                  Sign Up
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Register Profile screen */}
        {mobileStep === 'register' && (
          <div className="mobile-auth-container register-screen">
            <div className="mobile-auth-hero">
              <div className="app-circle-logo">
                <span>easyPG</span>
              </div>
              <h1 className="app-super-title">Create Account</h1>
              <p className="app-super-subtitle" style={{ fontSize: '.9rem', color: 'var(--text-dim)' }}>
                Join easyPG today
              </p>
            </div>
            
            <div className="mobile-auth-form-card">
              <div className="mobile-input-field" style={{ marginBottom: '0.2rem' }}>
                <User size={18} className="mobile-input-icon" />
                <input 
                  type="text" 
                  placeholder="Your Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mobile-email-input"
                />
              </div>

              <div className="mobile-input-field" style={{ marginBottom: '0.2rem' }}>
                <Mail size={18} className="mobile-input-icon" />
                <input 
                  type="email" 
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mobile-email-input"
                />
              </div>
              
              <div className="mobile-input-field" style={{ marginBottom: '0.2rem' }}>
                <Lock size={18} className="mobile-input-icon" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Create Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mobile-email-input"
                />
                <button 
                  type="button" 
                  className="mobile-eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <div className="mobile-input-field">
                <Lock size={18} className="mobile-input-icon" />
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="mobile-email-input"
                />
                <button 
                  type="button" 
                  className="mobile-eye-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <button 
                className="mobile-continue-btn"
                disabled={loading}
                onClick={async () => {
                  if (!formData.name.trim()) {
                    toast.error('Please enter your name');
                    return;
                  }
                  if (!formData.email.trim() || !formData.email.includes('@')) {
                    toast.error('Please enter a valid email address');
                    return;
                  }
                  if (formData.password.length < 6) {
                    toast.error('Password must be at least 6 characters');
                    return;
                  }
                  if (formData.password !== formData.confirmPassword) {
                    toast.error('Passwords do not match');
                    return;
                  }
                  setLoading(true);
                  try {
                    // Register with the unassigned role preference
                    const res = await api.post('/api/auth/register', { 
                      name: formData.name, 
                      email: formData.email, 
                      password: formData.password,
                      role: 'unassigned'
                    });
                    loginContext(res.data);
                    toast.success('Account created successfully!');
                    navigate('/select-role');
                  } catch (err) {
                    toast.error(err.response?.data?.details || err.response?.data?.error || err.message || 'Registration failed');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Register'}
              </button>
              
              <div className="password-links" style={{ justifyContent: 'center' }}>
                <span className="back-link" onClick={() => setMobileStep('email')}>Back to Login</span>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ==================== DESKTOP AUTH LAYOUT ====================
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

