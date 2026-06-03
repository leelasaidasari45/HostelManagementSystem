import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, KeyRound, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import './AuthPages.css';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            toast.error('Invalid or missing reset token');
            navigate('/login');
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (formData.newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            await api.post('/api/auth/reset-password', {
                token,
                newPassword: formData.newPassword
            });
            toast.success('Password updated successfully!');
            setSuccess(true);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Token expired or invalid');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-container modern-auth-bg">
                <div className="auth-card glass-panel slide-up text-center" style={{ maxWidth: '420px', padding: '2.5rem 2rem' }}>
                    <div className="icon-wrapper mb-4" style={{ margin: '0 auto', background: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        <CheckCircle size={32} style={{ color: 'white' }} />
                    </div>
                    <h2 className="mb-2" style={{ fontWeight: 800 }}>All Set!</h2>
                    <p className="text-muted mb-6" style={{ lineHeight: 1.6 }}>
                        Your password has been reset successfully. You can now use your new password to log in.
                    </p>
                    <Link to="/login" className="btn btn-primary w-full" style={{ padding: '0.9rem', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', background: 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))', border: 'none', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.25)' }}>
                        Login Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container modern-auth-bg">
            <div className="auth-card glass-panel slide-up" style={{ maxWidth: '420px', padding: '2.5rem 2rem' }}>
                <div className="auth-header flex-col items-center gap-2 mb-6">
                    <Link to="/" className="flex items-center gap-2 mb-3" style={{ textDecoration: 'none' }}>
                        <div style={{ background: 'var(--bg-elevated)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border-muted)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                            <img src="/logo.png" alt="easyPG" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
                        </div>
                    </Link>
                    <h2 style={{ fontWeight: 800, fontSize: '1.75rem' }}>Reset Password</h2>
                    <p className="text-muted" style={{ textAlign: 'center', lineHeight: 1.5 }}>
                        Create a strong, new secure password for your account.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form mt-4">
                    <div className="form-group mb-4">
                        <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-bright)' }}>New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Min. 6 characters"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            style={{ height: '48px', padding: '0 1.25rem', borderRadius: '12px' }}
                            required
                        />
                    </div>

                    <div className="form-group mb-6">
                        <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-bright)' }}>Confirm Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Re-enter password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            style={{ height: '48px', padding: '0 1.25rem', borderRadius: '12px' }}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ height: '48px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', background: 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))', border: 'none', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.25)' }}>
                        {loading ? (
                          <span className="pulse-opacity" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Updating Password
                            <span className="pulsing-dot-container">
                              <span className="pulsing-dot"></span>
                              <span className="pulsing-dot"></span>
                              <span className="pulsing-dot"></span>
                            </span>
                          </span>
                        ) : (<><KeyRound size={18} /> Update Password</>)}
                    </button>

                    <Link to="/login" className="btn btn-secondary w-full mt-4" style={{ height: '48px', borderRadius: '12px', fontWeight: 600 }}>
                        <ArrowLeft size={18} /> Cancel
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
