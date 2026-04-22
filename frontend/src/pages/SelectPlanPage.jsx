import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Shield, Zap, ArrowLeft, Loader2, Building2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

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
            toast.success('Payment Verified!');
            
            setTimeout(() => {
                navigate('/owner/create-hostel');
            }, 2000);
        }, 3000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-8" style={{ background: 'var(--bg-secondary, #f8fafc)' }}>
            
            {/* Payment Processing Overlay */}
            {paymentStatus === 'processing' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border border-slate-200 dark:border-slate-800">
                        <Loader2 className="animate-spin text-indigo-600 mb-6" size={48} />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Processing Payment</h3>
                        <p className="text-slate-500 text-center text-sm mb-8">Securely connecting to Paytm gateway...</p>
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full text-xs font-semibold">
                            <Shield size={14} /> End-to-end Encrypted
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Success Overlay */}
            {paymentStatus === 'success' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border border-emerald-500/30">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                            <Check size={40} strokeWidth={3} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Payment Successful</h3>
                        <p className="text-slate-500 text-center text-sm">Mandate active. Redirecting to architecture builder...</p>
                    </div>
                </div>
            )}

            {/* Main Checkout Card */}
            <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-200 dark:border-slate-800 relative">
                
                {/* Back Button (Absolute) */}
                <button 
                    onClick={() => navigate('/owner/setup-basic')}
                    className="absolute top-6 left-6 z-10 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                {/* Left Side: Pitch & Value Prop (Dark/Gradient background) */}
                <div className="lg:w-5/12 p-10 lg:p-14 text-white flex flex-col justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)' }}>
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-900 opacity-20 blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                            <Building2 size={28} className="text-white" />
                        </div>
                        
                        <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
                            Unlock Your <br/>Platform.
                        </h1>
                        <p className="text-indigo-100 text-lg mb-10 leading-relaxed opacity-90">
                            Join elite property managers. Get instant access to the advanced layout builder, automated billing, and tenant management suite.
                        </p>

                        <div className="space-y-5">
                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="text-emerald-300 shrink-0 mt-0.5" size={22} />
                                <div>
                                    <h4 className="font-semibold text-white text-lg">Unlimited Architecture</h4>
                                    <p className="text-indigo-100 text-sm mt-1">Design infinite floors and rooms.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="text-emerald-300 shrink-0 mt-0.5" size={22} />
                                <div>
                                    <h4 className="font-semibold text-white text-lg">Automated Collections</h4>
                                    <p className="text-indigo-100 text-sm mt-1">Zero-hassle rent tracking & auto-pay.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="text-emerald-300 shrink-0 mt-0.5" size={22} />
                                <div>
                                    <h4 className="font-semibold text-white text-lg">24/7 Priority Support</h4>
                                    <p className="text-indigo-100 text-sm mt-1">Direct line to our engineering team.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Checkout Details */}
                <div className="lg:w-7/12 p-10 lg:p-14 flex flex-col justify-center bg-white dark:bg-slate-900">
                    <div className="max-w-md w-full mx-auto">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-widest uppercase mb-8">
                            <Zap size={12} fill="currentColor" />
                            Founder Tier
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Lifetime Setup & License</h2>
                        <p className="text-slate-500 mb-10">Transparent pricing. No hidden onboarding fees.</p>

                        {/* Cost Breakdown */}
                        <div className="space-y-6 mb-10">
                            <div className="flex justify-between items-end pb-6 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <div className="text-slate-900 dark:text-white font-semibold text-lg">Platform Configuration Fee</div>
                                    <div className="text-slate-500 text-sm mt-1">One-time payment</div>
                                </div>
                                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                    ₹20,000
                                </div>
                            </div>

                            <div className="flex justify-between items-end pb-6 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <div className="text-slate-900 dark:text-white font-semibold text-lg">Server & Maintenance</div>
                                    <div className="text-slate-500 text-sm mt-1">Automated monthly billing</div>
                                </div>
                                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                    ₹2,000<span className="text-sm text-slate-400 font-normal">/mo</span>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-2">
                                <div className="text-slate-900 dark:text-white font-bold text-xl">Due Today</div>
                                <div className="text-4xl font-black text-slate-900 dark:text-white">₹20,000</div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button 
                            onClick={handleSimulatedPayment} 
                            disabled={loading || paymentStatus !== 'idle'}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg transition-all flex justify-center items-center gap-2 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            Proceed to Secure Checkout
                        </button>

                        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-sm">
                            <Shield size={16} className="text-emerald-500" />
                            Guaranteed secure transaction via Paytm
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default SelectPlanPage;
