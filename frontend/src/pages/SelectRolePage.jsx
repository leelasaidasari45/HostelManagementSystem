import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Users, ChevronRight, LogOut, Check, Star, Zap, Shield, BarChart3, Bell, CreditCard, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import api from '../api';
import toast from 'react-hot-toast';

/* ─── Animated Particle Canvas ─── */
const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 38 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.4,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.5 ? '124,58,237' : '37,99,235',
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
      });
      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(124,58,237,${0.07 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  );
};

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
    { icon: BarChart3, text: 'Live Analytics', color: '124,58,237' },
    { icon: Users, text: 'Tenant Management', color: '124,58,237' },
    { icon: CreditCard, text: 'Rent Collection', color: '124,58,237' },
    { icon: Bell, text: 'Smart Notices', color: '124,58,237' },
    { icon: Shield, text: 'Verified Tenants', color: '124,58,237' },
    { icon: Building2, text: 'Multi-Property', color: '124,58,237' },
  ];

  const tenantFeatures = [
    { icon: CreditCard, text: 'Easy Payments', color: '5,150,105' },
    { icon: Bell, text: 'Instant Notices', color: '5,150,105' },
    { icon: Shield, text: 'Complaint Portal', color: '5,150,105' },
    { icon: BarChart3, text: 'Track Dues', color: '5,150,105' },
  ];

  return (
    <div style={s.page}>
      <ParticleCanvas />

      {/* Ambient glow orbs */}
      <div style={s.orbPurple} />
      <div style={s.orbGreen} />
      <div style={s.orbBlue} />

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
        <div style={s.topBadge} className="fade-in">
          <Sparkles size={14} style={{ color: '#fbbf24' }} />
          <span>Choose your journey on easyPG</span>
        </div>

        {/* Headline */}
        <div style={s.headlineWrap} className="slide-up">
          <h1 style={s.headline}>
            Who are you in this story?
          </h1>
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
            className="slide-up delay-100"
            style={{
              ...s.card,
              ...s.ownerCard,
              ...(hoveredCard === 'owner' ? s.ownerCardHover : {}),
              ...(selected === 'owner' ? s.ownerCardActive : {}),
              opacity: loading && selected !== 'owner' ? 0.45 : 1,
            }}
          >
            {/* Corner badge */}
            <div style={{ ...s.cornerBadge, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <Star size={10} fill="white" color="white" />
              <span>2-Day Free Trial</span>
            </div>

            {/* Glow ring */}
            <div style={{ ...s.cardGlowRing, boxShadow: hoveredCard === 'owner' ? '0 0 60px rgba(124,58,237,0.18)' : 'none' }} />

            {/* Icon */}
            <div style={{ ...s.iconWrap, background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.15))', border: '1px solid rgba(124,58,237,0.3)' }}>
              <Building2 size={36} style={{ color: '#a78bfa' }} />
            </div>

            {/* Title */}
            <h2 style={{ ...s.cardTitle, background: 'linear-gradient(135deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Hostel Owner
            </h2>
            <p style={s.cardDesc}>
              Run your PG / hostel like a pro. Manage rooms, collect rent, and grow your business — all in one place.
            </p>

            {/* Feature pills */}
            <div style={s.pillsWrap}>
              {ownerFeatures.map((f, i) => (
                <FeaturePill key={i} {...f} />
              ))}
            </div>

            {/* Pricing callout */}
            <div style={{ ...s.pricingBox, borderColor: 'rgba(124,58,237,0.25)', background: 'rgba(124,58,237,0.06)' }}>
              <div style={s.pricingLeft}>
                <span style={s.pricingFree}>FREE</span>
                <span style={s.pricingFor}>for 2 days</span>
              </div>
              <div style={s.pricingDivider} />
              <div style={s.pricingRight}>
                <span style={s.pricingThen}>Then</span>
                <span style={{ ...s.pricingAmount, color: '#a78bfa' }}>₹40,000<span style={s.pricingPer}>/year</span></span>
              </div>
            </div>

            {/* CTA */}
            <div style={{
              ...s.cta,
              background: selected === 'owner' && loading
                ? 'linear-gradient(135deg, #5b21b6, #3730a3)'
                : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: hoveredCard === 'owner' ? '0 8px 30px rgba(124,58,237,0.5)' : '0 4px 16px rgba(124,58,237,0.3)',
            }}>
              {loading && selected === 'owner' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={s.spinner} />
                  Setting up…
                </span>
              ) : (
                <>
                  Start Free Trial <ArrowRight size={16} />
                </>
              )}
            </div>
          </button>

          {/* ── DIVIDER ── */}
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
            className="slide-up delay-200"
            style={{
              ...s.card,
              ...s.tenantCard,
              ...(hoveredCard === 'tenant' ? s.tenantCardHover : {}),
              ...(selected === 'tenant' ? s.tenantCardActive : {}),
              opacity: loading && selected !== 'tenant' ? 0.45 : 1,
            }}
          >
            {/* Corner badge */}
            <div style={{ ...s.cornerBadge, background: 'linear-gradient(135deg, #059669, #0891b2)' }}>
              <Zap size={10} fill="white" color="white" />
              <span>Always Free</span>
            </div>

            {/* Glow ring */}
            <div style={{ ...s.cardGlowRing, boxShadow: hoveredCard === 'tenant' ? '0 0 60px rgba(5,150,105,0.15)' : 'none' }} />

            {/* Icon */}
            <div style={{ ...s.iconWrap, background: 'linear-gradient(135deg, rgba(5,150,105,0.18), rgba(8,145,178,0.12))', border: '1px solid rgba(5,150,105,0.3)' }}>
              <Users size={36} style={{ color: '#34d399' }} />
            </div>

            {/* Title */}
            <h2 style={{ ...s.cardTitle, background: 'linear-gradient(135deg, #34d399, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Tenant / Resident
            </h2>
            <p style={s.cardDesc}>
              Your digital hostel companion. Pay rent, stay updated, report issues — everything in your pocket.
            </p>

            {/* Feature pills */}
            <div style={s.pillsWrap}>
              {tenantFeatures.map((f, i) => (
                <FeaturePill key={i} {...f} />
              ))}
            </div>

            {/* Free callout */}
            <div style={{ ...s.pricingBox, borderColor: 'rgba(5,150,105,0.25)', background: 'rgba(5,150,105,0.06)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, alignItems: 'center' }}>
                <span style={{ ...s.pricingFree, color: '#34d399' }}>₹0</span>
                <span style={s.pricingFor}>forever, no hidden fees</span>
              </div>
            </div>

            {/* Benefit checklist */}
            <ul style={s.checklist}>
              {['Join any hostel with invite code', 'Receive room & notices', 'Raise complaints instantly'].map((item, i) => (
                <li key={i} style={s.checkItem}>
                  <span style={{ ...s.checkIcon, background: 'rgba(5,150,105,0.15)', color: '#34d399' }}>
                    <Check size={11} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div style={{
              ...s.cta,
              background: selected === 'tenant' && loading
                ? 'linear-gradient(135deg, #047857, #0e7490)'
                : 'linear-gradient(135deg, #059669, #0891b2)',
              boxShadow: hoveredCard === 'tenant' ? '0 8px 30px rgba(5,150,105,0.45)' : '0 4px 16px rgba(5,150,105,0.25)',
            }}>
              {loading && selected === 'tenant' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={s.spinner} />
                  Setting up…
                </span>
              ) : (
                <>
                  Join as Tenant <ArrowRight size={16} />
                </>
              )}
            </div>
          </button>
        </div>

        {/* Footer note */}
        <p style={s.footerNote} className="fade-in">
          🔒 Your role is permanent. Choose carefully — you can only select once.
        </p>
      </main>

      <style>{`
        @keyframes spin360 { to { transform: rotate(360deg); } }
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.04); }
        }
        #role-owner, #role-tenant {
          cursor: pointer;
          text-align: left;
        }
        #role-owner:hover, #role-tenant:hover {
          transform: translateY(-6px);
        }
        #role-owner:active, #role-tenant:active {
          transform: translateY(-2px) scale(0.99);
        }
        #role-owner:disabled, #role-tenant:disabled {
          cursor: not-allowed;
          transform: none !important;
        }
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
    position: 'relative',
    overflow: 'hidden',
  },

  // Orbs
  orbPurple: {
    position: 'absolute',
    width: 700,
    height: 700,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 70%)',
    filter: 'blur(120px)',
    top: -250,
    left: -200,
    pointerEvents: 'none',
    animation: 'floatOrb 8s ease-in-out infinite',
  },
  orbGreen: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(5,150,105,0.1) 0%, transparent 70%)',
    filter: 'blur(100px)',
    bottom: -150,
    right: -100,
    pointerEvents: 'none',
    animation: 'floatOrb 10s ease-in-out infinite reverse',
  },
  orbBlue: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)',
    filter: 'blur(80px)',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },

  // Header
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 2rem',
    borderBottom: '1px solid var(--border-subtle)',
    position: 'relative',
    zIndex: 10,
    backdropFilter: 'blur(8px)',
    background: 'rgba(13,17,23,0.5)',
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
    transition: 'all 0.2s',
  },

  // Main
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1.5rem 4rem',
    position: 'relative',
    zIndex: 5,
    gap: '2rem',
  },

  topBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(251,191,36,0.1)',
    border: '1px solid rgba(251,191,36,0.2)',
    color: '#fbbf24',
    padding: '0.4rem 1rem',
    borderRadius: 100,
    fontSize: '0.8rem',
    fontWeight: 600,
    letterSpacing: '0.01em',
  },

  headlineWrap: {
    textAlign: 'center',
    maxWidth: 560,
  },
  headline: {
    fontSize: 'clamp(2rem, 5vw, 3.2rem)',
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
    margin: '0 0 1rem 0',
    background: 'linear-gradient(135deg, var(--text-bright) 30%, var(--accent-primary))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subline: {
    fontSize: '1rem',
    color: 'var(--text-dim)',
    lineHeight: 1.7,
    margin: 0,
  },

  // Cards
  cardsRow: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '0',
    width: '100%',
    maxWidth: 900,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  card: {
    flex: '1 1 360px',
    maxWidth: 400,
    minWidth: 300,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
    padding: '2rem 1.75rem',
    borderRadius: 20,
    border: '1px solid var(--border-subtle)',
    background: 'var(--bg-glass)',
    backdropFilter: 'blur(16px)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
    outline: 'none',
    margin: '0.75rem',
  },

  ownerCard: {
    borderColor: 'rgba(124,58,237,0.2)',
    background: 'linear-gradient(145deg, rgba(22,27,39,0.9) 0%, rgba(124,58,237,0.05) 100%)',
  },
  ownerCardHover: {
    borderColor: 'rgba(124,58,237,0.5)',
    background: 'linear-gradient(145deg, rgba(22,27,39,0.95) 0%, rgba(124,58,237,0.1) 100%)',
    boxShadow: '0 20px 50px rgba(124,58,237,0.18), 0 0 0 1px rgba(124,58,237,0.3)',
  },
  ownerCardActive: {
    borderColor: 'rgba(124,58,237,0.7)',
    boxShadow: '0 20px 60px rgba(124,58,237,0.3)',
  },
  tenantCard: {
    borderColor: 'rgba(5,150,105,0.2)',
    background: 'linear-gradient(145deg, rgba(22,27,39,0.9) 0%, rgba(5,150,105,0.04) 100%)',
  },
  tenantCardHover: {
    borderColor: 'rgba(5,150,105,0.5)',
    background: 'linear-gradient(145deg, rgba(22,27,39,0.95) 0%, rgba(5,150,105,0.09) 100%)',
    boxShadow: '0 20px 50px rgba(5,150,105,0.15), 0 0 0 1px rgba(5,150,105,0.3)',
  },
  tenantCardActive: {
    borderColor: 'rgba(5,150,105,0.7)',
    boxShadow: '0 20px 60px rgba(5,150,105,0.25)',
  },

  cornerBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.3rem 0.7rem',
    borderRadius: 100,
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '0.02em',
  },

  cardGlowRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: 20,
    pointerEvents: 'none',
    transition: 'box-shadow 0.4s ease',
  },

  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.25rem',
    flexShrink: 0,
  },

  cardTitle: {
    fontSize: '1.6rem',
    fontWeight: 800,
    margin: 0,
    letterSpacing: '-0.02em',
    fontFamily: "'Space Grotesk', sans-serif",
  },

  cardDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-dim)',
    lineHeight: 1.7,
    margin: 0,
  },

  pillsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },

  pricingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    borderRadius: 12,
    border: '1px solid',
    padding: '0.9rem 1.1rem',
    marginTop: '0.25rem',
  },
  pricingLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    flex: 1,
    alignItems: 'center',
  },
  pricingFree: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#a78bfa',
    fontFamily: "'Space Grotesk', sans-serif",
    lineHeight: 1,
  },
  pricingFor: {
    fontSize: '0.72rem',
    color: 'var(--text-dim)',
    fontWeight: 500,
  },
  pricingDivider: {
    width: 1,
    height: 36,
    background: 'var(--border-subtle)',
    flexShrink: 0,
  },
  pricingRight: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    flex: 1,
    alignItems: 'center',
  },
  pricingThen: {
    fontSize: '0.7rem',
    color: 'var(--text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
  },
  pricingAmount: {
    fontSize: '1.15rem',
    fontWeight: 800,
    fontFamily: "'Space Grotesk', sans-serif",
    lineHeight: 1,
  },
  pricingPer: {
    fontSize: '0.72rem',
    fontWeight: 500,
    opacity: 0.7,
  },

  checklist: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
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
    borderRadius: 12,
    border: 'none',
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    marginTop: 'auto',
    letterSpacing: '0.01em',
    fontFamily: "'Inter', sans-serif",
  },

  spinner: {
    display: 'inline-block',
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin360 0.7s linear infinite',
  },

  // OR divider
  orDivider: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0 0.5rem',
    alignSelf: 'center',
  },
  orLine: {
    width: 1,
    flex: 1,
    minHeight: 40,
    background: 'var(--border-subtle)',
  },
  orText: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--text-ghost)',
    letterSpacing: '0.08em',
    padding: '0.4rem 0',
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
