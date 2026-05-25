import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, ArrowRight } from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, go straight to dashboard
    if (sessionStorage.getItem('admin_token')) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    try {
      const res = await api.post('/api/admin/login', { password });
      if (res.data.success && res.data.token) {
        sessionStorage.setItem('admin_token', res.data.token);
        toast.success('Access Granted. Welcome Admin.');
        navigate('/admin', { replace: true });
      } else {
        toast.error('Incorrect Passcode');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Orbs */}
      <div className="orb orb-1" style={{ top: '-10%', left: '-10%' }} />
      <div className="orb orb-2" style={{ bottom: '-10%', right: '-10%' }} />

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-muted)',
        borderRadius: 28,
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: 400,
        padding: '2.5rem 2rem',
        textAlign: 'center',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        animation: 'scaleUpAdmin 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        <div>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ef4444', margin: '0 auto 1rem'
          }}>
            <ShieldAlert size={28} />
          </div>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.6rem', fontWeight: 700, margin: 0,
            color: 'var(--text-bright)'
          }}>Admin Portal</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
            Please enter your administrator passcode to proceed.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
            <label style={{
              fontSize: '0.72rem', color: 'var(--text-ghost)',
              textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em'
            }}>Admin Passcode</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-ghost)' }} />
              <input
                type="password"
                required
                className="form-control"
                style={{
                  width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
                  borderRadius: 12, color: 'var(--text-bright)', outline: 'none',
                  fontSize: '0.95rem'
                }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-gradient-submit"
            style={{
              width: '100%', background: 'linear-gradient(135deg, var(--aurora-1) 0%, var(--aurora-2) 100%)',
              color: '#fff', border: 'none', borderRadius: 12, padding: '0.85rem',
              fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(124, 58, 237, 0.2)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <span>{loading ? 'Authenticating...' : 'Unlock Portal'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes scaleUpAdmin {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
