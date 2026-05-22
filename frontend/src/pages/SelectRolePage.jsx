import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, User, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import api from '../api';
import toast from 'react-hot-toast';

const SelectRolePage = () => {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const { loginContext, user, logoutContext } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutContext();
    navigate('/login', { replace: true });
  };

  const handleRoleSelection = async (role) => {
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
      toast.success('Welcome aboard!');
      if (role === 'owner') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/tenant/join', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role');
      setSelected(null);
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      {/* Background Orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      {/* Header Navigation */}
      <header style={styles.header}>
        <nav style={styles.nav}>
          <Link to="/" style={styles.logo}>
            <img src="/logo.png" alt="easyPG" style={{ height: 40, objectFit: 'contain' }} />
          </Link>

          <div style={styles.navActions}>
            <ThemeToggle />
            <button onClick={handleLogout} style={styles.logoutBtn}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </nav>
      </header>

      <div style={styles.container}>
        {/* Hero Section */}
        <div className="slide-up" style={styles.heroSection}>
          <h1 style={styles.title}>
            What's your role?
          </h1>
          <p style={styles.subtitle}>
            Select how you'll be using easyPG to get started
          </p>
        </div>

        {/* Role Cards */}
        <div style={styles.cardsGrid}>
          {/* Owner Card */}
          <button
            onClick={() => handleRoleSelection('owner')}
            disabled={loading && selected !== 'owner'}
            style={{
              ...styles.card,
              ...styles.ownerCard,
              ...(selected === 'owner' && styles.cardActive),
              opacity: loading && selected !== 'owner' ? 0.5 : 1,
            }}
            className="slide-up delay-100"
          >
            <div style={styles.cardIconContainer}>
              <Building2 size={48} style={styles.ownerIcon} />
            </div>
            
            <h2 style={styles.cardTitle}>Hostel Owner</h2>
            
            <p style={styles.cardDescription}>
              Manage properties, tenants, and payments from a powerful dashboard
            </p>

            <ul style={styles.cardBenefits}>
              <li style={styles.benefit}>✓ Multi-property management</li>
              <li style={styles.benefit}>✓ Automated rent collection</li>
              <li style={styles.benefit}>✓ Live analytics & reporting</li>
              <li style={styles.benefit}>✓ Tenant verification</li>
            </ul>

            <div style={styles.priceTag}>
              <span style={styles.priceLabel}>Start with</span>
              <span style={styles.priceValue}>2-Day Free Trial</span>
            </div>

            <button
              style={{
                ...styles.selectBtn,
                ...styles.ownerBtn,
              }}
              disabled={loading && selected !== 'owner'}
            >
              {loading && selected === 'owner' ? (
                <span>Continuing...</span>
              ) : (
                <>
                  Select <ChevronRight size={16} style={{ marginLeft: 6 }} />
                </>
              )}
            </button>
          </button>

          {/* Tenant Card */}
          <button
            onClick={() => handleRoleSelection('tenant')}
            disabled={loading && selected !== 'tenant'}
            style={{
              ...styles.card,
              ...styles.tenantCard,
              ...(selected === 'tenant' && styles.cardActive),
              opacity: loading && selected !== 'tenant' ? 0.5 : 1,
            }}
            className="slide-up delay-200"
          >
            <div style={styles.cardIconContainer}>
              <User size={48} style={styles.tenantIcon} />
            </div>
            
            <h2 style={styles.cardTitle}>Tenant / Resident</h2>
            
            <p style={styles.cardDescription}>
              Your digital companion for managing hostel life
            </p>

            <ul style={styles.cardBenefits}>
              <li style={styles.benefit}>✓ Easy rent payments</li>
              <li style={styles.benefit}>✓ Get notices instantly</li>
              <li style={styles.benefit}>✓ Report issues & complaints</li>
              <li style={styles.benefit}>✓ Track your dues</li>
            </ul>

            <div style={styles.priceTag}>
              <span style={styles.priceLabel}>Always</span>
              <span style={styles.priceValue}>100% Free</span>
            </div>

            <button
              style={{
                ...styles.selectBtn,
                ...styles.tenantBtn,
              }}
              disabled={loading && selected !== 'tenant'}
            >
              {loading && selected === 'tenant' ? (
                <span>Continuing...</span>
              ) : (
                <>
                  Select <ChevronRight size={16} style={{ marginLeft: 6 }} />
                </>
              )}
            </button>
          </button>
        </div>

        {/* Footer Note */}
        <p style={styles.footer}>
          💡 You can only select your role once. Choose wisely!
        </p>
      </div>
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
    padding: 0,
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
    filter: 'blur(100px)',
    top: -200,
    left: -150,
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(5,150,105,0.1) 0%, transparent 70%)',
    filter: 'blur(100px)',
    bottom: -150,
    right: -150,
    pointerEvents: 'none',
  },
  header: {
    width: '100%',
    padding: '1.5rem 2rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    position: 'relative',
    zIndex: 10,
  },
  nav: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#9ca3af',
    padding: '0.5rem 1rem',
    borderRadius: 8,
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1.5rem',
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
    position: 'relative',
    zIndex: 5,
  },
  heroSection: {
    textAlign: 'center',
    marginBottom: '4rem',
  },
  title: {
    fontSize: 'clamp(2rem, 6vw, 3.5rem)',
    fontWeight: 800,
    margin: '0 0 1rem 0',
    letterSpacing: '-0.02em',
    background: 'linear-gradient(135deg, #fff, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#9ca3af',
    margin: 0,
    maxWidth: 500,
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
    width: '100%',
    marginBottom: '3rem',
  },
  card: {
    padding: '2.5rem 2rem',
    background: 'rgba(17, 24, 39, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    cursor: 'pointer',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
  },
  ownerCard: {
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  tenantCard: {
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  cardActive: {
    background: 'rgba(17, 24, 39, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  },
  cardIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  ownerIcon: {
    color: '#7c3aed',
  },
  tenantIcon: {
    color: '#059669',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    margin: '0 0 0.75rem 0',
    color: '#fff',
  },
  cardDescription: {
    fontSize: '0.95rem',
    color: '#d1d5db',
    margin: '0 0 1.5rem 0',
    lineHeight: 1.6,
  },
  cardBenefits: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 1.5rem 0',
    textAlign: 'left',
  },
  benefit: {
    fontSize: '0.9rem',
    color: '#9ca3af',
    margin: '0.5rem 0',
    lineHeight: 1.5,
  },
  priceTag: {
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  priceLabel: {
    fontSize: '0.8rem',
    color: '#6b7280',
  },
  priceValue: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#fff',
  },
  selectBtn: {
    padding: '0.9rem 1.5rem',
    border: 'none',
    borderRadius: 10,
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
    color: '#fff',
    width: '100%',
  },
  ownerBtn: {
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    boxShadow: '0 4px 15px rgba(124, 58, 237, 0.2)',
  },
  tenantBtn: {
    background: 'linear-gradient(135deg, #059669, #0891b2)',
    boxShadow: '0 4px 15px rgba(5, 150, 105, 0.2)',
  },
  footer: {
    fontSize: '0.9rem',
    color: '#6b7280',
    margin: 0,
    textAlign: 'center',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    width: '100%',
  },
};

export default SelectRolePage;
