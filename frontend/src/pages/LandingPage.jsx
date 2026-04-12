import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BuildingIcon, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

const LandingPage = () => {
  const { user, loadingAuth } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (loadingAuth) return; // Wait for auth check to complete

    if (user) {
      navigate(user.role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard');
    } else if (window.innerWidth <= 768) {
      // In mobile view, skip landing and go straight to registration
      navigate('/register');
    }
  }, [user, loadingAuth, navigate]);
  // Completely hide landing page content on mobile to prevent "flashing" before redirect
  if (loadingAuth || window.innerWidth <= 768) return null;

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="glass-panel landing-nav slide-up">
        <Link to="/" className="logo flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <img src="https://i.pinimg.com/736x/1d/31/58/1d315807fbdbf074612825fcdaa7c9b8.jpg" alt="easyPG Logo" className="logo-img" style={{ height: '32px', borderRadius: '4px' }} />
          <h2 className="logo-text" style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>easyPG</h2>
        </Link>
        <div className="nav-links">
          <Link to="/login" className="btn btn-secondary">Login</Link>
          <Link to="/register" className="btn btn-primary">
            Get Started <ArrowRight size={18} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero flex-col items-center justify-center fade-in">
        <div className="hero-badge glass-panel">
          <Zap size={16} color="var(--warning)" />
          <span>Next-Gen Multi-Tenant SaaS</span>
        </div>
        <h1 className="hero-title">
          Manage Your Hostels with <br />
          <span className="text-gradient">Intelligent Automation</span>
        </h1>
        <p className="hero-subtitle text-muted">
          From qr-based tenant onboarding to seamless payments and issue tracking.
          Everything you need in one powerful SaaS platform.
        </p>

        <div className="hero-cta flex gap-4">
          <Link to="/register" className="btn btn-primary btn-lg">
            Start Free Trial
          </Link>
          <a href="#features" className="btn btn-secondary btn-lg">
            View Features
          </a>
        </div>

        {/* Feature Cards Preview */}
        <div className="features-grid grid gap-6 mt-12 slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="feature-card glass-panel flex-col items-center">
            <div className="icon-wrapper"><BuildingIcon size={24} /></div>
            <h3>Multi-Hostel</h3>
            <p className="text-muted text-center">Manage multiple properties from a single account effortlessly.</p>
          </div>
          <div className="feature-card glass-panel flex-col items-center">
            <div className="icon-wrapper"><ShieldCheck size={24} /></div>
            <h3>QR Onboarding</h3>
            <p className="text-muted text-center">Tenants scan & join instantly. Automate admissions.</p>
          </div>
          <div className="feature-card glass-panel flex-col items-center">
            <div className="icon-wrapper"><Zap size={24} /></div>
            <h3>Smart Payments</h3>
            <p className="text-muted text-center">Integrated ledgers and automatic WhatsApp rent reminders.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;

