import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, Crown, Zap, ShieldCheck, Loader2, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const SelectPlanPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const res = await api.post('/api/subscription/create-subscription');
            
            if (res.data.isMock) {
                toast.success('Subscription setup initiated! (Mock Mode)');
                // In real flow, redirect to Paytm
                // window.location.href = res.data.paytmUrl;
                
                // For now, let's pretend it worked
                setTimeout(() => {
                    navigate('/owner/dashboard');
                    toast.success('Welcome to Premium! Your dashboard is now active.');
                }, 2000);
            }
        } catch (err) {
            toast.error('Failed to initiate subscription. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ padding: '2rem' }}>
            <div className="auth-card glass-panel slide-up" style={{ maxWidth: '800px', width: '100%' }}>
                <div className="flex justify-between items-center mb-6">
                    <div className="text-xs text-muted">Awaiting Payment Setup</div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors">
                        <LogOut size={16} /> Log Out
                    </button>
                </div>
                
                <div className="text-center mb-8">
                    <div className="icon-wrapper mb-4" style={{ margin: '0 auto', background: 'var(--warning)', color: '#000' }}>
                        <Crown size={32} />
                    </div>
                    <h1 className="hero-title" style={{ fontSize: '2.5rem' }}>The Future of <span className="text-gradient">Hostel Management</span></h1>
                    <p className="text-muted mt-4">Start your 3-month free trial today. Set up Autopay now and experience effortless management.</p>
                </div>

                <div className="grid gap-8 mt-10" style={{ gridTemplateColumns: 'minmax(300px, 1fr)' }}>
                    <div className="price-card glass-panel p-8 relative overflow-hidden" style={{ border: '2px solid var(--accent-primary)', position: 'relative' }}>
                        <div className="premium-badge" style={{ position: 'absolute', top: '1rem', right: '-2rem', background: 'var(--accent-primary)', color: '#fff', padding: '0.5rem 3rem', transform: 'rotate(45deg)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            BEST VALUE
                        </div>
                        
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Premium SaaS Plan</h3>
                                <p className="text-muted">Complete automation suite</p>
                            </div>
                            <div className="text-right">
                                <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>₹999</span>
                                <span className="text-muted">/month</span>
                            </div>
                        </div>

                        <div className="trial-badge p-3 mb-8 text-center" style={{ background: 'rgba(14, 165, 233, 0.1)', borderRadius: '12px', border: '1px dashed var(--accent-primary)' }}>
                            <Zap size={16} className="inline mr-2" style={{ color: 'var(--accent-primary)' }} />
                            <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>3 MONTHS FREE TRIAL</span>
                        </div>

                        <ul className="flex flex-col gap-4 mb-8">
                            <li className="flex gap-3"><Check size={20} color="var(--accent-primary)" /> Unlimited Hostels & Rooms</li>
                            <li className="flex gap-3"><Check size={20} color="var(--accent-primary)" /> QR-Based Instant Onboarding</li>
                            <li className="flex gap-3"><Check size={20} color="var(--accent-primary)" /> Automatic Rent Reminders (WA)</li>
                            <li className="flex gap-3"><Check size={20} color="var(--accent-primary)" /> Advanced Analytics & Reports</li>
                            <li className="flex gap-3"><Check size={20} color="var(--accent-primary)" /> Complaint Management & Tracking</li>
                        </ul>

                        <button 
                            onClick={handleSubscribe} 
                            disabled={loading}
                            className="btn btn-primary w-full p-4" 
                            style={{ fontSize: '1.1rem', fontWeight: 'bold', height: 'auto' }}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Set Up Autopay with Paytm'}
                        </button>
                        
                        <p className="text-xs text-muted text-center mt-4 flex items-center justify-center gap-1">
                            <ShieldCheck size={14} /> Secured by Paytm Subscriptions. Cancel anytime.
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-muted">By setting up Autopay, you agree to our Terms of Service. No charges will be made until your 3-month trial ends.</p>
                </div>
            </div>
        </div>
    );
};

export default SelectPlanPage;
