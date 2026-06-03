import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import './AuthPage.css'; // Use the main auth CSS for consistent layout

const ForgotPasswordPage = () => {
    const { isDarkMode } = useTheme();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [devResetUrl, setDevResetUrl] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !email.includes('@')) {
            toast.error("Please enter a valid email address");
            return;
        }

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
            <div className={`mobile-auth-wrapper ${!isDarkMode ? 'light' : ''}`}>
                <div className="mobile-auth-container password-entry-screen">
                    <div className="mobile-auth-hero">
                        <div className="app-circle-logo" style={{ background: 'var(--success)' }}>
                            <Mail size={24} style={{ color: 'white' }} />
                        </div>
                        <h1 className="app-super-title">Check Your Email</h1>
                        <p className="app-super-subtitle" style={{ fontSize: '.9rem', color: 'var(--text-dim)' }}>
                            A reset link has been sent to <strong style={{color: 'var(--text-bright)'}}>{email}</strong>
                        </p>
                    </div>

                    <div className="mobile-auth-form-card" style={{ marginTop: '2rem' }}>
                        {devResetUrl && (
                            <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px dashed rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-bright)', marginBottom: '0.5rem', fontWeight: 600 }}>Development Mode Link:</p>
                                <a href={devResetUrl} style={{ fontSize: '0.85rem', color: 'var(--aurora-1)', wordBreak: 'break-all' }}>{devResetUrl}</a>
                            </div>
                        )}

                        <Link to="/login" style={{ textDecoration: 'none', width: '100%' }}>
                            <button className="mobile-continue-btn">
                                <ArrowLeft size={18} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />
                                Back to Login
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`mobile-auth-wrapper ${!isDarkMode ? 'light' : ''}`}>
            <div className="mobile-auth-container password-entry-screen">
                <div className="mobile-auth-hero">
                    <div className="app-circle-logo">
                        <span>easyPG</span>
                    </div>
                    <h1 className="app-super-title">Forgot Password?</h1>
                    <p className="app-super-subtitle" style={{ fontSize: '.9rem', color: 'var(--text-dim)' }}>
                        Enter your email and we'll send a reset link
                    </p>
                </div>

                <div className="mobile-auth-form-card">
                    <label className="mobile-input-label">Email Address</label>
                    <div className="mobile-input-field">
                        <Mail size={18} className="mobile-input-icon" />
                        <input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mobile-email-input"
                        />
                    </div>

                    <button 
                        className="mobile-continue-btn"
                        disabled={loading}
                        onClick={handleSubmit}
                    >
                        {loading ? (
                          <span className="pulse-opacity">
                            Sending Link
                            <span className="pulsing-dot-container">
                              <span className="pulsing-dot"></span>
                              <span className="pulsing-dot"></span>
                              <span className="pulsing-dot"></span>
                            </span>
                          </span>
                        ) : "Send Reset Link"}
                    </button>

                    <div className="password-links" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                        <Link to="/login" className="back-link" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ArrowLeft size={16} /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
