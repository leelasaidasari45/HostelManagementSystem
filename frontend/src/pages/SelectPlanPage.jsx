import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, LogOut, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const PAYTM_BASE_URL = import.meta.env.VITE_PAYTM_BASE_URL || 'https://securegw-stage.paytm.in';

const SelectPlanPage = () => {
  const [loadingTrial, setLoadingTrial]   = useState(false);
  const [loadingAnnual, setLoadingAnnual] = useState(false);
  const navigate   = useNavigate();
  const { logoutContext, user, loginContext } = useAuth();

  // Handle Paytm callback redirect params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('status');
    if (s === 'failed') {
      toast.error('Payment failed. Please try again.');
      window.history.replaceState({}, '', '/select-plan');
    } else if (s === 'error') {
      toast.error('Payment error. Please retry.');
      window.history.replaceState({}, '', '/select-plan');
    }
  }, []);

  // Only skip plan page if owner has an ACTIVE subscription (not just flag=true from old trial bypass)
  useEffect(() => {
    if (
      user?.payment_setup_complete &&
      (user?.subscription_status === 'active' || user?.subscription_status === 'trial')
    ) {
      navigate('/owner/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logoutContext();
  };

  // ── Free Trial: 7 days, no payment ──────────────────────
  const handleFreeTrial = async () => {
    setLoadingTrial(true);
    try {
      await api.post('/api/subscription/start-trial');
      // Update local user cache so ProtectedRoute lets them through
      loginContext({ ...user, payment_setup_complete: true, subscription_status: 'trial' });
      toast.success('🎉 7-day free trial activated!');
      navigate('/owner/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start trial');
    } finally {
      setLoadingTrial(false);
    }
  };

  // ── Annual Pro: ₹40,000/year via Cashfree ───────────────
  const handleAnnualPro = async () => {
    setLoadingAnnual(true);
    try {
      // Step 1: Create Cashfree order for subscription
      const res = await api.post('/api/cashfree/create-order', {
        amount: 40000,
        month: 'Annual',
        year: new Date().getFullYear(),
        type: 'subscription',
      });
      const { payment_session_id, order_id, environment } = res.data;

      // Step 2: Load Cashfree SDK — use environment FROM backend response (not frontend env var)
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

      if (result.error) {
        toast.error(result.error.message || 'Payment failed');
        setLoadingAnnual(false);
        return;
      }

      if (result.paymentDetails?.paymentStatus === 'SUCCESS' || result.redirect) {
        toast.loading('Activating your subscription...', { id: 'sub-verify' });
        // Step 4: Verify + activate subscription on backend
        const verifyRes = await api.post('/api/subscription/verify-cashfree', {
          order_id,
          amount: 40000,
          plan_name: 'Annual Pro',
        });
        toast.dismiss('sub-verify');
        if (verifyRes.data.success) {
          loginContext({ ...user, payment_setup_complete: true, subscription_status: 'active' });
          toast.success('🎉 Annual Pro activated!');
          navigate('/owner/dashboard', { replace: true });
        } else {
          toast.error('Verification failed. Contact support.');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setLoadingAnnual(false);
    }
  };


  return (
    <div style={styles.page}>
      {/* Top bar */}
      <div style={styles.topbar}>
        <img src="/logo.png" alt="easyPG" style={{ height: 36, objectFit: 'contain' }} />
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={14} /> Log out
        </button>
      </div>

      {/* Title */}
      <div style={styles.titleBlock}>
        <h1 style={styles.title}>
          Simple{' '}
          <span style={styles.titleGradient}>Pricing</span>
        </h1>
      </div>

      {/* Cards */}
      <div style={styles.cardsRow}>

        {/* ── Free Trial Card ── */}
        <div style={styles.freeCard}>
          <p style={styles.planLabel}>Free Trial</p>
          <div style={styles.freePrice}>
            Free <span style={styles.freeDays}>/ 7 days</span>
          </div>
          <p style={styles.planDesc}>
            Experience the full power of easyPG risk-free for a week.
          </p>

          <ul style={styles.featureList}>
            {[
              'Unlimited Tenants',
              'Multi-Property Management',
              'Full Analytics Access',
              'Community Support',
            ].map((f) => (
              <li key={f} style={styles.featureItem}>
                <span style={styles.check}>✓</span> {f}
              </li>
            ))}
          </ul>

          <button
            style={styles.trialBtn}
            onClick={handleFreeTrial}
            disabled={loadingTrial}
            id="start-trial-btn"
          >
            {loadingTrial
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Activating...</>
              : <>Start 7-Day Trial <ArrowRight size={15} /></>
            }
          </button>
        </div>

        {/* ── Annual Pro Card ── */}
        <div style={styles.proCard}>
          {/* Special offer badge */}
          <div style={styles.specialBadge}>SPECIAL OFFER</div>

          <p style={styles.planLabelPro}>Annual Pro</p>
          <div style={styles.proPrice}>
            ₹40,000 <span style={styles.proYear}>/ year</span>
          </div>

          {/* Promo banner */}
          <div style={styles.promoBanner}>
            🔥 Subscribe within 7 days and get <strong>+5 Months FREE!</strong>
          </div>

          <p style={styles.planDescPro}>
            Complete hostel management solution.{' '}
            Best value for serious owners.
          </p>

          <ul style={styles.featureList}>
            {[
              'Everything in Free Trial',
              'Automated Rent Collection',
              'Dedicated Account Manager',
              'Priority 24/7 Support',
            ].map((f) => (
              <li key={f} style={styles.featureItem}>
                <span style={styles.checkPro}>✓</span> {f}
              </li>
            ))}
          </ul>

          <button
            style={styles.proBtn}
            onClick={handleAnnualPro}
            disabled={loadingAnnual}
            id="get-annual-pro-btn"
          >
            {loadingAnnual
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Opening Paytm...</>
              : <><u>Get Annual Pro</u> <ArrowRight size={15} /></>
            }
          </button>
        </div>
      </div>

      <p style={styles.footerNote}>
        No hidden charges. Cancel anytime. Secured by Paytm.
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        #start-trial-btn:hover:not(:disabled) {
          background: #e5e7eb !important;
          transform: translateY(-1px);
        }
        #get-annual-pro-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        #start-trial-btn, #get-annual-pro-btn {
          transition: all 180ms ease;
        }
      `}</style>
    </div>
  );
};

/* ─── Inline styles to exactly match the image design ─── */
const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8f9ff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem 1.5rem 4rem',
    fontFamily: "'Inter', 'Space Grotesk', system-ui, sans-serif",
  },
  topbar: {
    width: '100%',
    maxWidth: 900,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2.5rem',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    fontSize: '0.85rem',
  },
  titleBlock: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  title: {
    fontSize: 'clamp(2rem, 5vw, 2.75rem)',
    fontWeight: 700,
    color: '#111827',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  titleGradient: {
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  cardsRow: {
    display: 'flex',
    gap: '1.5rem',
    width: '100%',
    maxWidth: 860,
    alignItems: 'stretch',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  /* ── Free Trial card ── */
  freeCard: {
    flex: '1 1 340px',
    maxWidth: 400,
    background: '#ffffff',
    border: '1.5px solid #e5e7eb',
    borderRadius: 20,
    padding: '2.25rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  },
  planLabel: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  },
  freePrice: {
    fontSize: '2.8rem',
    fontWeight: 800,
    color: '#111827',
    lineHeight: 1.1,
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.4rem',
  },
  freeDays: {
    fontSize: '1rem',
    fontWeight: 400,
    color: '#6b7280',
  },
  planDesc: {
    fontSize: '0.88rem',
    color: '#6b7280',
    margin: 0,
    lineHeight: 1.6,
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: '0.25rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    flex: 1,
  },
  featureItem: {
    fontSize: '0.88rem',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  check: {
    color: '#374151',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  trialBtn: {
    marginTop: '0.5rem',
    width: '100%',
    padding: '0.9rem 1.5rem',
    background: '#f3f4f6',
    border: '1.5px solid #e5e7eb',
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },

  /* ── Annual Pro card ── */
  proCard: {
    flex: '1 1 340px',
    maxWidth: 400,
    background: 'linear-gradient(145deg, #f0f0ff 0%, #ebe8ff 100%)',
    border: '1.5px solid #d8d4ff',
    borderRadius: 20,
    padding: '2.25rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
    position: 'relative',
    boxShadow: '0 4px 20px rgba(124,58,237,0.12)',
  },
  specialBadge: {
    position: 'absolute',
    top: -16,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    color: '#fff',
    fontSize: '0.72rem',
    fontWeight: 800,
    letterSpacing: '0.1em',
    padding: '0.35rem 1.1rem',
    borderRadius: 99,
    whiteSpace: 'nowrap',
  },
  planLabelPro: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  },
  proPrice: {
    fontSize: '2.8rem',
    fontWeight: 800,
    color: '#111827',
    lineHeight: 1.1,
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.4rem',
  },
  proYear: {
    fontSize: '1rem',
    fontWeight: 400,
    color: '#6b7280',
  },
  promoBanner: {
    padding: '0.65rem 1rem',
    background: 'rgba(52, 211, 153, 0.15)',
    border: '1.5px solid rgba(52,211,153,0.4)',
    borderRadius: 10,
    fontSize: '0.85rem',
    color: '#065f46',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  planDescPro: {
    fontSize: '0.88rem',
    color: '#4b5563',
    margin: 0,
    lineHeight: 1.6,
  },
  checkPro: {
    color: '#374151',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  proBtn: {
    marginTop: '0.5rem',
    width: '100%',
    padding: '0.9rem 1.5rem',
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
  },
  footerNote: {
    marginTop: '2rem',
    fontSize: '0.78rem',
    color: '#9ca3af',
    textAlign: 'center',
  },
};

export default SelectPlanPage;
