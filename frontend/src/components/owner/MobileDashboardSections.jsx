import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, DoorOpen, Bell, Utensils, MessageSquare, QrCode, ChevronDown, Coins, ClipboardList, Key, Eye, Wrench, X, Send, CheckCircle2, Clock, CreditCard, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import './MobileDashboardSections.css';

/* ─── Trial Countdown Banner ─── */
const TrialCountdownBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeInfo, setTimeInfo] = useState(null);

  useEffect(() => {
    if (!user?.trial_end_date || user?.subscription_status !== 'trial') return;

    const compute = () => {
      const end = new Date(user.trial_end_date);
      const diff = end - Date.now();
      if (diff <= 0) { setTimeInfo({ expired: true }); return; }

      const totalHours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(totalHours / 24);
      const hours = totalHours % 24;
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeInfo({ days, hours, minutes, expired: false });
    };

    compute();
    const id = setInterval(compute, 60000);
    return () => clearInterval(id);
  }, [user]);

  if (!timeInfo || user?.subscription_status !== 'trial') return null;

  // Color based on urgency
  const urgent = timeInfo.days === 0;          // < 1 day
  const warning = timeInfo.days <= 1;          // 1 day
  const color   = urgent  ? '#ef4444'
                : warning ? '#f97316'
                :           '#7c3aed';
  const bg      = urgent  ? 'rgba(239,68,68,0.10)'
                : warning ? 'rgba(249,115,22,0.10)'
                :           'rgba(124, 58, 237,0.10)';
  const border  = urgent  ? 'rgba(239,68,68,0.25)'
                : warning ? 'rgba(249,115,22,0.25)'
                :           'rgba(124, 58, 237,0.25)';

  const label = timeInfo.expired
    ? 'Trial Expired'
    : timeInfo.days > 0
      ? `${timeInfo.days}d ${timeInfo.hours}h left`
      : `${timeInfo.hours}h ${timeInfo.minutes}m left`;

  const Icon = urgent ? AlertTriangle : Clock;

  return (
    <div style={{
      margin: '0 0 12px 0',
      padding: '12px 14px',
      borderRadius: 14,
      background: bg,
      border: `1px solid ${border}`,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      {/* Icon */}
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: `rgba(${urgent ? '239,68,68' : warning ? '249,115,22' : '124, 58, 237'},0.15)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={18} style={{ color }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.78rem', color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
          {timeInfo.expired ? '⚠️ Trial Expired' : '⏳ Free Trial'}
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-bright)', lineHeight: 1.2 }}>
          {timeInfo.expired ? 'Access locked' : label}
        </div>
        {!timeInfo.expired && (
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 2 }}>
            Trial ends {new Date(user.trial_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate('/owner/billing')}
        style={{
          flexShrink: 0,
          padding: '7px 12px',
          borderRadius: 8,
          border: 'none',
          background: color,
          color: '#fff',
          fontSize: '0.75rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          whiteSpace: 'nowrap',
        }}
      >
        <CreditCard size={13} /> Upgrade
      </button>
    </div>
  );
};

const MobileDashboardSections = ({ analytics, activeHostel }) => {
  const now = new Date();
  const currentMonth = now.toLocaleString('default', { month: 'short' });
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(now.getMonth() - 1);
  const lastMonthName = lastMonthDate.toLocaleString('default', { month: 'short' });

  const [activeSlide, setActiveSlide] = React.useState(0);
  const carouselRef = React.useRef(null);
  const carouselWidthRef = React.useRef(0);

  // Cache carousel width to prevent layout thrashing inside onScroll
  useEffect(() => {
    const updateWidth = () => {
      if (carouselRef.current) {
        carouselWidthRef.current = carouselRef.current.clientWidth;
      }
    };
    updateWidth();
    // Use a small timeout to make sure element is fully rendered if width is 0
    if (carouselWidthRef.current === 0) {
      setTimeout(updateWidth, 100);
    }
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const width = carouselWidthRef.current || carouselRef.current.clientWidth || 300;
      const newIndex = Math.round(scrollLeft / width);
      setActiveSlide((prev) => {
        if (prev !== newIndex) {
          return newIndex;
        }
        return prev;
      });
    }
  };

  // Modal states
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [loadingNotice, setLoadingNotice] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [noticeSuccess, setNoticeSuccess] = useState(false);
  const [menuSuccess, setMenuSuccess] = useState(false);
  const [noticeForm, setNoticeForm] = useState({ title: '', message: '' });
  const [menuForm, setMenuForm] = useState({ breakfast: '', lunch: '', snacks: '', dinner: '' });

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!activeHostel) return toast.error('No hostel selected');
    setLoadingNotice(true);
    try {
      await api.post(`/api/owner/notices?hostelId=${activeHostel._id}`, {
        title: noticeForm.title,
        message: noticeForm.message,
      });
      setNoticeSuccess(true);
      toast.success('Notice broadcasted to all tenants! 📢');
      setTimeout(() => {
        setNoticeSuccess(false);
        setShowNoticeModal(false);
        setNoticeForm({ title: '', message: '' });
      }, 2000);
    } catch {
      toast.error('Failed to post notice');
    } finally {
      setLoadingNotice(false);
    }
  };

  const handleUpdateMenu = async (e) => {
    e.preventDefault();
    if (!activeHostel) return toast.error('No hostel selected');
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    setLoadingMenu(true);
    try {
      await api.put(`/api/owner/menu?hostelId=${activeHostel._id}`, {
        day,
        breakfast: menuForm.breakfast,
        lunch: menuForm.lunch,
        snacks: menuForm.snacks,
        dinner: menuForm.dinner,
      });
      setMenuSuccess(true);
      toast.success(`Menu updated for ${day}! 🍽️`);
      setTimeout(() => {
        setMenuSuccess(false);
        setShowMenuModal(false);
        setMenuForm({ breakfast: '', lunch: '', snacks: '', dinner: '' });
      }, 2000);
    } catch {
      toast.error('Failed to update menu');
    } finally {
      setLoadingMenu(false);
    }
  };

  return (
    <div className="mobile-only-sections">

      {/* ── Trial Countdown Banner (always visible during trial) ── */}
      <TrialCountdownBanner />

      {/* Summary Section */}
      <section className="dashboard-section summary-section">
        <div className="summary-header">
          <h2 className="summary-title">{currentMonth} Collection Status</h2>
        </div>
        
        <div className="summary-cards-scroll">
          <div className="summary-card">
            <div className="sc-top">
              <span className="sc-value green">₹{analytics?.metrics?.totalCollection?.toLocaleString() || 0}</span>
            </div>
            <div className="sc-bottom">
              <span className="sc-label">{currentMonth}'s<br/>Collection</span>
              <Coins size={14} className="sc-icon green" />
            </div>
          </div>

          <div className="summary-card">
            <div className="sc-top">
              <span className="sc-value green">₹{analytics?.metrics?.lastMonthCollection?.toLocaleString() || 0}</span>
            </div>
            <div className="sc-bottom">
              <span className="sc-label">{lastMonthName}'s<br/>Collection</span>
              <Coins size={14} className="sc-icon green" />
            </div>
          </div>

          <div className="summary-card">
            <div className="sc-top">
              <span className="sc-value red">₹{analytics?.metrics?.totalDues?.toLocaleString() || 0}</span>
            </div>
            <div className="sc-bottom">
              <span className="sc-label">{currentMonth}'s<br/>Dues</span>
              <ClipboardList size={14} className="sc-icon red" />
            </div>
          </div>
        </div>
      </section>

      {/* Hostel Access Credentials */}
      {activeHostel && (
        <section className="dashboard-section mt-4">
          <h2 className="section-title">Property Access</h2>
          <div className="credentials-card">
            <div className="credentials-left">
              <span className="cred-badge">Active Code</span>
              <h3>{activeHostel.name || 'Hostel Code'}</h3>
              <div className="code-display-wrapper">
                <span className="code-val">{activeHostel.code}</span>
                <button 
                  className="copy-btn-mini" 
                  onClick={() => { 
                    navigator.clipboard.writeText(`${window.location.origin}/tenant/join?code=${activeHostel.code}`); 
                    toast.success('Join link copied!'); 
                  }}
                >
                  Copy Link
                </button>
              </div>
              <p className="cred-desc">Share this code or QR with tenants to join.</p>
            </div>
            <div className="credentials-right">
              <div className="qr-container-mini">
                <QRCodeSVG 
                  value={`${window.location.origin}/tenant/join?code=${activeHostel.code}`} 
                  size={75} 
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="dashboard-section mt-4">
        <h2 className="section-title">Quick Links</h2>
        <div className="quick-actions-scroll">
          <Link to="/owner/tenants" className="qa-item">
            <div className="qa-icon" style={{ color: '#8b5cf6' }}>
              <Users size={24} />
            </div>
            <span>Tenants</span>
          </Link>
          <Link to="/owner/rooms" className="qa-item">
            <div className="qa-icon" style={{ color: '#10b981' }}>
              <DoorOpen size={24} />
            </div>
            <span>Rooms</span>
          </Link>
          <div className="qa-item" onClick={() => setShowNoticeModal(true)}>
            <div className="qa-icon" style={{ color: '#f59e0b' }}>
              <Bell size={24} />
            </div>
            <span>Notice</span>
          </div>
          <div className="qa-item" onClick={() => setShowMenuModal(true)}>
            <div className="qa-icon" style={{ color: '#ec4899' }}>
              <Utensils size={24} />
            </div>
            <span>Add Menu</span>
          </div>
          <Link to="/owner/complaints" className="qa-item">
            <div className="qa-icon" style={{ color: '#ef4444' }}>
              <MessageSquare size={24} />
            </div>
            <span>Complaints</span>
          </Link>
        </div>
      </section>

      {/* What's New carousel */}
      <section className="dashboard-section">
        <h2 className="section-title">What's New</h2>
        <div className="features-carousel" ref={carouselRef} onScroll={handleScroll}>
          <div className="feature-banner banner-purple">
            <div className="feature-badge" style={{ color: '#6366f1', background: 'var(--bg-base)' }}>
              <span className="dot" style={{ background: '#10b981' }}></span> New Feature
            </div>
            <h3>Never Miss Tenants With<br/><span style={{ background: '#4f46e5', color: '#fff', padding: '2px 8px', borderRadius: '8px' }}>QR Onboarding</span></h3>
            <p style={{ marginBottom: '1rem' }}>Tenants scan and join instantly without manual entry.</p>
            <div className="feature-btn">Generate QR</div>
          </div>
          <div className="feature-banner banner-blue">
            <div className="feature-badge" style={{ color: '#2563eb', background: 'var(--bg-base)' }}>
              <span className="dot" style={{ background: '#10b981' }}></span> New Feature
            </div>
            <h3>Never Miss Rent With<br/><span style={{ background: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: '8px' }}>Autopay</span></h3>
            <p style={{ marginBottom: '1rem' }}>Set up automatic monthly rent payments easily.</p>
            <div className="feature-btn">Activate Now</div>
          </div>
          <div className="feature-banner banner-green">
            <div className="feature-badge" style={{ color: '#059669', background: 'var(--bg-base)' }}>
              <span className="dot" style={{ background: '#10b981' }}></span> Now Live
            </div>
            <h3>Smart<br/><span style={{ background: '#059669', color: '#fff', padding: '2px 8px', borderRadius: '8px' }}>Tenant Tracking</span></h3>
            <p style={{ marginBottom: '1rem' }}>Track all dues and collections automatically.</p>
            <div className="feature-btn">Track Now</div>
          </div>
        </div>
        <div className="carousel-dots">
          <span className={`carousel-dot ${activeSlide === 0 ? 'active' : ''}`} onClick={() => { const el = carouselRef.current; if (el) el.scrollTo({ left: 0, behavior: 'smooth' }); }}></span>
          <span className={`carousel-dot ${activeSlide === 1 ? 'active' : ''}`} onClick={() => { const el = carouselRef.current; if (el) el.scrollTo({ left: el.getBoundingClientRect().width, behavior: 'smooth' }); }}></span>
          <span className={`carousel-dot ${activeSlide === 2 ? 'active' : ''}`} onClick={() => { const el = carouselRef.current; if (el) el.scrollTo({ left: el.getBoundingClientRect().width * 2, behavior: 'smooth' }); }}></span>
        </div>
      </section>

      {/* Help & Support */}
      <section className="dashboard-section">
        <h2 className="section-title">Help & Support</h2>
        <a href="https://wa.me/917569621094" target="_blank" rel="noopener noreferrer" className="community-banner">
          <div className="community-content">
            <div className="live-badge" style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#25d366' }}>
              <span className="dot" style={{ background: '#25d366' }}></span> Active Support
            </div>
            <h3>Need Help?</h3>
            <div className="wa-channel-badge">
              <MessageSquare size={16} /> Chat on WhatsApp
            </div>
            <p>Connect with our support team instantly on WhatsApp</p>
          </div>
          <div className="wa-icon-large">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </div>
        </a>
      </section>

      {/* Smart Automations */}
      <section className="dashboard-section pb-8">
        <h2 className="section-title">Smart Automations</h2>
        <div className="smart-automations-scroll">
          <div className="smart-item"><div className="smart-icon-wrapper" style={{ color: '#f97316' }}><QrCode size={24} /></div><span>QR Onboard</span></div>
          <div className="smart-item"><div className="smart-icon-wrapper" style={{ color: '#8b5cf6' }}><Key size={24} /></div><span>Hostel Codes</span></div>
          <div className="smart-item"><div className="smart-icon-wrapper" style={{ color: '#10b981' }}><Bell size={24} /></div><span>Rent Remind</span></div>
          <div className="smart-item"><div className="smart-icon-wrapper" style={{ color: '#6366f1' }}><Eye size={24} /></div><span>Room Visible</span></div>
          <div className="smart-item"><div className="smart-icon-wrapper" style={{ color: '#ef4444' }}><Wrench size={24} /></div><span>Complaints Hub</span></div>
        </div>
      </section>

      {/* ═══ NOTICE MODAL ═══ */}
      {showNoticeModal && (
        <div className="ql-modal-backdrop" onClick={() => !loadingNotice && setShowNoticeModal(false)}>
          <div className="ql-modal-card slide-up" onClick={e => e.stopPropagation()}>
            <div className="ql-modal-header notice-header">
              <div className="ql-modal-icon notice-icon"><Bell size={22} /></div>
              <div className="ql-modal-header-text">
                <h3 className="ql-modal-title">Post a Notice</h3>
                <p className="ql-modal-subtitle">Broadcast to all tenants instantly</p>
              </div>
              <button className="ql-close-btn" onClick={() => !loadingNotice && setShowNoticeModal(false)}>
                <X size={20} />
              </button>
            </div>

            {noticeSuccess ? (
              <div className="ql-success-state">
                <CheckCircle2 size={48} style={{ color: 'var(--success)' }} />
                <h4>Notice Broadcasted!</h4>
                <p>All tenants can see your notice now.</p>
              </div>
            ) : (
              <form onSubmit={handlePostNotice} className="ql-modal-form">
                <div className="ql-form-group">
                  <label className="ql-label">Notice Title</label>
                  <input
                    type="text"
                    className="ql-input"
                    placeholder="e.g. Water supply off tomorrow"
                    value={noticeForm.title}
                    onChange={e => setNoticeForm(p => ({ ...p, title: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>
                <div className="ql-form-group">
                  <label className="ql-label">Message</label>
                  <textarea
                    className="ql-input ql-textarea"
                    rows={4}
                    placeholder="Write your full notice message here..."
                    value={noticeForm.message}
                    onChange={e => setNoticeForm(p => ({ ...p, message: e.target.value }))}
                    required
                  />
                </div>
                <button type="submit" className="ql-submit-btn notice-submit" disabled={loadingNotice}>
                  {loadingNotice ? (
                    <span className="pulse-opacity">
                      Broadcasting
                      <span className="pulsing-dot-container">
                        <span className="pulsing-dot"></span>
                        <span className="pulsing-dot"></span>
                        <span className="pulsing-dot"></span>
                      </span>
                    </span>
                  ) : (
                    <><Send size={16} /> Broadcast Notice</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ═══ MENU MODAL ═══ */}
      {showMenuModal && (
        <div className="ql-modal-backdrop" onClick={() => !loadingMenu && setShowMenuModal(false)}>
          <div className="ql-modal-card slide-up" onClick={e => e.stopPropagation()}>
            <div className="ql-modal-header menu-header">
              <div className="ql-modal-icon menu-icon"><Utensils size={22} /></div>
              <div className="ql-modal-header-text">
                <h3 className="ql-modal-title">Today's Menu</h3>
                <p className="ql-modal-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              </div>
              <button className="ql-close-btn" onClick={() => !loadingMenu && setShowMenuModal(false)}>
                <X size={20} />
              </button>
            </div>

            {menuSuccess ? (
              <div className="ql-success-state">
                <CheckCircle2 size={48} style={{ color: 'var(--success)' }} />
                <h4>Menu Updated!</h4>
                <p>Tenants can now see today's menu.</p>
              </div>
            ) : (
              <form onSubmit={handleUpdateMenu} className="ql-modal-form">
                <div className="ql-form-group">
                  <label className="ql-label">Breakfast</label>
                  <input
                    type="text"
                    className="ql-input"
                    placeholder="e.g. Idli, Sambar, Vada"
                    value={menuForm.breakfast}
                    onChange={e => setMenuForm(p => ({ ...p, breakfast: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>
                <div className="ql-form-group">
                  <label className="ql-label">Lunch</label>
                  <input
                    type="text"
                    className="ql-input"
                    placeholder="e.g. Rice, Dal, Veggies"
                    value={menuForm.lunch}
                    onChange={e => setMenuForm(p => ({ ...p, lunch: e.target.value }))}
                    required
                  />
                </div>
                <div className="ql-form-group">
                  <label className="ql-label">Snacks</label>
                  <input
                    type="text"
                    className="ql-input"
                    placeholder="e.g. Tea & Biscuits"
                    value={menuForm.snacks}
                    onChange={e => setMenuForm(p => ({ ...p, snacks: e.target.value }))}
                    required
                  />
                </div>
                <div className="ql-form-group">
                  <label className="ql-label">Dinner</label>
                  <input
                    type="text"
                    className="ql-input"
                    placeholder="e.g. Chapati, Curry"
                    value={menuForm.dinner}
                    onChange={e => setMenuForm(p => ({ ...p, dinner: e.target.value }))}
                    required
                  />
                </div>
                <button type="submit" className="ql-submit-btn menu-submit" disabled={loadingMenu}>
                  {loadingMenu ? (
                    <span className="pulse-opacity">
                      Saving Menu
                      <span className="pulsing-dot-container">
                        <span className="pulsing-dot"></span>
                        <span className="pulsing-dot"></span>
                        <span className="pulsing-dot"></span>
                      </span>
                    </span>
                  ) : (
                    <><Utensils size={16} /> Save Today's Menu</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default MobileDashboardSections;
