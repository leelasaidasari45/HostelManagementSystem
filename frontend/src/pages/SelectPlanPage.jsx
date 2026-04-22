import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, ShieldCheck, ArrowLeft, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import OwnerSidebar from '../components/owner/OwnerSidebar';
import OwnerHeader from '../components/owner/OwnerHeader';
import './owner/OwnerDashboard.css';

const SelectPlanPage = () => {
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('idle');
    const navigate = useNavigate();

    useEffect(() => {
        const pendingSetup = sessionStorage.getItem('pendingHostelSetup');
        if (!pendingSetup) {
            navigate('/owner/dashboard', { replace: true });
        }
    }, [navigate]);

    const handleSimulatedPayment = () => {
        setLoading(true);
        setPaymentStatus('processing');

        setTimeout(() => {
            setPaymentStatus('success');
            setLoading(false);
            toast.success('Payment & Auto-Pay Setup Successful!');
            
            setTimeout(() => {
                navigate('/owner/create-hostel');
            }, 2000);
        }, 3000);
    };

    return (
        <div className="dashboard-layout">
            <OwnerSidebar />

            <main className="dashboard-content fade-in" style={{ padding: '2rem' }}>
                <OwnerHeader 
                    title="Setup New Property" 
                    subtitle="Step 2 of 3: Billing & Activation" 
                />

                {/* Simulated Payment Modals */}
                {paymentStatus === 'processing' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                        <div className="glass-panel p-8 text-center flex flex-col items-center slide-up" style={{ width: '400px', background: 'var(--bg-primary)' }}>
                            <div className="mb-6 relative">
                                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                                <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500" size={20} />
                            </div>
                            <h3 className="mb-2 text-[var(--text-primary)]">Connecting to Bank...</h3>
                            <p className="text-muted text-sm mb-6">Please do not close or refresh this window.</p>
                            <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-full">
                                <ShieldCheck size={14} /> Secured by Paytm Gateway
                            </div>
                        </div>
                    </div>
                )}

                {paymentStatus === 'success' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                        <div className="glass-panel p-8 text-center flex flex-col items-center slide-up" style={{ width: '400px', border: '1px solid var(--success)', background: 'var(--bg-primary)' }}>
                            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check size={32} />
                            </div>
                            <h2 className="mb-2 text-emerald-500">Payment Verified</h2>
                            <p className="text-muted text-sm">Mandate registered successfully. Redirecting you to property builder...</p>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-col items-center max-w-2xl mx-auto mt-8 relative">
                    <button 
                        onClick={() => navigate('/owner/setup-basic')}
                        className="flex items-center gap-2 text-muted hover-text-primary transition-colors mb-6 self-start absolute -left-4 md:-left-20 top-2"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={16} /> Back
                    </button>

                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="flex items-center justify-center rounded-2xl" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', width: '64px', height: '64px' }}>
                                <Crown size={32} />
                            </div>
                        </div>
                        <h1 className="hero-title mb-2" style={{ fontSize: '2.5rem', color: 'var(--text-primary)' }}>Activate <span className="text-gradient">License</span></h1>
                        <p className="text-muted text-lg">Secure your platform access to unlock the architecture builder.</p>
                    </div>

                    {/* Pricing Card - Redesigned to be bulletproof in Light/Dark mode */}
                    <div className="w-full slide-up" style={{ 
                        background: 'var(--bg-primary)',
                        border: '2px solid var(--accent-primary)',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(99, 102, 241, 0.1)'
                    }}>
                        {/* Card Header Section */}
                        <div className="p-8 pb-6 border-b border-glass relative">
                            <div className="flex items-center gap-3 mb-4">
                                <span style={{ background: 'var(--accent-primary)', color: 'white', padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                                    FOUNDER TIER
                                </span>
                            </div>
                            
                            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                SaaS Licensing & Setup
                            </h3>
                            <p className="text-muted text-sm mb-6">Full suite access + automated maintenance billing.</p>
                            
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-2">
                                    <span style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: '1' }}>₹20k</span>
                                    <span className="text-muted font-medium text-sm">one-time</span>
                                </div>
                                <div style={{ color: 'var(--accent-primary)', fontWeight: '700', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                                    + ₹2,000 / month Auto-Pay
                                </div>
                            </div>
                        </div>

                        {/* Card Action Section */}
                        <div className="p-8" style={{ background: 'var(--bg-secondary)' }}>
                            <ul className="flex flex-col gap-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 flex-shrink-0" style={{ color: 'var(--accent-primary)' }}>
                                        <Check size={20} />
                                    </div>
                                    <div>
                                        <strong style={{ color: 'var(--text-primary)' }}>₹20,000</strong>
                                        <span className="text-muted ml-1 text-sm">platform configuration and lifetime deployment fee.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 flex-shrink-0" style={{ color: 'var(--accent-primary)' }}>
                                        <Check size={20} />
                                    </div>
                                    <div>
                                        <strong style={{ color: 'var(--text-primary)' }}>₹2,000</strong>
                                        <span className="text-muted ml-1 text-sm">monthly automated maintenance and server charges.</span>
                                    </div>
                                </li>
                            </ul>

                            <button 
                                onClick={handleSimulatedPayment} 
                                disabled={loading || paymentStatus !== 'idle'}
                                className="w-full py-4 rounded-xl flex justify-center items-center gap-2 transition-all" 
                                style={{ 
                                    background: 'var(--accent-primary)', 
                                    color: 'white', 
                                    fontSize: '1.1rem', 
                                    fontWeight: 'bold',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
                                }}
                            >
                                Pay & Register Mandate via Paytm
                            </button>
                            
                            <p className="text-xs text-center mt-5 flex items-center justify-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                                <ShieldCheck size={16} /> End-to-end encrypted by Paytm
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SelectPlanPage;
