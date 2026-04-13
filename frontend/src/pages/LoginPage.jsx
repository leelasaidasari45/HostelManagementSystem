import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, BuildingIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import './AuthPages.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginContext, user } = useAuth();

  React.useEffect(() => {
    if (user) {
      navigate(user.role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', formData);
      loginContext(res.data);

      toast.success('Welcome back!');

      if (res.data.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/tenant/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel slide-up">
        <div className="auth-header flex-col items-center gap-2">
          <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <img src="https://i.pinimg.com/736x/1d/31/58/1d315807fbdbf074612825fcdaa7c9b8.jpg" alt="easyPG Logo" style={{ height: '36px', borderRadius: '4px' }} />
            <h2 className="logo-text" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>easyPG</h2>
          </Link>
          <h2>Welcome Back</h2>
          <p className="text-muted">Login to manage your hostel</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form mt-8">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
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
                Forgot Password?
              </Link>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="social-divider">
            <span>Or continue with</span>
          </div>

          <button 
            type="button" 
            className="btn btn-social w-full" 
            onClick={async () => {
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: 'https://easypg-zeta.vercel.app/auth/callback',
                },
              });
              if (error) toast.error(error.message);
            }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            Continue with Google
          </button>
        </form>

        <p className="auth-footer text-center mt-6 text-muted">
          Don't have an account? <Link to="/register" className="text-gradient">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;



