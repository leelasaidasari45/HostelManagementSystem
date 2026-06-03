import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, KeyRound, CheckCircle, ArrowLeft, EyeOff, Eye, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import './AuthPage.css'; // Use the main auth CSS for consistent layout

const ResetPasswordPage = () => {
    const { isDarkMode } = useTheme();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({ otp: '', newPassword: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        if (!formData.otp || formData.otp.length < 6) {
            return toast.error('Please enter the 6-digit OTP from your email');
        }
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
                otp: formData.otp,
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
            <div className={`mobile-auth-wrapper ${!isDarkMode ? 'light' : ''}`}>
                <div className="mobile-auth-container password-entry-screen">
                    <div className="mobile-auth-hero">
                        <div className="app-circle-logo" style={{ background: 'var(--success)' }}>
                            <CheckCircle size={24} style={{ color: 'white' }} />
                        </div>
                        <h1 className="app-super-title">All Set!</h1>
                        <p className="app-super-subtitle" style={{ fontSize: '.9rem', color: 'var(--text-dim)' }}>
                            Your password has been reset successfully.
                        </p>
                    </div>

                    <div className="mobile-auth-form-card" style={{ marginTop: '2rem' }}>
                        <Link to="/login" style={{ textDecoration: 'none', width: '100%' }}>
                            <button className="mobile-continue-btn">
                                Login Now
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
                    <h1 className="app-super-title">Reset Password</h1>
                    <p className="app-super-subtitle" style={{ fontSize: '.9rem', color: 'var(--text-dim)' }}>
                        Enter the 6-digit code and your new password
                    </p>
                </div>

                <div className="mobile-auth-form-card">
                    <label className="mobile-input-label">6-Digit Code</label>
                    <div className="mobile-input-field" style={{ marginBottom: '1.25rem' }}>
                        <Hash size={18} className="mobile-input-icon" />
                        <input
                            type="text"
                            placeholder="Enter OTP from email"
                            value={formData.otp}
                            onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                            className="mobile-email-input"
                            maxLength={6}
                        />
                    </div>

                    <label className="mobile-input-label">New Password</label>
                    <div className="mobile-input-field" style={{ marginBottom: '1.25rem' }}>
                        <Lock size={18} className="mobile-input-icon" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Min. 6 characters"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
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

                    <label className="mobile-input-label">Confirm Password</label>
                    <div className="mobile-input-field">
                        <Lock size={18} className="mobile-input-icon" />
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Re-enter password"
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
                        onClick={handleSubmit}
                    >
                        {loading ? (
                          <span className="pulse-opacity">
                            Updating Password
                            <span className="pulsing-dot-container">
                              <span className="pulsing-dot"></span>
                              <span className="pulsing-dot"></span>
                              <span className="pulsing-dot"></span>
                            </span>
                          </span>
                        ) : "Update Password"}
                    </button>

                    <div className="password-links" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                        <Link to="/login" className="back-link" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ArrowLeft size={16} /> Cancel
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
