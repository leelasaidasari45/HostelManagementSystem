import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Shield, Zap, BarChart3, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import './AuthPage.css';

const ForgotPasswordPage = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !email.includes('@')) {
            toast.error("Please enter a valid email address");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/api/auth/forgot-password', { email });
            toast.success('OTP sent to your email!');
            if (res.data.devOtp) {
                toast(`Note: Development OTP is ${res.data.devOtp}`, { icon: 'ℹ️', duration: 10000 });
            }
            navigate(`/reset-password?token=${res.data.resetToken}`);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`auth-page-v2 ${!isDarkMode ? 'light' : ''}`}>
            {/* Theme Toggle */}
            <button
                className="theme-btn"
                onClick={toggleTheme}
                type="button"
                title="Toggle theme"
                style={{ position: 'absolute', top: '2rem', right: '2.5rem', zIndex: 100 }}
            >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="auth-wrapper">
                <div className="auth-container-v2">

                    {/* Left Decorative Section */}
                    <div className="auth-decoration">
                        <div className="decoration-card">
                            <div className="decoration-badge">
                                <span className="decoration-badge-dot"></span>
                                Trusted by 500+ Hostel Owners
                            </div>
                            <div className="decoration-header">
                                <h2>Secure &<br/>Hassle-free.</h2>
                                <p>Reset your password safely. Your account security is our top priority.</p>
                            </div>
                            <div className="decoration-features">
                                <div className="feature-item">
                                    <div className="feature-check"><Zap size={18} /></div>
                                    <div>
                                        <h4>Quick Recovery</h4>
                                        <p>Get a 6-digit OTP in seconds directly to your email.</p>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-check"><Shield size={18} /></div>
                                    <div>
                                        <h4>Bank-Grade Security</h4>
                                        <p>End-to-end encryption for all your sensitive data.</p>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-check"><BarChart3 size={18} /></div>
                                    <div>
                                        <h4>Real-Time Analytics</h4>
                                        <p>Powerful dashboards to track occupancy and revenue.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="deco-stats">
                                <div className="deco-stat">
                                    <span className="deco-stat-value">500+</span>
                                    <span className="deco-stat-label">Hostels</span>
                                </div>
                                <div className="deco-stat">
                                    <span className="deco-stat-value">10K+</span>
                                    <span className="deco-stat-label">Tenants</span>
                                </div>
                                <div className="deco-stat">
                                    <span className="deco-stat-value">99.9%</span>
                                    <span className="deco-stat-label">Uptime</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Form Section */}
                    <div className="auth-form-section">
                        <div className="form-container">
                            <div className="form-header">
                                <h1>Forgot Password? 🔐</h1>
                                <p>Enter your email and we'll send a 6-digit OTP</p>
                            </div>

                            <form className="auth-form-v2" onSubmit={handleSubmit}>
                                <div className="form-group-v2">
                                    <label>Email Address</label>
                                    <div className="input-field">
                                        <Mail size={18} />
                                        <input
                                            type="email"
                                            placeholder="name@company.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="pulse-opacity">
                                            Sending OTP
                                            <span className="pulsing-dot-container">
                                                <span className="pulsing-dot"></span>
                                                <span className="pulsing-dot"></span>
                                                <span className="pulsing-dot"></span>
                                            </span>
                                        </span>
                                    ) : '→ Send Reset OTP'}
                                </button>
                            </form>

                            <p className="form-footer">
                                <Link to="/login" className="link-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                                    <ArrowLeft size={14} /> Back to Login
                                </Link>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
