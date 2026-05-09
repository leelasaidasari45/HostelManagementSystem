import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, QrCode, Zap, Shield, BarChart3, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import './LandingPage.css';

const LandingPage = () => {
  const { user, loadingAuth } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (loadingAuth) return;
    if (user) navigate(user.role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard');
  }, [user, loadingAuth, navigate]);

  return (
    <div className="landing-page">
      {/* Ambient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Nav */}
      <nav className="landing-nav">
        <Link to="/" className="landing-logo" style={{ textDecoration: 'none' }}>
          <img src="/logo.png" alt="easyPG" className="logo-img-full" />
        </Link>
        <div className="nav-actions">
          <ThemeToggle />
          <Link to="/login" className="btn btn-ghost">Login</Link>
          <Link to="/register" className="btn btn-primary">
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="hero-section">
        <div className="hero-badge fade-in">
          <Zap size={14} style={{ color: '#fbbf24' }} />
          <span>Next-Gen Hostel SaaS Platform</span>
        </div>

        <h1 className="hero-title slide-up">
          Manage Your Properties<br />
          with <span className="text-gradient">Intelligent Automation</span>
        </h1>

        <p className="hero-subtitle slide-up delay-100">
          From QR-based tenant onboarding to automated payments and issue tracking.
          Everything you need in one powerful platform.
        </p>

        <div className="hero-cta slide-up delay-200">
          <Link to="/register" className="btn btn-primary btn-lg">
            Start Free Trial <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Sign In
          </Link>
        </div>

        {/* Stats bar */}
        <div className="stats-bar fade-in delay-300">
          <div className="stat-pill"><strong>500+</strong> <span>Properties</span></div>
          <div className="stat-divider" />
          <div className="stat-pill"><strong>12k+</strong> <span>Tenants</span></div>
          <div className="stat-divider" />
          <div className="stat-pill"><strong>99.9%</strong> <span>Uptime</span></div>
          <div className="stat-divider" />
          <div className="stat-pill"><strong>₹2Cr+</strong> <span>Processed</span></div>
        </div>

        {/* Feature Cards */}
        <div className="features-grid">
          {[
            { icon: <Building2 size={22} />, title: 'Multi-Property', desc: 'Manage all hostels from a single unified dashboard.' },
            { icon: <QrCode size={22} />, title: 'QR Onboarding', desc: 'Tenants scan and join instantly — zero friction.' },
            { icon: <Zap size={22} />, title: 'Smart Payments', desc: 'Integrated ledgers and automated rent reminders.' },
            { icon: <BarChart3 size={22} />, title: 'Live Analytics', desc: 'Real-time occupancy, revenue and trend insights.' },
            { icon: <Users size={22} />, title: 'Tenant Portal', desc: 'Dedicated portal for notices, complaints & vacate.' },
            { icon: <Shield size={22} />, title: 'Bank-Grade Security', desc: 'Supabase-powered auth with role-based access.' },
          ].map((f, i) => (
            <div key={i} className={`feature-card glass-panel slide-up delay-${(i % 3 + 1) * 100}`}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <img src="/logo.png" alt="easyPG" style={{ height: 32, objectFit: 'contain' }} />
        <span style={{ color: 'var(--text-ghost)', fontSize: '.82rem' }}>© 2026 easyPG. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default LandingPage;
