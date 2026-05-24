import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, QrCode, Zap, Shield, BarChart3, Users, Rocket, Menu, X, ArrowUpRight, Mail, Phone, LifeBuoy } from 'lucide-react';
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

  // Framer-style card spotlight hover effect for features and support grids
  React.useEffect(() => {
    const handleMouseMove = (e, grid) => {
      const cards = grid.querySelectorAll('.feature-card, .support-card');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    };

    const grids = document.querySelectorAll('.features-grid, .support-grid');
    const listeners = [];

    grids.forEach(grid => {
      const listener = (e) => handleMouseMove(e, grid);
      grid.addEventListener('mousemove', listener);
      listeners.push({ grid, listener });
    });

    return () => {
      listeners.forEach(({ grid, listener }) => {
        grid.removeEventListener('mousemove', listener);
      });
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
              <a href="#support" className="nav-link contact-us-link">Contact Us</a>
            </div>
            <div className="nav-actions">
              <ThemeToggle />
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">
                Get Started <ArrowRight size={14} />
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
              <a href="#support" className="mobile-nav-link contact-us-link" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</a>
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
            <span className="reveal-inner">Core <span className="text-gradient">Features</span></span>
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
            <span className="reveal-inner">Developed <span className="text-gradient">By</span></span>
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
              <span className="founder-role">Marketing & Support Manager</span>
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

      {/* Support Section */}
      <section id="support" className="landing-section bg-alt">
        <div className="section-badge scroll-reveal reveal-fade-in delay-100">
          <span>HELP & ASSISTANCE</span>
        </div>
        <h2 className="section-title scroll-reveal reveal-slide-up">
          <span className="reveal-line">
            <span className="reveal-inner">Support <span className="text-gradient">Center</span></span>
          </span>
        </h2>
        <p className="section-subtitle scroll-reveal reveal-fade-in delay-200">
          Got questions? Our support team is here to help you get the most out of easyPG. Contact us directly or browse our resources.
        </p>

        <div className="support-grid">
          <a href="mailto:easypghms@gmail.com" className="support-card email-card glass-panel scroll-reveal reveal-card delay-100">
            <div className="support-icon-wrapper">
              <Mail size={24} />
            </div>
            <h3>Email Support</h3>
            <p>Send us your queries and get detailed help from our team.</p>
            <span className="support-link">easypghms@gmail.com</span>
          </a>

          <a href="tel:+917569621094" className="support-card call-card glass-panel scroll-reveal reveal-card delay-200">
            <div className="support-icon-wrapper">
              <Phone size={24} />
            </div>
            <h3>Direct Call</h3>
            <p>Speak directly to our operations team for immediate assistance.</p>
            <span className="support-link">+91 75696 21094</span>
          </a>

          <a href="https://wa.me/917569621094" target="_blank" rel="noopener noreferrer" className="support-card whatsapp-card glass-panel scroll-reveal reveal-card delay-300">
            <div className="support-icon-wrapper">
              <svg size={24} viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.859 0c3.166.001 6.142 1.233 8.38 3.472 2.238 2.239 3.467 5.216 3.466 8.386-.003 6.536-5.328 11.86-11.859 11.86-2.007-.001-3.98-.513-5.735-1.488L0 24zm6.59-4.862c1.63.967 3.39 1.478 5.24 1.479 5.541 0 10.051-4.509 10.054-10.052.002-2.685-1.042-5.21-2.94-7.11C17.043 1.543 14.517.498 11.84.498c-5.543 0-10.053 4.51-10.056 10.056-.001 1.838.48 3.633 1.39 5.226L2.146 20.89l5.093-1.336c1.17.653 2.45.992 3.75.992zM17.06 13.88c-.282-.143-1.67-.823-1.929-.917-.259-.095-.448-.143-.637.14-.19.284-.736.918-.901 1.11-.165.193-.33.217-.613.073-.282-.14-1.192-.44-2.27-1.4-.84-.75-1.406-1.675-1.57-1.96-.165-.285-.018-.44.124-.58.127-.128.282-.33.424-.496.142-.165.19-.283.283-.472.09-.19.047-.355-.024-.497-.07-.143-.637-1.533-.873-2.102-.23-.554-.462-.48-.637-.488-.164-.008-.353-.01-.542-.01-.19 0-.495.07-.754.353-.259.284-1 .978-1 2.387 0 1.41 1.025 2.77 1.166 2.96.142.19 2.017 3.08 4.887 4.316.684.296 1.218.473 1.635.604.687.218 1.312.187 1.806.114.55-.08 1.67-.68 1.905-1.34.236-.658.236-1.223.165-1.34-.07-.118-.259-.19-.541-.333z" />
              </svg>
            </div>
            <h3>WhatsApp Chat</h3>
            <p>Connect with us instantly on WhatsApp for quick query resolution.</p>
            <span className="support-link">+91 75696 21094</span>
          </a>
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
