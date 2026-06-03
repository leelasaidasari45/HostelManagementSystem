import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import './AuthPages.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [devResetUrl, setDevResetUrl] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/auth/forgot-password', { email });
            toast.success('Reset link generated!');
            setSent(true);

            if (res.data.resetUrl) {
                setDevResetUrl(res.data.resetUrl);
                toast('Note: Development mode. You can click the direct link below.', { icon: 'ℹ️' });
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="auth-container modern-auth-bg">
                <div className="auth-card glass-panel slide-up text-center" style={{ maxWidth: '420px', padding: '2.5rem 2rem' }}>
                    <div className="icon-wrapper mb-4" style={{ margin: '0 auto', background: 'var(--bg-elevated)', border: '1px solid var(--border-muted)' }}>
                        <Mail size={32} style={{ color: 'var(--aurora-1)' }} />
                    </div>
                    <h2 className="mb-2" style={{ fontWeight: 800 }}>Check Your Email</h2>
                    <p className="text-muted mb-6" style={{ lineHeight: 1.6 }}>
                        If an account exists for <strong>{email}</strong>, a password reset link has been sent to your inbox.
                    </p>
                    
                    {devResetUrl && (
                        <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px dashed rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-bright)', marginBottom: '0.5rem', fontWeight: 600 }}>Development Mode Link:</p>
                            <a href={devResetUrl} style={{ fontSize: '0.85rem', color: 'var(--aurora-1)', wordBreak: 'break-all' }}>{devResetUrl}</a>
                        </div>
                    )}

                    <Link to="/login" className="btn btn-secondary w-full" style={{ padding: '0.9rem' }}>
                        <ArrowLeft size={18} /> Back to Login
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
                    <h2 style={{ fontWeight: 800, fontSize: '1.75rem' }}>Forgot Password?</h2>
                    <p className="text-muted" style={{ textAlign: 'center', lineHeight: 1.5 }}>
                        Enter your email address and we'll send you a link to securely reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form mt-4">
                    <div className="form-group mb-6">
                        <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-bright)' }}>Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ height: '48px', padding: '0 1.25rem', borderRadius: '12px' }}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ height: '48px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', background: 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))', border: 'none', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.25)' }}>
                        {loading ? (
                          <span className="pulse-opacity" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Sending Link
                            <span className="pulsing-dot-container">
                              <span className="pulsing-dot"></span>
                              <span className="pulsing-dot"></span>
                              <span className="pulsing-dot"></span>
                            </span>
                          </span>
                        ) : (<><Send size={18} /> Send Reset Link</>)}
                    </button>

                    <Link to="/login" className="btn btn-secondary w-full mt-4" style={{ height: '48px', borderRadius: '12px', fontWeight: 600 }}>
                        <ArrowLeft size={18} /> Back to Login
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
