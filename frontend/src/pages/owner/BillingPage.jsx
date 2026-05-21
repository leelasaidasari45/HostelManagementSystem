import React, { useState, useEffect } from 'react';
import {
  CreditCard, CheckCircle2, Clock, AlertCircle,
  Sparkles, Zap, Crown, Calendar, RefreshCw, XCircle, ShieldCheck,
  TrendingUp, IndianRupee, Activity
} from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
import OwnerHeader from '../../components/owner/OwnerHeader';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import PageSkeleton from '../../components/ui/SkeletonLoader';
import './BillingPage.css';

const STATUS_CONFIG = {
  active:    { label: 'Active',     color: 'var(--success, #34d399)', bg: 'rgba(52,211,153,0.12)' },
  trial:     { label: 'Free Trial', color: '#38bdf8',                 bg: 'rgba(56,189,248,0.12)' },
  pending:   { label: 'Pending',    color: 'var(--warning, #fbbf24)', bg: 'rgba(251,191,36,0.12)' },
  cancelled: { label: 'Cancelled',  color: 'var(--error, #f87171)',   bg: 'rgba(248,113,113,0.12)' },
  failed:    { label: 'Failed',     color: 'var(--error, #f87171)',   bg: 'rgba(248,113,113,0.12)' },
  none:      { label: 'No Plan',    color: 'var(--text-ghost)',        bg: 'var(--bg-elevated)' },
};

const BillingPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [promoTimeLeft, setPromoTimeLeft] = useState('');
  const [isPromoActive, setIsPromoActive] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/api/subscription/status');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch subscription status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      toast.success('🎉 Subscription activated! Welcome to Pro!');
      window.history.replaceState({}, '', '/owner/billing');
    }
  }, []);

  // Calculate remaining promo time
  useEffect(() => {
    if (!data?.created_at) return;

    const calculateTimeLeft = () => {
      const regDate = new Date(data.created_at).getTime();
      const promoDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
      const expiryTime = regDate + promoDuration;
      const now = Date.now();
      const difference = expiryTime - now;

      if (difference <= 0) {
        setIsPromoActive(false);
        setPromoTimeLeft('Expired');
        return;
      }

      setIsPromoActive(true);
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      if (days > 0) {
        setPromoTimeLeft(`${days}d ${hours}h left`);
      } else {
        setPromoTimeLeft(`${hours}h ${minutes}m left`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [data]);

  // Upgrade using Cashfree
  const handleUpgrade = async () => {
    setProcessing(true);
    try {
      // Step 1: Create Cashfree order for ₹40,000
      const res = await api.post('/api/cashfree/create-order', {
        amount: 40000,
        month: 'Annual',
        year: new Date().getFullYear(),
        type: 'subscription',
      });
      const { payment_session_id, order_id, environment } = res.data;

      // Step 2: Load Cashfree SDK
      const CF_MODE = environment || 'production';
      const loadSDK = () => new Promise((resolve, reject) => {
        if (window.Cashfree) { resolve(window.Cashfree); return; }
        const s = document.createElement('script');
        s.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        s.onload = () => resolve(window.Cashfree);
        s.onerror = () => reject(new Error('Failed to load Cashfree'));
        document.body.appendChild(s);
      });
      await loadSDK();
      const cashfree = await window.Cashfree({ mode: CF_MODE });

      // Step 3: Launch Cashfree drop-in checkout
      const result = await cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: '_modal',
      });

      const userCancelled = result?.error?.code === 'PAYMENT_CANCELLED_BY_USER' ||
                            result?.error?.type === 'user_cancelled';
      if (userCancelled) {
        toast('Payment cancelled.', { icon: 'ℹ️' });
        setProcessing(false);
        return;
      }

      toast.loading('Verifying payment...', { id: 'sub-verify' });
      try {
        const verifyRes = await api.post('/api/subscription/verify-cashfree', {
          order_id,
          amount: 40000,
          plan_name: 'Annual Pro',
        });
        toast.dismiss('sub-verify');
        if (verifyRes.data.success) {
          toast.success('🎉 Annual Pro activated!');
          fetchStatus();
        } else {
          toast.error('Payment done but verification failed. Contact support.');
        }
      } catch (verifyErr) {
        toast.dismiss('sub-verify');
        if (verifyErr.response?.status === 400) {
          toast('Payment may still be processing. Refreshing...', { icon: '⏳' });
          setTimeout(() => fetchStatus(), 2000);
        } else {
          toast.error('Verification error. Contact support.');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access at the end of your billing period.')) return;
    try {
      await api.post('/api/subscription/cancel');
      toast.success('Subscription cancelled.');
      fetchStatus();
    } catch {
      toast.error('Failed to cancel subscription.');
    }
  };

  if (loading) return (
    <div className="dashboard-layout">
      <OwnerSidebar />
      <main className="dashboard-content fade-in">
        <OwnerHeader title="Billing & Plans" subtitle="Manage your subscription" />
        <PageSkeleton type="billing" />
      </main>
    </div>
  );

  const userStatus = data?.user_status || 'none';
  const paymentDone = data?.payment_setup_complete || false;
  const trialEnd = data?.trial_end_date ? new Date(data.trial_end_date) : null;
  const daysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd - new Date()) / (1000 * 60 * 60 * 24))) : 0;
  const isActive = (userStatus === 'active' || userStatus === 'trial') && trialEnd && trialEnd > new Date();
  const latestSub = data?.latest;
  const history = data?.history || [];
  const statusCfg = STATUS_CONFIG[userStatus] || STATUS_CONFIG.none;

  return (
    <div className="dashboard-layout">
      <OwnerSidebar />
      <main className="dashboard-content fade-in">
        <OwnerHeader title="Billing & Subscription" subtitle="Manage your easyPG Pro plan" />

        <div className="billing-container slide-up">

          {/* ── Status Hero Card ── */}
          <div className={`billing-hero-card ${isActive ? 'is-active' : 'is-inactive'}`}>
            <div className="billing-hero-left">
              <div className="billing-status-badge" style={{ background: statusCfg.bg, color: statusCfg.color }}>
                {isActive ? <Sparkles size={14} /> : <Clock size={14} />}
                {isActive ? statusCfg.label : 'Expired'}
              </div>
              <h2>
                {userStatus === 'trial' && isActive && 'Free Trial Active'}
                {userStatus === 'trial' && !isActive && 'Free Trial Expired'}
                {userStatus === 'active' && isActive && 'Pro Plan Active'}
                {userStatus === 'active' && !isActive && 'Pro Plan Expired'}
                {userStatus === 'pending' && 'Setup Incomplete'}
                {userStatus === 'cancelled' && 'Subscription Cancelled'}
                {userStatus === 'none' && 'No Active Subscription'}
              </h2>
              <p>
                {userStatus === 'trial' && isActive && `Trial ends on ${trialEnd?.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}. Subscribe to standard easyPG Annual Pro to retain access.`}
                {userStatus === 'trial' && !isActive && `Trial ended on ${trialEnd?.toLocaleDateString('en-IN')}. Please pay ₹40,000/year to reactivate dashboard access.`}
                {userStatus === 'active' && isActive && `Subscription active until ${trialEnd?.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`}
                {userStatus === 'active' && !isActive && `Subscription expired on ${trialEnd?.toLocaleDateString('en-IN')}. Please renew to reactivate dashboard access.`}
                {userStatus === 'pending' && 'Complete payment setup to activate your account.'}
                {(userStatus === 'cancelled' || userStatus === 'none') && 'Resubscribe to unlock full hostel management features.'}
              </p>
            </div>
            <div className="billing-hero-metrics">
              {isActive && (
                <div className="billing-metric">
                  <span className="billing-metric-label">Days Remaining</span>
                  <span className="billing-metric-value">{daysLeft}</span>
                </div>
              )}
              <div className="billing-metric">
                <span className="billing-metric-label">Plan</span>
                <span className="billing-metric-value" style={{ fontSize: '1.2rem' }}>₹40,000/yr</span>
              </div>
            </div>
          </div>

          {/* ── Dynamic Promo Banner ── */}
          {isPromoActive && !paymentDone && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(52, 211, 153, 0.08)',
              border: '1px solid rgba(52, 211, 153, 0.2)',
              borderRadius: 16,
              padding: '1.25rem 1.5rem',
              gap: '1rem',
              position: 'relative'
            }}>
              <span style={{ fontSize: '1.75rem' }}>🔥</span>
              <div style={{ flex: 1 }}>
                <strong style={{ color: '#34d399', fontSize: '0.95rem', display: 'block', marginBottom: '0.2rem' }}>
                  7-Day Registration Offer Active!
                </strong>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                  Upgrade within 7 days and get <strong>+5 Months FREE</strong> (17 months total instead of 12).
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(52, 211, 153, 0.2)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                borderRadius: 8,
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#34d399',
                whiteSpace: 'nowrap'
              }}>
                <Clock size={12} style={{ marginRight: 4 }} />
                <span>{promoTimeLeft}</span>
              </div>
            </div>
          )}

          <div className="billing-grid">

            {/* ── Plan Card ── */}
            <div className="glass-panel p-8 billing-plan-card">
              <div className="plan-header-row">
                <div className="plan-icon-circle">
                  <Crown size={22} />
                </div>
                <div>
                  <h3>Annual Pro Plan</h3>
                  <div className="plan-price-tag">₹40,000<span>/year</span></div>
                </div>
              </div>

              <ul className="billing-features">
                {[
                  ['Unlimited Hostels & Rooms', TrendingUp],
                  ['Advanced Occupancy Analytics', Activity],
                  ['Automated Rent Collections', Zap],
                  ['Priority Support & Account Manager', ShieldCheck],
                  ['Custom Notice Board', Calendar],
                  ['Complaint Management & Tracking', CheckCircle2],
                ].map(([feat, Icon], i) => (
                  <li key={i}>
                    <Icon size={16} className="feat-icon" />
                    {feat}
                  </li>
                ))}
              </ul>

              {!isActive && (
                <button
                  className="btn btn-primary btn-lg w-full mt-6"
                  onClick={handleUpgrade}
                  disabled={processing}
                  id="upgrade-btn"
                >
                  {processing ? (
                    <span className="pulse-opacity">
                      Opening Cashfree Checkout...
                    </span>
                  ) : (
                    <>
                      <Zap size={16} />
                      <span>{paymentDone ? 'Renew Subscription' : 'Upgrade to Annual Pro'}</span>
                    </>
                  )}
                </button>
              )}

              {isActive && (
                <button
                  className="btn btn-danger w-full mt-6"
                  onClick={handleCancel}
                  id="cancel-sub-btn"
                  style={{ background: 'transparent', border: '1px solid var(--error, #f87171)', color: 'var(--error, #f87171)' }}
                >
                  <XCircle size={16} /> Cancel Subscription
                </button>
              )}

              <p className="billing-secure-note">
                <ShieldCheck size={12} />
                Secured by Cashfree · Cancel anytime
              </p>
            </div>

            {/* ── Payment History ── */}
            <div className="glass-panel p-8">
              <div className="billing-section-header">
                <CreditCard size={18} style={{ color: 'var(--aurora-1)' }} />
                <h3>Payment History</h3>
                <button className="icon-btn-sm" onClick={fetchStatus} title="Refresh">
                  <RefreshCw size={14} />
                </button>
              </div>

              {history.length > 0 ? (
                <div className="billing-invoice-list">
                  {history.map((sub) => {
                    const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.none;
                    return (
                      <div key={sub.id} className="billing-invoice-item">
                        <div className="invoice-left">
                          <div className="invoice-plan">{sub.plan_name || 'Annual Pro'}</div>
                          <div className="invoice-date">
                            {new Date(sub.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                          {sub.order_id && (
                            <div className="invoice-ref">#{sub.order_id.slice(0, 20)}</div>
                          )}
                        </div>
                        <div className="invoice-right">
                          <span className="invoice-amount">
                            <IndianRupee size={13} />
                            {parseFloat(sub.amount).toLocaleString('en-IN')}
                          </span>
                          <span
                            className="invoice-status-pill"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="billing-empty">
                  <AlertCircle size={32} />
                  <p>No payment history yet.</p>
                  <p style={{ fontSize: '.82rem', color: 'var(--text-ghost)' }}>
                    Your subscription transactions will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BillingPage;
