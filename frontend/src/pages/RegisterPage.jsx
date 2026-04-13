import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import './AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginContext } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords don't match");
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // Auto-login after registration
      loginContext(res.data);
      toast.success('Account created successfully!');
      navigate('/select-role');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed';
      toast.error(errorMsg);
      console.error('Registration error details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://easypg-zeta.vercel.app/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err.message || 'Google login failed');
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
          <h2>Create Account</h2>
          <p className="text-muted">Join easyPG today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form mt-6">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
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

          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm</label>
              <input
                type="password"
                className="form-control"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
            {loading ? 'Registering...' : 'Register'}
          </button>

        </form>

        <p className="auth-footer text-center mt-6 text-muted">
          Already have an account? <Link to="/login" className="text-gradient">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
