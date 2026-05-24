import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, QrCode, Zap, Shield, BarChart3, Users, Rocket, Menu, X, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import './LandingPage.css';

const LandingPage = () => {
  const { user, loadingAuth } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Detect Capacitor native platform
  const isNative = typeof window !== 'undefined' &&
    (window.Capacitor?.isNativePlatform?.() ||
     window.cordova !== undefined ||
     (/android/i.test(navigator.userAgent) && window.location.protocol === 'file:'));

  React.useEffect(() => {
    if (loadingAuth) return;
    if (user) {
      navigate(user.role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard', { replace: true });
      return;
    }
    // If on native Capacitor app and not logged in, skip landing page and go to register
    if (isNative) {
      navigate('/register', { replace: true });
    }
  }, [user, loadingAuth, navigate]);

  // Scroll reveal observer
  React.useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px -10% -10% 0px',
      threshold: 0.05,
    };

    const handleIntersection = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  // Framer-style card spotlight hover effect
  React.useEffect(() => {
    const grid = document.querySelector('.features-grid');
    if (!grid) return;

    const handleMouseMove = (e) => {
      const cards = grid.querySelectorAll('.feature-card');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    };

    grid.addEventListener('mousemove', handleMouseMove);
    return () => {
      grid.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Prevent flash of landing page while redirecting or if on native app
  if (user || isNative) {
    return null; 
  }

  return (
    <div className="landing-page">
      {/* Header Nav */}
      <header className="landing-header slide-up">
        <nav className="landing-nav">
          <div className="nav-left">
            <Link to="/" className="landing-logo" style={{ textDecoration: 'none' }}>
              <img src="/logo.png" alt="easyPG" className="logo-img-full" />
            </Link>
            <div className="nav-links-left">
              <a href="#features" className="nav-link">Features</a>
              <a href="#how-it-works" className="nav-link">How it Works</a>
            </div>
          </div>

          <Link to="/" className="center-brand-logo-wrap" style={{ textDecoration: 'none' }}>
            <span className="center-brand-logo" data-text="easyPG">easyPG</span>
          </Link>

          <div className="nav-right">
            <div className="nav-links-right">
              <a href="#testimonials" className="nav-link">Testimonials</a>
            </div>
            <div className="nav-actions">
              <ThemeToggle />
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">
                Get Started <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <button 
            className="mobile-menu-toggle icon-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </nav>
      </header>

      {isMobileMenuOpen && (
        <>
          <div 
            className="mobile-menu-backdrop" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="mobile-sidebar-drawer">
            <div className="drawer-header">
              <span className="drawer-title">Menu</span>
              <button 
                className="drawer-close icon-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mobile-nav-divider" />
            <div className="mobile-nav-links">
              <a href="#features" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>How it Works</a>
              <a href="#testimonials" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Testimonials</a>
            </div>
            <div className="mobile-nav-divider" />
            <div className="mobile-nav-actions">
              <div className="mobile-theme-row">
                <span>Theme Mode</span>
                <ThemeToggle />
              </div>
              <Link to="/login" className="btn btn-secondary w-full" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary w-full" onClick={() => setIsMobileMenuOpen(false)}>
                Get Started <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Hero */}
      <main className="hero-section">
        <div className="hero-badge scroll-reveal reveal-fade-in delay-1">
          <Rocket size={14} style={{ color: '#7c3aed' }} />
          <span>Hostel Management System</span>
        </div>

        <h1 className="hero-title scroll-reveal reveal-slide-up">
          <span className="reveal-line">
            <span className="reveal-inner">Manage Your Properties</span>
          </span>
          <span className="reveal-line">
            <span className="reveal-inner">with <span className="text-gradient">Intelligent Automation</span></span>
          </span>
        </h1>

        <p className="hero-subtitle scroll-reveal reveal-fade-in delay-2">
          From QR-based tenant onboarding to automated payments and issue tracking.
          Everything you need in one powerful platform.
        </p>

        <div className="hero-cta scroll-reveal reveal-fade-in delay-3">
          <Link to="/register" className="btn btn-primary btn-lg pulse-glow">
            Start Free Trial <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Sign In
          </Link>
        </div>

        {/* Stats bar */}
        <div className="stats-bar scroll-reveal reveal-fade-in delay-4">
          <div className="stat-pill"><strong>500+</strong> <span>Properties</span></div>
          <div className="stat-divider" />
          <div className="stat-pill"><strong>12k+</strong> <span>Tenants</span></div>
          <div className="stat-divider" />
          <div className="stat-pill"><strong>99.9%</strong> <span>Uptime</span></div>
          <div className="stat-divider" />
          <div className="stat-pill"><strong>₹2Cr+</strong> <span>Processed</span></div>
        </div>

      </main>

      {/* Features Section */}
      <section id="features" className="landing-section">
        <div className="section-badge scroll-reveal reveal-fade-in delay-100">
          <span>WHAT WE OFFER</span>
        </div>
        <h2 className="section-title scroll-reveal reveal-slide-up">
          <span className="reveal-line">
            <span className="reveal-inner"><span className="text-gradient">Features</span></span>
          </span>
        </h2>
        <p className="section-subtitle scroll-reveal reveal-fade-in delay-200">
          A fully integrated hostel management suite engineered to automate operations, simplify onboarding, and streamline billing.
        </p>
        <div className="features-grid">
          {[
            { icon: <Building2 size={24} />, title: 'Multi-Property', desc: 'Manage all hostels from a single unified dashboard.' },
            { icon: <QrCode size={24} />, title: 'QR Onboarding', desc: 'Tenants scan and join instantly — zero friction.' },
            { icon: <Zap size={24} />, title: 'Smart Payments', desc: 'Integrated ledgers and automated rent reminders.' },
            { icon: <BarChart3 size={24} />, title: 'Live Analytics', desc: 'Real-time occupancy, revenue and trend insights.' },
            { icon: <Users size={24} />, title: 'Tenant Portal', desc: 'Dedicated portal for notices, complaints & vacate.' },
            { icon: <Shield size={24} />, title: 'Bank-Grade Security', desc: 'Supabase-powered auth with role-based access.' },
          ].map((f, i) => (
            <div 
              key={i} 
              className={`feature-card glass-panel scroll-reveal reveal-card delay-${(i % 3 + 1) * 100}`}
            >
              <span className="feature-number">0{i + 1}</span>
              <div className="feature-icon-wrapper">
                <div className="feature-icon">{f.icon}</div>
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="landing-section bg-alt">
        <h2 className="section-title scroll-reveal reveal-slide-up">
          <span className="reveal-line">
            <span className="reveal-inner">How It <span className="text-gradient">Works</span></span>
          </span>
        </h2>
        <div className="steps-grid">
          {[
            { step: '01', title: 'Register Property', desc: 'Add your hostel details and configure your rooms and pricing in minutes.' },
            { step: '02', title: 'Generate QR', desc: 'Print your unique QR code and stick it at your reception desk.' },
            { step: '03', title: 'Tenants Scan & Join', desc: 'Tenants scan the QR to fill their details, upload ID, and pay deposit.' },
            { step: '04', title: 'Manage Effortlessly', desc: 'Track everything from a single dashboard. Automated reminders do the rest.' },
          ].map((s, i) => (
            <div key={i} className={`step-card scroll-reveal reveal-card delay-${(i % 4 + 1) * 100}`}>
              <div className="step-number-large">{s.step}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="landing-section">
        <h2 className="section-title scroll-reveal reveal-slide-up">
          <span className="reveal-line">
            <span className="reveal-inner">Trusted By <span className="text-gradient">Owners</span></span>
          </span>
        </h2>
        <div className="testimonials-grid">
          {[
            { quote: "easyPG completely transformed how we run our 5 hostels. The QR onboarding alone saved us hundreds of hours.", name: "Sarah Jenkins", role: "Property Manager", avatar: "SJ" },
            { quote: "The automated payment tracking is a lifesaver. I no longer have to chase tenants or maintain messy Excel sheets.", name: "Rahul Verma", role: "Hostel Owner", avatar: "RV" },
            { quote: "Tenants love the app! They can raise complaints and check their dues instantly. Highly recommended.", name: "Priya Sharma", role: "Admin", avatar: "PS" }
          ].map((t, i) => (
            <div key={i} className={`testimonial-card glass-panel scroll-reveal reveal-card delay-${(i % 3 + 1) * 100}`}>
              <div className="stars">★★★★★</div>
              <p className="quote">"{t.quote}"</p>
              <div className="author-info">
                <div className="author-avatar">{t.avatar}</div>
                <div className="author-details">
                  <h4>{t.name}</h4>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* Founders Section */}
      <section id="founders" className="landing-section">
        <h2 className="section-title scroll-reveal reveal-slide-up">
          <span className="reveal-line">
            <span className="reveal-inner">Behind the <span className="text-gradient">Success</span></span>
          </span>
        </h2>
        <div className="founders-grid">
          <div className={`founder-card scroll-reveal reveal-card delay-100`}>
            <div className="founder-avatar-container">
              <img src="/founder.png" alt="Leela Sai Dasari" className="founder-img" style={{ objectPosition: 'center 25%' }} />
            </div>
            <div className="founder-info">
              <h3>Leela Sai Dasari</h3>
              <span className="founder-role">Project Idea, Designer, Building Project & Team Lead</span>
              <p className="founder-bio">Driving the core vision, crafting intuitive user experiences, leading the development, and architecting the technology behind easyPG.</p>
            </div>
          </div>
          <div className={`founder-card scroll-reveal reveal-card delay-200`}>
            <div className="founder-avatar-container">
              <img src="/cofounder.png" alt="Vamshi Krishna" className="founder-img" />
            </div>
            <div className="founder-info">
              <h3>Vamshi Krishna</h3>
              <span className="founder-role">Building Project & Searching Clients</span>
              <p className="founder-bio">Focused on engineering a robust, scalable platform while actively driving business growth and onboarding new property owners.</p>
            </div>
          </div>
          <div className={`founder-card special-thanks-card scroll-reveal reveal-card delay-300`}>
            <div className="founder-avatar-container">
              <img src="/thanks.png" alt="Ram Charan" className="founder-img" />
            </div>
            <div className="founder-info">
              <h3>Ram Charan</h3>
              <span className="founder-role">Special Thank You</span>
              <p className="founder-bio">A massive thank you for the incredible support, motivation, and guidance that made starting this project a reality.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <img src="/logo.png" alt="easyPG" style={{ height: 32, objectFit: 'contain' }} />
        <span style={{ color: 'var(--text-ghost)', fontSize: '.82rem' }}>© 2026 easyPG. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default LandingPage;
