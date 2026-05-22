import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const SelectPlanPage = () => {
  const [loadingAnnual, setLoadingAnnual] = useState(false);
  const navigate = useNavigate();
  const { logoutContext, user, loginContext } = useAuth();
  const [promoTimeLeft, setPromoTimeLeft] = useState('');
  const [isPromoActive, setIsPromoActive] = useState(false);

  // Handle Paytm/Cashfree callback redirects
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

  // Calculate remaining promo time
  useEffect(() => {
    if (!user?.created_at) return;

    const calculateTimeLeft = () => {
      const regDate = new Date(user.created_at).getTime();
      const promoDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
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
  }, [user]);

  // Route to dashboard if they already have an active subscription/trial
  useEffect(() => {
    const hasActiveSub = 
      (user?.subscription_status === 'active' || user?.subscription_status === 'trial') &&
      user?.trial_end_date &&
      new Date(user.trial_end_date) > new Date();

    if (hasActiveSub) {
      navigate('/owner/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logoutContext();
  };

  const handleAnnualPro = async () => {
    setLoadingAnnual(true);
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
        setLoadingAnnual(false);
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
          loginContext({ 
            ...user, 
            payment_setup_complete: true, 
            subscription_status: 'active',
            trial_end_date: verifyRes.data.end_date
          });
          toast.success('🎉 Annual Pro activated!');
          navigate('/owner/dashboard', { replace: true });
        } else {
          toast.error('Payment done but verification failed. Contact support.');
        }
      } catch (verifyErr) {
        toast.dismiss('sub-verify');
        if (verifyErr.response?.status === 400) {
          toast('Payment may still be processing. Check dashboard in a moment.', { icon: '⏳' });
          setTimeout(() => navigate('/owner/dashboard', { replace: true }), 2000);
        } else {
          toast.error('Verification error. Contact support.');
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
      {/* Aurora Background Orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      {/* Header Nav */}
      <header className="landing-header slide-up" style={styles.headerNav}>
        <nav style={styles.landingNav}>
          <Link to="/" className="landing-logo" style={{ textDecoration: 'none' }}>
            <img src="/logo.png" alt="easyPG" style={{ height: 42, objectFit: 'contain' }} />
          </Link>

          <div style={styles.navLinks}>
            <a href="#features" style={styles.navLink}>Features</a>
            <a href="#how-it-works" style={styles.navLink}>How it Works</a>
            <a href="#pricing" style={styles.navLink}>Pricing</a>
          </div>

          <div style={styles.navActions}>
            <ThemeToggle />
            <button onClick={handleLogout} style={styles.logoutBtn}>
              <LogOut size={16} /> Log out
            </button>
          </div>
        </nav>
      </header>

      {/* Header section */}
      <div className="slide-up" style={styles.headerBlock}>
        <div style={styles.badgeContainer}>
          <Sparkles size={14} style={{ marginRight: 6, color: '#7c3aed' }} />
          <span>Premium Portal</span>
        </div>
        <h1 style={styles.title}>
          Scale your hostel business with <span style={styles.titleGradient}>Annual Pro</span>
        </h1>
        <p style={styles.subtitle}>
          Choose your plan and unlock full dashboard access with advanced features.
        </p>
      </div>

      {/* Free Trial Card First */}
      {user?.subscription_status === 'trial' && user?.trial_end_date && new Date(user.trial_end_date) > new Date() && (
        <div className="slide-up" style={styles.cardContainer}>
          <div style={{
            ...styles.proCard,
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(79, 70, 229, 0.1) 100%)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            padding: '2rem',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <div style={styles.cardAccentBar} />
            <div style={{ marginBottom: '1rem' }}>
              <Sparkles size={32} style={{ color: '#a78bfa', margin: '0 auto 0.5rem' }} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: '0 0 0.5rem 0' }}>
              Free Trial Active
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#d1d5db', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
              Your 2-day free trial is active. Experience all features of Annual Pro at no cost.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                background: 'rgba(124, 58, 237, 0.2)', 
                padding: '1rem', 
                borderRadius: 12,
                flex: '0 1 auto',
                minWidth: 100
              }}>
                <div style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600, marginBottom: 4 }}>Days Left</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>
                  {Math.max(0, Math.ceil((new Date(user.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24)))}
                </div>
              </div>
              <div style={{ 
                background: 'rgba(124, 58, 237, 0.2)', 
                padding: '1rem', 
                borderRadius: 12,
                flex: '0 1 auto',
                minWidth: 120
              }}>
                <div style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600, marginBottom: 4 }}>Expires</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                  {new Date(user.trial_end_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', margin: '0 0 1.5rem 0' }}>
              Upgrade to Annual Pro (₹40,000/year) below to extend your access beyond the trial period.
            </p>
          </div>
        </div>
      )}

      {/* Main Centered Premium Card */}
      <div className="slide-up" style={styles.cardContainer}>
        <div style={styles.proCard}>
          {/* Top Decorative Border */}
          <div style={styles.cardAccentBar} />

          {/* Premium Header */}
          <div style={styles.cardHeader}>
            <div>
              <p style={styles.planLabel}>ANNUAL SUBSCRIPTION</p>
              <h2 style={styles.planTitle}>Annual Pro Plan</h2>
            </div>
            <div style={styles.priceContainer}>
              <span style={styles.currencySymbol}>₹</span>
              <span style={styles.priceAmount}>40,000</span>
              <span style={styles.pricePeriod}>/ year</span>
            </div>
          </div>

          {/* Dynamic Promo Banner */}
          {isPromoActive ? (
            <div style={styles.promoBannerActive}>
              <div style={styles.promoIconContainer}>🔥</div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={styles.promoTitle}>Special 7-Day Registration Offer Active!</p>
                <p style={styles.promoDesc}>Pay now and get <strong>+5 Months FREE</strong> (17 months total instead of 12).</p>
              </div>
              <div style={styles.countdownBadge}>
                <Clock size={12} style={{ marginRight: 4 }} />
                <span>{promoTimeLeft}</span>
              </div>
            </div>
          ) : (
            <div style={styles.promoBannerExpired}>
              <p style={styles.promoDescExpired}>
                The 7-day registration promo has expired. Standard 12-month subscription terms apply.
              </p>
            </div>
          )}

          {/* Feature List */}
          <div style={styles.featuresSection}>
            <p style={styles.featuresTitle}>What's included in Annual Pro:</p>
            <ul style={styles.featureList}>
              {[
                { title: 'Unlimited Tenants & Rooms', desc: 'No caps on the size of your property data' },
                { title: 'Automated Rent Collections', desc: 'Collect and verify rent payments seamlessly' },
                { title: 'Complaints Management', desc: 'Allow residents to raise digital issues instantly' },
                { title: 'Real-time Analytics Dashboard', desc: 'Track occupancy, income, and defaults' },
                { title: 'Dedicated Support Representative', desc: 'Priority help whenever you need it' },
              ].map((item, index) => (
                <li key={index} style={styles.featureItem}>
                  <CheckCircle2 size={18} style={styles.checkIcon} />
                  <div>
                    <h4 style={styles.featureText}>{item.title}</h4>
                    <p style={styles.featureSubtext}>{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Call to Action Button */}
          <button
            style={styles.payBtn}
            onClick={handleAnnualPro}
            disabled={loadingAnnual}
            id="pay-annual-pro-btn"
          >
            {loadingAnnual ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="spinner" /> Initiating Secure Payment...
              </span>
            ) : (
              <>
                <span>Activate Annual Pro</span>
                <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </>
            )}
          </button>

          {/* Trust Badges */}
          <div style={styles.trustBadges}>
            <div style={styles.trustItem}>
              <ShieldCheck size={16} style={{ color: '#059669', marginRight: 4 }} />
              <span>Secured by Cashfree</span>
            </div>
            <div style={styles.separator} />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>

      <p style={styles.footerNote}>
        Need customized plans for 500+ beds? Contact corporate sales at support@easypg.in
      </p>

      <style>{`
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        #pay-annual-pro-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.35);
          filter: brightness(1.1);
        }
        #pay-annual-pro-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        #pay-annual-pro-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        a[href*="#"]:hover {
          color: #a78bfa !important;
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0d18',
    color: '#f3f4f6',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem 1.5rem 4rem',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
    filter: 'blur(100px)',
    top: -200,
    left: -200,
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)',
    filter: 'blur(100px)',
    bottom: -200,
    right: -200,
    pointerEvents: 'none',
  },
  headerNav: {
    width: '100%',
    marginBottom: '2rem',
    position: 'relative',
    zIndex: 10,
  },
  landingNav: {
    width: '100%',
    maxWidth: 1200,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '0 auto',
    padding: '0 1.5rem',
  },
  navLinks: {
    display: 'flex',
    gap: '2.5rem',
    alignItems: 'center',
  },
  navLink: {
    fontSize: '0.95rem',
    color: '#9ca3af',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s',
    '&:hover': {
      color: '#a78bfa',
    },
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  topbar: {
    width: '100%',
    maxWidth: 1000,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '3rem',
    position: 'relative',
    zIndex: 10,
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    color: '#9ca3af',
    fontSize: '0.87rem',
    padding: '0.5rem 1rem',
    borderRadius: 99,
    transition: 'all 0.2s',
  },
  headerBlock: {
    textAlign: 'center',
    marginBottom: '2rem',
    maxWidth: 650,
    position: 'relative',
    zIndex: 10,
  },
  badgeContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.35rem 0.85rem',
    background: 'rgba(124, 58, 237, 0.1)',
    border: '1px solid rgba(124, 58, 237, 0.2)',
    borderRadius: 99,
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#a78bfa',
    marginBottom: '1rem',
  },
  title: {
    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
    fontWeight: 800,
    color: '#ffffff',
    margin: '0 0 1rem 0',
    lineHeight: 1.25,
    letterSpacing: '-0.02em',
  },
  titleGradient: {
    background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#9ca3af',
    margin: 0,
    lineHeight: 1.5,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 640,
    position: 'relative',
    zIndex: 10,
  },
  proCard: {
    background: 'rgba(17, 24, 39, 0.7)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: '2.5rem',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  cardAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1.75rem',
  },
  planLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#a78bfa',
    letterSpacing: '0.1em',
    margin: '0 0 0.25rem 0',
  },
  planTitle: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#ffffff',
    margin: 0,
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
  },
  currencySymbol: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#ffffff',
    marginRight: 2,
  },
  priceAmount: {
    fontSize: '3rem',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.02em',
  },
  pricePeriod: {
    fontSize: '0.95rem',
    color: '#9ca3af',
    marginLeft: 4,
  },
  promoBannerActive: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(5, 150, 105, 0.08)',
    border: '1px solid rgba(5, 150, 105, 0.2)',
    borderRadius: 16,
    padding: '1rem 1.25rem',
    marginBottom: '2rem',
    gap: '0.75rem',
  },
  promoIconContainer: {
    fontSize: '1.5rem',
  },
  promoTitle: {
    fontSize: '0.87rem',
    fontWeight: 700,
    color: '#34d399',
    margin: '0 0 0.15rem 0',
  },
  promoDesc: {
    fontSize: '0.82rem',
    color: '#a7f3d0',
    margin: 0,
    lineHeight: 1.4,
  },
  countdownBadge: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(5, 150, 105, 0.2)',
    border: '1px solid rgba(5, 150, 105, 0.3)',
    borderRadius: 8,
    padding: '0.35rem 0.65rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#34d399',
    whiteSpace: 'nowrap',
  },
  promoBannerExpired: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: '0.85rem 1.25rem',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  promoDescExpired: {
    fontSize: '0.82rem',
    color: '#9ca3af',
    margin: 0,
  },
  featuresSection: {
    marginBottom: '2.5rem',
  },
  featuresTitle: {
    fontSize: '0.87rem',
    fontWeight: 600,
    color: '#e5e7eb',
    marginBottom: '1.25rem',
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  checkIcon: {
    color: '#7c3aed',
    flexShrink: 0,
    marginTop: 2,
  },
  featureText: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#ffffff',
    margin: '0 0 0.15rem 0',
  },
  featureSubtext: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    margin: 0,
    lineHeight: 1.4,
  },
  payBtn: {
    width: '100%',
    padding: '1.1rem 2rem',
    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
    border: 'none',
    borderRadius: 14,
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.25)',
  },
  trustBadges: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    marginTop: '1.25rem',
    fontSize: '0.78rem',
    color: '#9ca3af',
  },
  trustItem: {
    display: 'flex',
    alignItems: 'center',
  },
  separator: {
    width: 1,
    height: 12,
    background: 'rgba(255, 255, 255, 0.15)',
  },
  footerNote: {
    marginTop: '2.5rem',
    fontSize: '0.8rem',
    color: '#4b5563',
    textAlign: 'center',
    position: 'relative',
    zIndex: 10,
  },
};

export default SelectPlanPage;
