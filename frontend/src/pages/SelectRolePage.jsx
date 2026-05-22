import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Users, LogOut, Check, Shield, BarChart3, Bell, CreditCard, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import api from '../api';
import toast from 'react-hot-toast';

/* ─── Feature pill ─── */
const FeaturePill = ({ icon: Icon, text, color }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: `rgba(${color},0.08)`,
    border: `1px solid rgba(${color},0.18)`,
    borderRadius: 100,
    padding: '0.35rem 0.85rem',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: `rgb(${color})`,
    whiteSpace: 'nowrap',
  }}>
    <Icon size={12} />
    {text}
  </div>
);

/* ─── Main Component ─── */
const SelectRolePage = () => {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const { loginContext, user, logoutContext } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutContext();
    navigate('/login', { replace: true });
  };

  const handleRoleSelection = async (role) => {
    if (loading) return;
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
      if (role === 'owner') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/tenant/join', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role');
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  const ownerFeatures = [
    { icon: BarChart3, text: 'Live Analytics', color: '249,115,22' },
    { icon: Users, text: 'Tenant Management', color: '249,115,22' },
    { icon: CreditCard, text: 'Rent Collection', color: '249,115,22' },
    { icon: Bell, text: 'Smart Notices', color: '249,115,22' },
    { icon: Shield, text: 'Verified Tenants', color: '249,115,22' },
    { icon: Building2, text: 'Multi-Property', color: '249,115,22' },
  ];

  const tenantFeatures = [
    { icon: CreditCard, text: 'Easy Payments', color: '5,150,105' },
    { icon: Bell, text: 'Instant Notices', color: '5,150,105' },
    { icon: Shield, text: 'Complaint Portal', color: '5,150,105' },
    { icon: BarChart3, text: 'Track Dues', color: '5,150,105' },
  ];

  return (
    <div style={s.page}>

      {/* Header */}
      <header style={s.header}>
        <Link to="/" style={s.logoWrap}>
          <img src="/logo.png" alt="easyPG" style={{ height: 38, objectFit: 'contain' }} />
        </Link>
        <div style={s.headerRight}>
          <ThemeToggle />
          <button onClick={handleLogout} style={s.logoutBtn} title="Logout">
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={s.main}>

        {/* Top badge */}
        <div style={s.topBadge}>
          <Sparkles size={14} style={{ color: '#fbbf24' }} />
          <span>Choose your journey on easyPG</span>
        </div>

        {/* Headline */}
        <div style={s.headlineWrap}>
          <h1 style={s.headline}>Who are you in this story?</h1>
          <p style={s.subline}>
            Pick your role to unlock a tailored experience. This is a one-time choice.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div style={s.cardsRow}>

          {/* ── OWNER CARD ── */}
          <button
            id="role-owner"
            onClick={() => handleRoleSelection('owner')}
            onMouseEnter={() => setHoveredCard('owner')}
            onMouseLeave={() => setHoveredCard(null)}
            disabled={loading}
            style={{
              ...s.card,
              ...(hoveredCard === 'owner' ? s.cardHoverOwner : {}),
              ...(selected === 'owner' ? s.cardActiveOwner : {}),
              opacity: loading && selected !== 'owner' ? 0.45 : 1,
            }}
          >


            {/* Icon */}
            <div style={{ ...s.iconWrap, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)' }}>
              <Building2 size={36} style={{ color: '#f97316' }} />
            </div>

            <h2 style={{ ...s.cardTitle, color: '#f97316' }}>Hostel Owner</h2>

            <p style={s.cardDesc}>
              Run your PG / hostel like a pro. Manage rooms, collect rent, and grow your business — all in one place.
            </p>

            {/* Feature pills */}
            <div style={s.pillsWrap}>
              {ownerFeatures.map((f, i) => (
                <FeaturePill key={i} {...f} />
              ))}
            </div>



            {/* CTA */}
            <div style={{
              ...s.cta,
              background: 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))',
              boxShadow: hoveredCard === 'owner' ? '0 6px 24px rgba(var(--shadow-primary-color),0.45)' : '0 2px 10px rgba(var(--shadow-primary-color),0.25)',
            }}>
              {loading && selected === 'owner' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={s.spinner} /> Setting up…
                </span>
              ) : (
                <> Continue as Owner <ArrowRight size={16} /> </>
              )}
            </div>
          </button>

          {/* ── OR DIVIDER ── */}
          <div style={s.orDivider}>
            <div style={s.orLine} />
            <span style={s.orText}>OR</span>
            <div style={s.orLine} />
          </div>

          {/* ── TENANT CARD ── */}
          <button
            id="role-tenant"
            onClick={() => handleRoleSelection('tenant')}
            onMouseEnter={() => setHoveredCard('tenant')}
            onMouseLeave={() => setHoveredCard(null)}
            disabled={loading}
            style={{
              ...s.card,
              ...(hoveredCard === 'tenant' ? s.cardHoverTenant : {}),
              ...(selected === 'tenant' ? s.cardActiveTenant : {}),
              opacity: loading && selected !== 'tenant' ? 0.45 : 1,
            }}
          >


            {/* Icon */}
            <div style={{ ...s.iconWrap, background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.25)' }}>
              <Users size={36} style={{ color: '#34d399' }} />
            </div>

            <h2 style={{ ...s.cardTitle, color: '#34d399' }}>Tenant / Resident</h2>

            <p style={s.cardDesc}>
              Your digital hostel companion. Pay rent, stay updated, report issues — everything in your pocket.
            </p>

            {/* Feature pills */}
            <div style={s.pillsWrap}>
              {tenantFeatures.map((f, i) => (
                <FeaturePill key={i} {...f} />
              ))}
            </div>



            {/* Benefit checklist */}
            <ul style={s.checklist}>
              {[
                'Join any hostel with invite code',
                'Receive room & notices',
                'Raise complaints instantly',
              ].map((item, i) => (
                <li key={i} style={s.checkItem}>
                  <span style={{ ...s.checkIcon, background: 'rgba(5,150,105,0.12)', color: '#34d399' }}>
                    <Check size={11} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div style={{
              ...s.cta,
              background: 'linear-gradient(135deg, #059669, #0891b2)',
              boxShadow: hoveredCard === 'tenant' ? '0 6px 24px rgba(5,150,105,0.4)' : '0 2px 10px rgba(5,150,105,0.2)',
            }}>
              {loading && selected === 'tenant' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={s.spinner} /> Setting up…
                </span>
              ) : (
                <> Join as Tenant <ArrowRight size={16} /> </>
              )}
            </div>
          </button>
        </div>

        {/* Footer note */}
        <p style={s.footerNote}>
          🔒 Your role is permanent. Choose carefully — you can only select once.
        </p>
      </main>

      <style>{`
        @keyframes spin360 { to { transform: rotate(360deg); } }
        #role-owner, #role-tenant {
          cursor: pointer;
          text-align: left;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        #role-owner:hover, #role-tenant:hover { transform: translateY(-4px); }
        #role-owner:active, #role-tenant:active { transform: translateY(-1px); }
        #role-owner:disabled, #role-tenant:disabled { cursor: not-allowed; transform: none !important; }
      `}</style>
    </div>
  );
};

/* ─── Styles ─── */
const s = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-base)',
    color: 'var(--text-bright)',
    fontFamily: "'Inter', system-ui, sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 2rem',
    borderBottom: '1px solid var(--border-subtle)',
    background: 'var(--bg-surface)',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-muted)',
    color: 'var(--text-dim)',
    padding: '0.5rem 1rem',
    borderRadius: 8,
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
  },

  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1.5rem 4rem',
    gap: '2rem',
  },

  topBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(251,191,36,0.08)',
    border: '1px solid rgba(251,191,36,0.2)',
    color: '#fbbf24',
    padding: '0.4rem 1rem',
    borderRadius: 100,
    fontSize: '0.8rem',
    fontWeight: 600,
  },

  headlineWrap: {
    textAlign: 'center',
    maxWidth: 520,
  },
  headline: {
    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    margin: '0 0 0.75rem 0',
    color: 'var(--text-bright)',
  },
  subline: {
    fontSize: '0.95rem',
    color: 'var(--text-dim)',
    lineHeight: 1.7,
    margin: 0,
  },

  cardsRow: {
    display: 'flex',
    alignItems: 'stretch',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 900,
  },

  card: {
    flex: '1 1 340px',
    maxWidth: 400,
    minWidth: 300,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
    padding: '2rem 1.75rem',
    borderRadius: 16,
    border: '1px solid var(--border-muted)',
    background: 'var(--bg-surface)',
    position: 'relative',
    overflow: 'hidden',
    outline: 'none',
    margin: '0.75rem',
  },

  cardHoverOwner: {
    borderColor: 'rgba(var(--shadow-primary-color),0.4)',
    boxShadow: '0 8px 30px rgba(var(--shadow-primary-color),0.12)',
  },
  cardActiveOwner: {
    borderColor: 'rgba(var(--shadow-primary-color),0.6)',
  },
  cardHoverTenant: {
    borderColor: 'rgba(5,150,105,0.4)',
    boxShadow: '0 8px 30px rgba(5,150,105,0.1)',
  },
  cardActiveTenant: {
    borderColor: 'rgba(5,150,105,0.6)',
  },



  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    margin: 0,
    letterSpacing: '-0.02em',
    fontFamily: "'Space Grotesk', sans-serif",
  },

  cardDesc: {
    fontSize: '0.88rem',
    color: 'var(--text-dim)',
    lineHeight: 1.7,
    margin: 0,
  },

  pillsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },



  checklist: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.55rem',
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontSize: '0.85rem',
    color: 'var(--text-dim)',
    lineHeight: 1.5,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  cta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.9rem 1.5rem',
    borderRadius: 10,
    border: 'none',
    color: '#fff',
    fontSize: '0.92rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 'auto',
    letterSpacing: '0.01em',
    fontFamily: "'Inter', sans-serif",
  },

  spinner: {
    display: 'inline-block',
    width: 15,
    height: 15,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin360 0.7s linear infinite',
  },

  orDivider: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    padding: '0 0.25rem',
    alignSelf: 'center',
  },
  orLine: {
    width: 1,
    flex: 1,
    minHeight: 40,
    background: 'var(--border-subtle)',
  },
  orText: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--text-ghost)',
    letterSpacing: '0.08em',
  },

  footerNote: {
    fontSize: '0.82rem',
    color: 'var(--text-ghost)',
    textAlign: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border-subtle)',
    width: '100%',
    maxWidth: 900,
  },
};

export default SelectRolePage;
