import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, KeyRound, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
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
            <div className="auth-container">
                <div className="auth-card glass-panel slide-up text-center">
                    <div className="icon-wrapper mb-4" style={{ margin: '0 auto', background: 'var(--success)', color: 'white' }}><CheckCircle size={28} /></div>
                    <h2 className="mb-2">All Set!</h2>
                    <p className="text-muted mb-6">
                        Your password has been reset successfully.
                    </p>
                    <Link to="/login" className="btn btn-primary w-full">
                        Login Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card glass-panel slide-up">
                <div className="auth-header flex-col items-center gap-2">
                    <Link to="/" className="flex items-center gap-2 mb-2" style={{ textDecoration: 'none' }}>
                        <img src="https://i.pinimg.com/736x/1d/31/58/1d315807fbdbf074612825fcdaa7c9b8.jpg" alt="easyPG Logo" style={{ height: '36px', borderRadius: '4px' }} />
                        <h2 className="logo-text" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>easyPG</h2>
                    </Link>
                    <div className="icon-wrapper"><Lock size={28} /></div>
                    <h2>Reset Password</h2>
                    <p className="text-muted">Enter your new secure password</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form mt-8">
                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Min. 6 characters"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Re-enter password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                        {loading ? 'Updating Password...' : 'Update Password'}
                    </button>

                    <Link to="/login" className="btn btn-secondary w-full mt-3">
                        <ArrowLeft size={18} /> Cancel
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
