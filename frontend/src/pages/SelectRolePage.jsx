import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Users, LogOut, CheckCircle2, ShieldCheck, PieChart, BellRing, Wallet, Sparkles, ArrowRight, Home, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import api from '../api';
import toast from 'react-hot-toast';

/* ─── Premium Feature Item ─── */
const FeatureItem = ({ icon: Icon, text, color }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    color: 'var(--text-dim)',
    fontSize: '0.85rem',
    fontWeight: 500,
  }}>
    <div style={{
      width: 24, height: 24, borderRadius: '50%',
      background: `rgba(${color}, 0.1)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: `rgb(${color})`
    }}>
      <Icon size={12} />
    </div>
    {text}
  </div>
);

/* ─── Main Component ─── */
const SelectRolePage = () => {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const { loginContext, user, logoutContext } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutContext();
    navigate('/login', { replace: true });
  };

  const handleRoleSelection = async (role) => {
    if (loading) return;
    if (role === 'tenant') {
      setShowTenantModal(true);
      return;
    }
    await processRoleSelection(role, '/owner/dashboard');
  };

  const processRoleSelection = async (role, redirectPath) => {
    setSelected(role);
    setLoading(true);
    try {
      const res = await api.put('/api/auth/update-role', { role });
      loginContext({
        ...user,
        role: res.data.role,
        token: res.data.token,
        payment_setup_complete: res.data.payment_setup_complete,
        subscription_status: res.data.subscription_status,
        trial_end_date: res.data.trial_end_date,
      });
      toast.success(role === 'owner' ? '🏠 Welcome, Owner! Enjoy your free trial.' : '🎉 Welcome aboard!');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role');
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTenantPath = (path) => {
    setShowTenantModal(false);
    processRoleSelection('tenant', path);
  };

  return (
    <div style={s.page}>

      {/* Modern Header */}
      <header style={s.header}>
        <Link to="/" style={s.logoWrap}>
          <img src="/logo.png" alt="easyPG" style={{ height: 32, objectFit: 'contain' }} />
        </Link>
        <div style={s.headerRight}>
          <ThemeToggle />
          <button onClick={handleLogout} style={s.logoutBtn}>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={s.main}>
        
        {/* Sleek Headline Area */}
        <div style={s.headlineWrap}>
          <div style={s.pillBadge}>
            <Sparkles size={14} color="#f59e0b" />
            <span>Select Your Journey</span>
          </div>
          <h1 style={s.headline}>Welcome to easyPG</h1>
          <p style={s.subline}>
            Choose how you want to use the platform. This is a one-time selection that customizes your entire experience.
          </p>
        </div>

        {/* Premium Role Cards */}
        <div style={s.cardsContainer}>

          {/* ── OWNER CARD ── */}
          <button
            onClick={() => handleRoleSelection('owner')}
            onMouseEnter={() => setHoveredCard('owner')}
            onMouseLeave={() => setHoveredCard(null)}
            disabled={loading}
            style={{
              ...s.card,
              ...(hoveredCard === 'owner' ? s.cardHoverOwner : {}),
              ...(selected === 'owner' ? s.cardActiveOwner : {}),
              opacity: loading && selected !== 'owner' ? 0.5 : 1,
            }}
            className="role-card"
          >
            <div style={s.cardContentWrapper}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ ...s.iconBox, background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.15))', color: '#7c3aed' }}>
                  <Building2 size={28} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h2 style={s.cardTitle}>Hostel Owner</h2>
                  <span style={s.cardSubtitle}>Manage properties</span>
                </div>
              </div>

              <p style={s.cardDesc}>
                Run your PG like a pro. Automate rent collection, track analytics, and manage tenants effortlessly.
              </p>

              <div style={s.featuresGrid}>
                <FeatureItem icon={PieChart} text="Live Analytics" color="124, 58, 237" />
                <FeatureItem icon={Wallet} text="Auto Rent" color="124, 58, 237" />
                <FeatureItem icon={BellRing} text="Smart Notices" color="124, 58, 237" />
                <FeatureItem icon={ShieldCheck} text="Verification" color="124, 58, 237" />
              </div>
            </div>

            <div style={{ ...s.ctaButton, background: selected === 'owner' || hoveredCard === 'owner' ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'var(--bg-elevated)', color: selected === 'owner' || hoveredCard === 'owner' ? '#fff' : 'var(--text-bright)' }}>
              {loading && selected === 'owner' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="spinner-border" /> Loading...</span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' }}>Continue as Owner <ArrowRight size={18} /></span>
              )}
            </div>
          </button>

          {/* ── TENANT CARD ── */}
          <button
            onClick={() => handleRoleSelection('tenant')}
            onMouseEnter={() => setHoveredCard('tenant')}
            onMouseLeave={() => setHoveredCard(null)}
            disabled={loading}
            style={{
              ...s.card,
              ...(hoveredCard === 'tenant' ? s.cardHoverTenant : {}),
              ...(selected === 'tenant' ? s.cardActiveTenant : {}),
              opacity: loading && selected !== 'tenant' ? 0.5 : 1,
            }}
            className="role-card"
          >
            <div style={s.cardContentWrapper}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ ...s.iconBox, background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.15))', color: '#10b981' }}>
                  <Users size={28} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h2 style={s.cardTitle}>Tenant / Resident</h2>
                  <span style={s.cardSubtitle}>Find & manage stays</span>
                </div>
              </div>

              <p style={s.cardDesc}>
                Your digital companion. Pay rent instantly, raise complaints, and stay connected with your hostel.
              </p>

              <div style={s.featuresGrid}>
                <FeatureItem icon={Wallet} text="Easy Payments" color="16, 185, 129" />
                <FeatureItem icon={CheckCircle2} text="Join instantly" color="16, 185, 129" />
                <FeatureItem icon={ShieldCheck} text="Complaints" color="16, 185, 129" />
                <FeatureItem icon={BellRing} text="Updates" color="16, 185, 129" />
              </div>
            </div>

            <div style={{ ...s.ctaButton, background: selected === 'tenant' || hoveredCard === 'tenant' ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'var(--bg-elevated)', color: selected === 'tenant' || hoveredCard === 'tenant' ? '#fff' : 'var(--text-bright)' }}>
              {loading && selected === 'tenant' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="spinner-border" /> Loading...</span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' }}>Continue as Tenant <ArrowRight size={18} /></span>
              )}
            </div>
          </button>

        </div>

      </main>

      {/* Premium Tenant Path Modal */}
      {showTenantModal && (
        <div style={s.modalOverlay} onClick={() => setShowTenantModal(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()} className="slide-up">
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>How would you like to join?</h3>
              <p style={s.modalDesc}>Select a method to find your hostel</p>
            </div>
            
            <div style={s.modalOptions}>
              <button onClick={() => handleTenantPath('/tenant/search')} style={s.modalOptionBtn}>
                <div style={{...s.modalIconBox, background: 'rgba(16,185,129,0.1)', color: '#10b981'}}>
                  <Home size={22} />
                </div>
                <div style={s.modalOptionTextWrap}>
                  <strong style={s.modalOptionTitle}>Search Hostels</strong>
                  <span style={s.modalOptionDesc}>Browse all verified properties on our platform</span>
                </div>
                <ArrowRight size={18} color="var(--text-ghost)" />
              </button>

              <button onClick={() => handleTenantPath('/tenant/join')} style={s.modalOptionBtn}>
                <div style={{...s.modalIconBox, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6'}}>
                  <QrCode size={22} />
                </div>
                <div style={s.modalOptionTextWrap}>
                  <strong style={s.modalOptionTitle}>Join with Code / QR</strong>
                  <span style={s.modalOptionDesc}>Use an invite code or scan the hostel's QR code</span>
                </div>
                <ArrowRight size={18} color="var(--text-ghost)" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .role-card {
          cursor: pointer;
          text-align: left;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .role-card:active { transform: scale(0.98); }
        .spinner-border {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

/* ─── Premium Styles ─── */
const s = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-base)',
    color: 'var(--text-bright)',
    fontFamily: "'Inter', system-ui, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 5%',
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border-subtle)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-muted)',
    color: 'var(--text-dim)',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem 1.5rem 5rem',
    position: 'relative',
    zIndex: 10,
  },

  headlineWrap: {
    textAlign: 'center',
    maxWidth: 600,
    marginBottom: '3.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  pillBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(245,158,11,0.1)',
    color: '#f59e0b',
    padding: '0.4rem 1rem',
    borderRadius: 100,
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom: '1.5rem',
  },
  headline: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 800,
    letterSpacing: '-0.04em',
    margin: '0 0 1rem 0',
    color: 'var(--text-bright)',
  },
  subline: {
    fontSize: '1.05rem',
    color: 'var(--text-dim)',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: 500,
  },

  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
    width: '100%',
    maxWidth: 800,
  },

  card: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 24,
    padding: '0',
    overflow: 'hidden',
    outline: 'none',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
  },
  cardHoverOwner: {
    borderColor: 'rgba(124, 58, 237, 0.4)',
    boxShadow: '0 12px 40px rgba(124, 58, 237, 0.15)',
    transform: 'translateY(-5px)',
  },
  cardActiveOwner: {
    borderColor: '#7c3aed',
    borderWidth: 2,
  },
  cardHoverTenant: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    boxShadow: '0 12px 40px rgba(16, 185, 129, 0.15)',
    transform: 'translateY(-5px)',
  },
  cardActiveTenant: {
    borderColor: '#10b981',
    borderWidth: 2,
  },

  cardContentWrapper: {
    padding: '2.25rem',
    flex: 1,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.1)',
  },
  cardTitle: {
    fontSize: '1.4rem',
    fontWeight: 800,
    margin: '0 0 0.2rem 0',
    color: 'var(--text-bright)',
    letterSpacing: '-0.02em',
  },
  cardSubtitle: {
    fontSize: '0.8rem',
    color: 'var(--text-ghost)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  cardDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-dim)',
    lineHeight: 1.6,
    margin: '0 0 1.75rem 0',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem 0.5rem',
  },

  ctaButton: {
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 700,
    borderTop: '1px solid var(--border-subtle)',
    transition: 'all 0.3s ease',
  },

  /* ── Premium Modal Styles ── */
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modalContent: {
    background: 'var(--bg-surface)',
    width: '100%',
    maxWidth: 480,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: '2.5rem 2rem 3rem',
    boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
    border: '1px solid var(--border-subtle)',
    borderBottom: 'none',
  },
  modalHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  modalTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--text-bright)',
    letterSpacing: '-0.02em',
  },
  modalDesc: {
    margin: 0,
    fontSize: '0.95rem',
    color: 'var(--text-dim)',
  },
  modalOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  modalOptionBtn: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 20,
    padding: '1.25rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  modalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalOptionTextWrap: {
    flex: 1,
    marginLeft: '1.25rem',
  },
  modalOptionTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-bright)',
    display: 'block',
    marginBottom: '0.2rem',
  },
  modalOptionDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-dim)',
    lineHeight: 1.4,
  },
};

export default SelectRolePage;
