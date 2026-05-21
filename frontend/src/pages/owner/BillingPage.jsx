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

  // Trigger Paytm subscription checkout
  const handleUpgrade = async () => {
    setProcessing(true);
    try {
      const res = await api.post('/api/subscription/create-subscription', {
        planName: 'Pro Plan',
        amount: 999,
      });
      const { txnToken, orderId, mid, amount } = res.data;
      const PAYTM_BASE_URL = import.meta.env.VITE_PAYTM_BASE_URL || 'https://securegw-stage.paytm.in';

      const existingScript = document.getElementById('paytm-billing-script');
      if (existingScript) existingScript.remove();

      const script = document.createElement('script');
      script.id = 'paytm-billing-script';
      script.src = `${PAYTM_BASE_URL}/merchantpgpui/checkoutjs/merchants/${mid}.js`;
      script.crossOrigin = 'anonymous';
      script.type = 'application/javascript';
      script.onload = () => {
        const config = {
          root: '',
          data: { orderId, token: txnToken, tokenType: 'TXN_TOKEN', amount: String(amount) },
          website: 'WEBSTAGING',
          flow: 'SUBSCRIPTION',
          merchant: { mid, redirect: true },
          handler: {
            notifyMerchant: (n) => {
              if (n === 'APP_CLOSED') setProcessing(false);
            },
          },
        };
        if (window.Paytm?.CheckoutJS) {
          window.Paytm.CheckoutJS.onLoad(() =>
            window.Paytm.CheckoutJS.init(config)
              .then(() => window.Paytm.CheckoutJS.invoke())
              .catch(() => { toast.error('Checkout failed'); setProcessing(false); })
          );
        }
      };
      script.onerror = () => { toast.error('Failed to load payment gateway'); setProcessing(false); };
      document.body.appendChild(script);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to initiate payment');
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
  const isActive = userStatus === 'active' || userStatus === 'trial';
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
                {statusCfg.label}
              </div>
              <h2>
                {userStatus === 'trial' && 'Free Trial Active'}
                {userStatus === 'active' && 'Pro Plan Active'}
                {userStatus === 'pending' && 'Setup Incomplete'}
                {userStatus === 'cancelled' && 'Subscription Cancelled'}
                {userStatus === 'none' && 'No Active Subscription'}
              </h2>
              <p>
                {userStatus === 'trial' && `Trial ends on ${trialEnd?.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}. Auto-charges ₹999/month after.`}
                {userStatus === 'active' && `Next billing on ${latestSub?.end_date ? new Date(latestSub.end_date).toLocaleDateString('en-IN') : 'N/A'}.`}
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
                <span className="billing-metric-value" style={{ fontSize: '1.2rem' }}>₹999/mo</span>
              </div>
            </div>
          </div>

          <div className="billing-grid">

            {/* ── Plan Card ── */}
            <div className="glass-panel p-8 billing-plan-card">
              <div className="plan-header-row">
                <div className="plan-icon-circle">
                  <Crown size={22} />
                </div>
                <div>
                  <h3>Pro Plan</h3>
                  <div className="plan-price-tag">₹999<span>/month</span></div>
                </div>
              </div>

              <ul className="billing-features">
                {[
                  ['Unlimited Hostels & Rooms', TrendingUp],
                  ['Advanced Occupancy Analytics', Activity],
                  ['Automated Rent Reminders (WhatsApp)', Zap],
                  ['Priority Support', ShieldCheck],
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
                      Opening Paytm
                      <span className="pulsing-dot-container">
                        <span className="pulsing-dot"></span>
                        <span className="pulsing-dot"></span>
                        <span className="pulsing-dot"></span>
                      </span>
                    </span>
                  ) : (
                    <>
                      <Zap size={16} />
                      <span>{paymentDone ? 'Renew Subscription' : 'Setup Autopay with Paytm'}</span>
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
                Secured by Paytm · Cancel anytime
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
                          <div className="invoice-plan">{sub.plan_name || 'Pro Plan'}</div>
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

          {/* ── Trial Countdown Banner ── */}
          {userStatus === 'trial' && daysLeft <= 14 && (
            <div className="billing-trial-warning glass-panel">
              <AlertCircle size={20} style={{ color: 'var(--warning)' }} />
              <div>
                <strong>Trial ending in {daysLeft} days</strong>
                <p>After {trialEnd?.toLocaleDateString('en-IN')}, ₹999 will be auto-debited via Paytm. Ensure your linked payment method is active.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BillingPage;
