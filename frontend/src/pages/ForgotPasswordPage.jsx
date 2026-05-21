import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import './AuthPages.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/auth/forgot-password', { email });
            toast.success('Reset link generated!');
            setSent(true);

            // In dev mode, we log the link to help the user
            if (res.data.resetUrl) {
                console.log("DEV MODE RESET LINK:", res.data.resetUrl);
                toast('Note: The reset link was also printed to the console.', { icon: 'ℹ️' });
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="auth-container">
                <div className="auth-card glass-panel slide-up text-center">
                    <div className="icon-wrapper mb-4" style={{ margin: '0 auto' }}><Mail size={28} />
                        <h2 className="text-gradient">easyPG</h2></div>
                    <h2 className="mb-2">Check Your Email</h2>
                    <p className="text-muted mb-6">
                        If an account exists for <strong>{email}</strong>, a password reset link has been sent.
                    </p>
                    <Link to="/login" className="btn btn-secondary w-full">
                        <ArrowLeft size={18} /> Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card glass-panel slide-up">
                <div className="auth-header flex-col items-center gap-2">
                    <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
                        <img src="/logo.png" alt="easyPG" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
                    </Link>
                    <h2>Forgot Password?</h2>
                    <p className="text-muted">Enter your email and we'll send you a reset link</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form mt-8">
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
                        {loading ? (
                          <span className="pulse-opacity">
                            Sending Link
                            <span className="pulsing-dot-container">
                              <span className="pulsing-dot"></span>
                              <span className="pulsing-dot"></span>
                              <span className="pulsing-dot"></span>
                            </span>
                          </span>
                        ) : (<><Send size={18} /> Send Reset Link</>)}
                    </button>

                    <Link to="/login" className="btn btn-secondary w-full mt-3">
                        <ArrowLeft size={18} /> Back to Login
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
