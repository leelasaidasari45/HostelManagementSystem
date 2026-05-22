import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, ChevronRight, BarChart3, Users, CreditCard, Bell, Lock, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';

const SelectRolePage = () => {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const { loginContext, user } = useAuth();
  const navigate = useNavigate();

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

      <div style={styles.container}>
        {/* Header Section */}
        <div className="slide-up" style={styles.headerSection}>
          <div style={styles.logoContainer}>
            <img src="/logo.png" alt="easyPG" style={styles.logo} />
          </div>
          
          <h1 style={styles.mainTitle}>
            Welcome to <span style={styles.gradient}>easyPG</span>
          </h1>
          
          <p style={styles.subtitle}>
            Choose your role to get started with the ultimate hostel management platform
          </p>

          <p style={styles.description}>
            Whether you're managing a property or looking for a comfortable place to live, easyPG has everything you need.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div style={styles.cardsGrid}>
          {/* Owner Card */}
          <button
            onClick={() => handleRoleSelection('owner')}
            disabled={loading}
            style={{
              ...styles.roleCard,
              ...(selected === 'owner' && styles.roleCardSelected),
              borderColor: selected === 'owner' ? '#7c3aed' : 'rgba(124, 58, 237, 0.2)',
              boxShadow: selected === 'owner' ? '0 0 30px rgba(124, 58, 237, 0.3)' : 'none',
              transform: selected === 'owner' ? 'translateY(-2px)' : 'translateY(0)',
              opacity: loading && selected !== 'owner' ? 0.5 : 1,
            }}
            className="slide-up delay-100"
          >
            {/* Card Top Badge */}
            <div style={styles.cardBadge}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#a78bfa' }}>
                FOR OWNERS
              </span>
            </div>

            {/* Icon */}
            <div style={{
              ...styles.iconContainer,
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(79, 70, 229, 0.15) 100%)',
            }}>
              <div style={{
                ...styles.iconInner,
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              }}>
                <Building2 size={32} color="#fff" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <h2 style={styles.cardTitle}>Hostel Owner</h2>
            <p style={styles.cardSubtitle}>
              Manage your property with powerful tools and automation
            </p>

            {/* Features List */}
            <div style={styles.featuresList}>
              {[
                { icon: <BarChart3 size={16} />, text: 'Live Analytics Dashboard' },
                { icon: <Users size={16} />, text: 'Manage Multiple Properties' },
                { icon: <CreditCard size={16} />, text: 'Automated Rent Collection' },
                { icon: <Bell size={16} />, text: 'Complaint Management' },
                { icon: <Lock size={16} />, text: 'Tenant Verification' },
                { icon: <Zap size={16} />, text: 'Smart Notifications' },
              ].map((feature, i) => (
                <div key={i} style={styles.featureItem}>
                  <div style={{ color: '#7c3aed', marginRight: 8 }}>{feature.icon}</div>
                  <span style={styles.featureText}>{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Pricing Badge */}
            <div style={styles.pricingBadge}>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: 4 }}>Start with</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>2-Day Free Trial</div>
            </div>

            {/* CTA Button */}
            <button
              style={{
                ...styles.ctaButton,
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              }}
              disabled={loading}
            >
              {loading && selected === 'owner' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="spinner-sm" /> Continuing...
                </span>
              ) : (
                <>
                  Get Started <ChevronRight size={16} style={{ marginLeft: 6 }} />
                </>
              )}
            </button>
          </button>

          {/* Tenant Card */}
          <button
            onClick={() => handleRoleSelection('tenant')}
            disabled={loading}
            style={{
              ...styles.roleCard,
              ...(selected === 'tenant' && styles.roleCardSelected),
              borderColor: selected === 'tenant' ? '#059669' : 'rgba(5, 150, 105, 0.2)',
              boxShadow: selected === 'tenant' ? '0 0 30px rgba(5, 150, 105, 0.3)' : 'none',
              transform: selected === 'tenant' ? 'translateY(-2px)' : 'translateY(0)',
              opacity: loading && selected !== 'tenant' ? 0.5 : 1,
            }}
            className="slide-up delay-200"
          >
            {/* Card Top Badge */}
            <div style={styles.cardBadge}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#34d399' }}>
                FOR RESIDENTS
              </span>
            </div>

            {/* Icon */}
            <div style={{
              ...styles.iconContainer,
              background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.2) 0%, rgba(8, 145, 178, 0.15) 100%)',
            }}>
              <div style={{
                ...styles.iconInner,
                background: 'linear-gradient(135deg, #059669, #0891b2)',
              }}>
                <User size={32} color="#fff" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <h2 style={styles.cardTitle}>Resident / Tenant</h2>
            <p style={styles.cardSubtitle}>
              Your digital companion for hostel living
            </p>

            {/* Features List */}
            <div style={styles.featuresList}>
              {[
                { icon: <CreditCard size={16} />, text: 'Easy Rent Payments' },
                { icon: <Bell size={16} />, text: 'Get Notices & Updates' },
                { icon: <Lock size={16} />, text: 'Secure Digital Identity' },
                { icon: <Users size={16} />, text: 'Connect with Roommates' },
                { icon: <Zap size={16} />, text: 'Instant Issue Reporting' },
                { icon: <BarChart3 size={16} />, text: 'Track Your Dues' },
              ].map((feature, i) => (
                <div key={i} style={styles.featureItem}>
                  <div style={{ color: '#059669', marginRight: 8 }}>{feature.icon}</div>
                  <span style={styles.featureText}>{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Badge */}
            <div style={styles.pricingBadge}>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: 4 }}>Always</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>100% Free</div>
            </div>

            {/* CTA Button */}
            <button
              style={{
                ...styles.ctaButton,
                background: 'linear-gradient(135deg, #059669, #0891b2)',
              }}
              disabled={loading}
            >
              {loading && selected === 'tenant' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="spinner-sm" /> Continuing...
                </span>
              ) : (
                <>
                  Join Now <ChevronRight size={16} style={{ marginLeft: 6 }} />
                </>
              )}
            </button>
          </button>
        </div>

        {/* Footer Info */}
        <div style={styles.footerInfo}>
          <p style={styles.footerText}>
            ⚠️ You can only select your role once. Choose the option that best fits your needs.
          </p>
        </div>
      </div>

      <style>{`
        .spinner-sm {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
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
    padding: '2rem 1.5rem 3rem',
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
  container: {
    width: '100%',
    maxWidth: 1100,
    position: 'relative',
    zIndex: 10,
  },
  headerSection: {
    textAlign: 'center',
    marginBottom: '4rem',
  },
  logoContainer: {
    marginBottom: '2rem',
  },
  logo: {
    height: 48,
    objectFit: 'contain',
  },
  mainTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 800,
    margin: '0 0 1rem 0',
    letterSpacing: '-0.02em',
  },
  gradient: {
    background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#e5e7eb',
    margin: '0 0 1rem 0',
    lineHeight: 1.4,
  },
  description: {
    fontSize: '1rem',
    color: '#9ca3af',
    maxWidth: 600,
    margin: '0 auto',
    lineHeight: 1.6,
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '2rem',
    marginBottom: '3rem',
  },
  roleCard: {
    position: 'relative',
    padding: '2.5rem',
    background: 'rgba(17, 24, 39, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
  },
  roleCardSelected: {
    background: 'rgba(17, 24, 39, 0.8)',
  },
  cardBadge: {
    marginBottom: '1.5rem',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    margin: '0 0 0.5rem 0',
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: '0.95rem',
    color: '#9ca3af',
    margin: '0 0 1.5rem 0',
    lineHeight: 1.5,
  },
  featuresList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    flex: 1,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
    color: '#d1d5db',
  },
  featureText: {
    lineHeight: 1.4,
  },
  pricingBadge: {
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  ctaButton: {
    width: '100%',
    padding: '1rem 1.5rem',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
  footerInfo: {
    textAlign: 'center',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },
  footerText: {
    fontSize: '0.85rem',
    color: '#6b7280',
    margin: 0,
    lineHeight: 1.5,
  },
};

export default SelectRolePage;
