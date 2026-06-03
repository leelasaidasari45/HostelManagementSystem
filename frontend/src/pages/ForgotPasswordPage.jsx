import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import './AuthPage.css'; // Use the main auth CSS for consistent layout

const ForgotPasswordPage = () => {
    const { isDarkMode } = useTheme();
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

            // Redirect to ResetPasswordPage with the token
            navigate(`/reset-password?token=${res.data.resetToken}`);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`mobile-auth-wrapper ${!isDarkMode ? 'light' : ''}`}>
            <div className="mobile-auth-container password-entry-screen">
                <div className="mobile-auth-hero">
                    <div className="app-circle-logo">
                        <span>easyPG</span>
                    </div>
                    <h1 className="app-super-title">Forgot Password?</h1>
                    <p className="app-super-subtitle" style={{ fontSize: '.9rem', color: 'var(--text-dim)' }}>
                        Enter your email and we'll send a 6-digit OTP
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
                            Sending OTP
                            <span className="pulsing-dot-container">
                              <span className="pulsing-dot"></span>
                              <span className="pulsing-dot"></span>
                              <span className="pulsing-dot"></span>
                            </span>
                          </span>
                        ) : "Send Reset OTP"}
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
