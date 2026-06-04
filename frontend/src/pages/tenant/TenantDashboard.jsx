import React, { useState } from 'react';
import {
  Home, CreditCard, MessageSquare, ArrowRightCircle, IndianRupee,
  CheckCircle2, RefreshCw, ShieldCheck, LogOut, History, Wifi,
  Utensils, Bell, Zap, Droplets, Wind, Star, Clock, Calendar,
  Phone, Building2, Users, AlertCircle, ChevronRight, Send,
  BedDouble, MapPin, Coffee, Sun, Moon, Sunset, Soup, X,
  BadgeCheck, TrendingUp, FileText, Lock, Trash2, Volume2,
  Cigarette, Flame, Settings, Info, HelpCircle, Award, Hash,
  Loader2, BookOpen, ThumbsUp, TriangleAlert, CheckCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import PageSkeleton from '../../components/ui/SkeletonLoader';
import MobileTenantHeader from '../../components/tenant/MobileTenantHeader';
import MobileTenantBottomNav from '../../components/tenant/MobileTenantBottomNav';
import './TenantDashboard.css';

const CF_ENV = import.meta.env.VITE_CASHFREE_ENV || 'sandbox';
const loadCashfreeSDK = () => new Promise((resolve, reject) => {
  if (window.Cashfree) { resolve(window.Cashfree); return; }
  const s = document.createElement('script');
  s.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
  s.onload = () => resolve(window.Cashfree);
  s.onerror = () => reject(new Error('Failed to load Cashfree'));
  document.body.appendChild(s);
});

const tabs = [
  { id: 'dashboard', label: 'Home',     icon: <Home size={16} /> },
  { id: 'rent',      label: 'Rent',     icon: <CreditCard size={16} /> },
  { id: 'complaints',label: 'Issues',   icon: <MessageSquare size={16} /> },
  { id: 'vacate',    label: 'Vacate',   icon: <ArrowRightCircle size={16} /> },
];

/* ─── Greeting helper ─────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', icon: <Sun size={18} style={{ color: '#fbbf24' }} /> };
  if (h < 17) return { text: 'Good afternoon', icon: <Sunset size={18} style={{ color: '#f97316' }} /> };
  return { text: 'Good evening', icon: <Moon size={18} style={{ color: '#818cf8' }} /> };
}

/* ─── Hostel rules data ──────────────────────────────── */
const HOSTEL_RULES = [
  { icon: <IndianRupee size={18} />, color: '#10b981', bg: 'rgba(16,185,129,0.12)', title: 'Rent Payment', desc: 'Must be paid by the 5th of every month. Late fees apply after the due date.' },
  { icon: <Bell size={18} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', title: 'Notice Period', desc: 'Minimum 10-day advance notice is required before vacating the hostel.' },
  { icon: <Trash2 size={18} />, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', title: 'Cleanliness', desc: 'Keep rooms and common areas tidy. Dispose of waste in designated bins only.' },
  { icon: <Volume2 size={18} />, color: '#c084fc', bg: 'rgba(192,132,252,0.12)', title: 'Quiet Hours', desc: 'Maintain silence between 10:00 PM and 7:00 AM to respect fellow tenants.' },
  { icon: <Zap size={18} />, color: '#34d399', bg: 'rgba(52,211,153,0.12)', title: 'Power Saving', desc: 'Switch off lights, fans, and appliances when leaving your room.' },
  { icon: <Cigarette size={18} />, color: '#f87171', bg: 'rgba(248,113,113,0.12)', title: 'No Smoking', desc: 'Smoking and consumption of illegal substances are strictly prohibited on premises.' },
  { icon: <Users size={18} />, color: '#fb923c', bg: 'rgba(251,146,60,0.12)', title: 'Guests Policy', desc: 'Guest visits must be approved in advance. Overnight stays require owner permission.' },
  { icon: <Lock size={18} />, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', title: 'Security', desc: 'Keep room doors locked when unoccupied. Report lost keys immediately to management.' },
  { icon: <Wifi size={18} />, color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', title: 'WiFi Usage', desc: 'Internet is for personal use only. Illegal downloads or streaming are prohibited.' },
  { icon: <Flame size={18} />, color: '#fb7185', bg: 'rgba(251,113,133,0.12)', title: 'Fire Safety', desc: 'Do not tamper with fire safety equipment. Know the emergency exit routes.' },
];

/* ─── Amenities data ─────────────────────────────────── */
const AMENITIES = [
  { icon: <Wifi size={20} />,      label: 'High-Speed WiFi',     color: '#38bdf8' },
  { icon: <Utensils size={20} />,  label: 'Mess / Cafeteria',    color: '#34d399' },
  { icon: <Droplets size={20} />,  label: '24/7 Water Supply',   color: '#60a5fa' },
  { icon: <Zap size={20} />,       label: 'Power Backup',        color: '#fbbf24' },
  { icon: <Wind size={20} />,      label: 'Air Circulation',     color: '#a78bfa' },
  { icon: <ShieldCheck size={20}/>,label: 'CCTV Security',       color: '#f87171' },
  { icon: <Star size={20} />,      label: 'Laundry Services',    color: '#fb923c' },
  { icon: <Phone size={20} />,     label: '24/7 Support',        color: '#4ade80' },
];

/* ─── Quick action cards ─────────────────────────────── */
const QuickActions = ({ setActiveTab, dueInfo, paymentSuccess }) => (
  <div className="td-quick-actions">
    <button className="td-qa-card" onClick={() => setActiveTab('rent')} id="qa-pay-rent">
      <div className="td-qa-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
        <IndianRupee size={22} />
      </div>
      <span className="td-qa-label">Pay Rent</span>
      {dueInfo && !dueInfo.is_paid && !paymentSuccess && (
        <span className="td-qa-badge">Due</span>
      )}
    </button>
    <button className="td-qa-card" onClick={() => setActiveTab('complaints')} id="qa-raise-issue">
      <div className="td-qa-icon" style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>
        <MessageSquare size={22} />
      </div>
      <span className="td-qa-label">Raise Issue</span>
    </button>
    <button className="td-qa-card" onClick={() => setActiveTab('vacate')} id="qa-vacate">
      <div className="td-qa-icon" style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c' }}>
        <ArrowRightCircle size={22} />
      </div>
      <span className="td-qa-label">Move Out</span>
    </button>
    <button className="td-qa-card" onClick={() => setActiveTab('rent')} id="qa-history">
      <div className="td-qa-icon" style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>
        <History size={22} />
      </div>
      <span className="td-qa-label">History</span>
    </button>
  </div>
);

/* ─── Main component ─────────────────────────────────── */
const TenantDashboard = () => {
  const navigate = useNavigate();
  const [isPaying,        setIsPaying]       = useState(false);
  const [paymentSuccess,  setPaymentSuccess]  = useState(false);
  const [dueInfo,         setDueInfo]         = useState(null);
  const [activeTab, _setActiveTab]            = useState(() => sessionStorage.getItem('tenantActiveTab') || 'dashboard');
  const setActiveTab = (tab) => { _setActiveTab(tab); sessionStorage.setItem('tenantActiveTab', tab); };
  const [complaintText,   setComplaintText]   = useState('');
  const [complaintName,   setComplaintName]   = useState('');
  const [complaintRoom,   setComplaintRoom]   = useState('');
  const [vacateDate,      setVacateDate]      = useState('');
  const [vacateReason,    setVacateReason]    = useState('');
  const [loadingComplaint,setLoadingComplaint]= useState(false);
  const [loadingVacate,   setLoadingVacate]   = useState(false);
  const [dashData,        setDashData]        = useState(null);
  const [loadingConfig,   setLoadingConfig]   = useState(true);
  const [paymentHistory,  setPaymentHistory]  = useState([]);
  const { logoutContext } = useAuth();
  const greeting = getGreeting();

  /* ── current date/time display ── */
  const now  = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  /* ─── Payment URL params ─────────────────────── */
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ps = params.get('payment');
    if (ps === 'success') { toast.success(`Payment successful! Txn: ${params.get('txn')}`); setPaymentSuccess(true); window.history.replaceState({}, '', '/tenant/dashboard'); }
    else if (ps === 'failed') { toast.error(params.get('msg') || 'Payment failed'); window.history.replaceState({}, '', '/tenant/dashboard'); }
    else if (ps === 'error')  { toast.error('Payment error. Try again.'); window.history.replaceState({}, '', '/tenant/dashboard'); }
  }, []);

  /* ─── Fetch dashboard data ───────────────────── */
  React.useEffect(() => {
    const fetchDash = async () => {
      try {
        const res = await api.get('/api/tenant/dashboard');
        const tenant = res.data?.tenant;
        if (!tenant) { setLoadingConfig(false); return; }
        const st = tenant.status;
        if (st === 'new') { navigate('/tenant/join', { replace: true }); return; }
        if (st === 'vacated' || st === 'rejected') {
          toast(st === 'rejected' ? 'Application rejected by owner.' : 'Your stay has ended.', { icon: st === 'rejected' ? '❌' : 'ℹ️' });
          navigate('/tenant/join', { replace: true }); return;
        }
        setDashData(res.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err.message);
      } finally {
        setLoadingConfig(false);
      }
      try {
        const payRes = await api.get('/api/tenant/payments');
        setPaymentHistory(payRes.data?.payments || []);
        setDueInfo(payRes.data?.due || null);
      } catch { /* silent fail */ }
    };
    fetchDash();
  }, []);

  /* ─── Handle payment ─────────────────────────── */
  const handlePayment = async () => {
    const amount = dueInfo?.amount || 0;
    const month  = dueInfo?.month  || new Date().toLocaleString('default', { month: 'long' });
    const year   = dueInfo?.year   || new Date().getFullYear();
    if (!amount || amount <= 0) return toast.error('Rent amount not set. Contact your owner.');
    setIsPaying(true);
    try {
      const res = await api.post('/api/cashfree/create-order', { amount, month, year, type: 'rent' });
      const { payment_session_id, order_id, environment } = res.data;
      await loadCashfreeSDK();
      const cashfree = await window.Cashfree({ mode: environment || 'production' });
      const result = await cashfree.checkout({ paymentSessionId: payment_session_id, redirectTarget: '_modal' });
      const cancelled = result?.error?.code === 'PAYMENT_CANCELLED_BY_USER' || result?.error?.type === 'user_cancelled';
      if (cancelled) { toast('Payment cancelled.', { icon: 'ℹ️' }); return; }
      toast.loading('Verifying...', { id: 'vrfy' });
      try {
        const vRes = await api.post('/api/cashfree/verify', { order_id, amount, month, year });
        toast.dismiss('vrfy');
        if (vRes.data.success) { setPaymentSuccess(true); toast.success('Rent paid successfully! 🎉'); }
        else { toast.error('Verification failed. Contact support.'); }
      } catch { toast.dismiss('vrfy'); toast.error('Verification error. If payment was deducted, contact support.'); }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed');
    } finally { setIsPaying(false); }
  };

  /* ─── Submit complaint ───────────────────────── */
  const submitComplaint = async (e) => {
    e.preventDefault();
    setLoadingComplaint(true);
    try {
      await api.post('/api/tenant/complaints', {
        issue: complaintText,
        tenantName: complaintName || dashData?.tenant?.name,
        roomNumber: complaintRoom || dashData?.tenant?.roomNumber,
      });
      toast.success('Complaint submitted!');
      setComplaintText(''); setComplaintName(''); setComplaintRoom('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoadingComplaint(false); }
  };

  /* ─── Submit vacate ──────────────────────────── */
  const submitVacate = async (e) => {
    e.preventDefault();
    setLoadingVacate(true);
    try {
      await api.post('/api/tenant/vacate', { vacateDate, vacateReason });
      toast.success('Vacate notice submitted.');
      const res = await api.get('/api/tenant/dashboard');
      setDashData(res.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoadingVacate(false); }
  };

  const titleMap = {
    dashboard:  'My Home',
    rent:       'Rent & Dues',
    complaints: 'Help & Support',
    vacate:     'Notice to Vacate',
  };

  /* ─── Loading screen ─────────────────────────── */
  if (loadingConfig) return (
    <div className="dashboard-layout">
      <aside className="sidebar desktop-only-sidebar">
        <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="logo-wrap" title="easyPG">
            <img src="/logo.png" alt="easyPG" style={{ width:36, height:36, objectFit:'contain', borderRadius:6 }} />
          </div>
        </Link>
        <div className="sidebar-divider" />
        <nav className="sidebar-nav">
          {tabs.map(t => (
            <button key={t.id} className={`nav-item ${activeTab===t.id?'active':''}`} title={t.label}>
              {t.icon}<span className="nav-label">{t.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <MobileTenantHeader dashData={null} />
      <MobileTenantBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="dashboard-content fade-in mobile-pb">
        <PageSkeleton type="tenant-dashboard" />
      </main>
    </div>
  );

  /* ─── Pending approval screen ────────────────── */
  if (dashData?.tenant?.status === 'pending') return (
    <div className="td-pending-screen">
      <div className="td-pending-orb">⏳</div>
      <div>
        <h2>Application Under Review</h2>
        <p>Your application has been submitted successfully.<br />The owner is reviewing your details. You'll get full access once approved.</p>
      </div>
      <div className="td-pending-info">
        📋 <strong>Submitted Info:</strong> {dashData.tenant.name} · Room {dashData.tenant.roomNumber || 'N/A'}
      </div>
      <div style={{ display:'flex', gap:'.75rem' }}>
        <button className="btn btn-primary" onClick={() => window.location.reload()}><RefreshCw size={15} /> Refresh Status</button>
        <button className="btn btn-ghost" onClick={logoutContext} style={{ color:'var(--danger)', border:'1px solid rgba(220,38,38,0.2)' }}>Logout</button>
      </div>
    </div>
  );

  /* ─── Main dashboard ─────────────────────────── */
  return (
    <div className="dashboard-layout">
      {/* Desktop sidebar */}
      <aside className="sidebar desktop-only-sidebar">
        <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="logo-wrap" title="easyPG">
            <img src="/logo.png" alt="easyPG" style={{ width:36, height:36, objectFit:'contain', borderRadius:6 }} />
          </div>
        </Link>
        <div className="sidebar-divider" />
        <nav className="sidebar-nav">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`nav-item ${activeTab===t.id?'active':''}`} title={t.label}>
              {t.icon}<span className="nav-label">{t.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <MobileTenantHeader dashData={dashData} />
      <MobileTenantBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="dashboard-content fade-in mobile-pb">


        {/* ══════════ HOME TAB ══════════ */}
        {activeTab === 'dashboard' && (
          <>
            {/* ── Hero Welcome Card ── */}
            <div className="td-hero slide-up">
              <div className="td-hero-bg-orb td-hero-orb-1" />
              <div className="td-hero-bg-orb td-hero-orb-2" />
              <div className="td-hero-left">
                <div className="td-hero-avatar">
                  {dashData?.tenant?.name?.charAt(0)?.toUpperCase() || 'T'}
                </div>
                <div className="td-hero-info">
                  <p className="td-hero-date">{dateStr}</p>
                  <h2 className="td-hero-name">
                    {greeting.icon}&nbsp; {greeting.text}, {dashData?.tenant?.name?.split(' ')[0] || 'Tenant'}!
                  </h2>
                  <p className="td-hero-hostel">
                    <Building2 size={13} /> {dashData?.hostelName || 'Your Hostel'}
                  </p>
                </div>
              </div>
              <div className="td-hero-right">
                <div className="td-hero-badge">
                  <BedDouble size={14} />
                  <span>Room {dashData?.tenant?.roomNumber || 'N/A'}</span>
                </div>
                <div className="td-hero-badge">
                  <Hash size={14} />
                  <span>Bed {dashData?.tenant?.bedNumber || 'N/A'}</span>
                </div>
                <div className={`td-hero-status-badge ${dashData?.tenant?.status === 'active' ? 'active' : 'vacating'}`}>
                  <span className="td-status-dot" />
                  {dashData?.tenant?.status === 'active' ? 'Active' : 'Vacating'}
                </div>
              </div>
            </div>

            {/* ── Rent Status Banner ── */}
            {dueInfo && dueInfo.amount > 0 && !dueInfo.is_paid && !paymentSuccess ? (
              <div className="td-rent-banner td-rent-due slide-up" onClick={() => setActiveTab('rent')} id="rent-due-banner">
                <div className="td-rent-banner-left">
                  <div className="td-rent-icon td-rent-icon-due"><IndianRupee size={22} /></div>
                  <div>
                    <div className="td-rent-banner-title">Rent Due — {dueInfo.month} {dueInfo.year}</div>
                    <div className="td-rent-banner-sub">Tap to pay • Due by {dueInfo.billing_day || 5}th of this month</div>
                  </div>
                </div>
                <div className="td-rent-banner-amount">
                  ₹{dueInfo.amount.toLocaleString('en-IN')}
                  <ChevronRight size={18} />
                </div>
              </div>
            ) : (dueInfo?.is_paid || paymentSuccess) ? (
              <div className="td-rent-banner td-rent-paid slide-up" id="rent-paid-banner">
                <div className="td-rent-banner-left">
                  <div className="td-rent-icon td-rent-icon-paid"><CheckCheck size={22} /></div>
                  <div>
                    <div className="td-rent-banner-title">All Dues Cleared</div>
                    <div className="td-rent-banner-sub">Thanks for paying on time! 🎉</div>
                  </div>
                </div>
                <BadgeCheck size={28} style={{ color:'#34d399', opacity:0.85 }} />
              </div>
            ) : null}

            {/* ── Quick Actions ── */}
            <div className="td-section-label">Quick Actions</div>
            <QuickActions setActiveTab={setActiveTab} dueInfo={dueInfo} paymentSuccess={paymentSuccess} />

            {/* ── Stats Row ── */}
            <div className="td-section-label" style={{ marginTop: '1.5rem' }}>Stay Overview</div>
            <div className="td-stats-row slide-up">
              <div className="td-stat-card">
                <div className="td-stat-icon" style={{ background:'rgba(96,165,250,0.15)', color:'#60a5fa' }}><Calendar size={20} /></div>
                <div className="td-stat-body">
                  <div className="td-stat-label">Check-in Date</div>
                  <div className="td-stat-value">
                    {dashData?.tenant?.join_date
                      ? new Date(dashData.tenant.join_date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
                      : '—'}
                  </div>
                </div>
              </div>
              <div className="td-stat-card">
                <div className="td-stat-icon" style={{ background:'rgba(167,139,250,0.15)', color:'#a78bfa' }}><Clock size={20} /></div>
                <div className="td-stat-body">
                  <div className="td-stat-label">Days Staying</div>
                  <div className="td-stat-value">
                    {dashData?.tenant?.join_date
                      ? Math.max(0, Math.floor((Date.now() - new Date(dashData.tenant.join_date)) / 86400000)) + ' days'
                      : '—'}
                  </div>
                </div>
              </div>
              <div className="td-stat-card">
                <div className="td-stat-icon" style={{ background:'rgba(251,146,60,0.15)', color:'#fb923c' }}><TrendingUp size={20} /></div>
                <div className="td-stat-body">
                  <div className="td-stat-label">Payments Made</div>
                  <div className="td-stat-value">{paymentHistory.filter(p => p.status === 'completed').length}</div>
                </div>
              </div>
              <div className="td-stat-card">
                <div className="td-stat-icon" style={{ background:'rgba(52,211,153,0.15)', color:'#34d399' }}><IndianRupee size={20} /></div>
                <div className="td-stat-body">
                  <div className="td-stat-label">Monthly Rent</div>
                  <div className="td-stat-value">
                    {dueInfo?.total_rent ? `₹${dueInfo.total_rent.toLocaleString('en-IN')}` : dueInfo?.amount ? `₹${dueInfo.amount.toLocaleString('en-IN')}` : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Menu + Notices row ── */}
            <div className="td-two-col">
              {/* Today's Menu */}
              <div className="glass-panel p-6 td-card-anim">
                <div className="td-card-header">
                  <div className="td-card-header-icon" style={{ background:'rgba(251,146,60,0.15)', color:'#fb923c' }}><Utensils size={18} /></div>
                  <h3>Today's Menu</h3>
                  {dashData?.menu?.day && <span className="td-card-tag">{dashData.menu.day}</span>}
                </div>
                {dashData?.menu ? (
                  <div className="td-menu-grid">
                    {[
                      { k:'breakfast', label:'Breakfast', icon:<Coffee size={18} />, color:'#fbbf24', bg:'rgba(251,191,36,0.12)' },
                      { k:'lunch',     label:'Lunch',     icon:<Soup size={18} />,   color:'#34d399', bg:'rgba(52,211,153,0.12)' },
                      { k:'snacks',    label:'Snacks',    icon:<Sun size={18} />,    color:'#f97316', bg:'rgba(249,115,22,0.12)' },
                      { k:'dinner',    label:'Dinner',    icon:<Moon size={18} />,   color:'#a78bfa', bg:'rgba(167,139,250,0.12)' },
                    ].map(m => (
                      <div key={m.k} className="td-menu-item">
                        <div className="td-menu-icon" style={{ background:m.bg, color:m.color }}>{m.icon}</div>
                        <div className="td-menu-details">
                          <span className="td-menu-label">{m.label}</span>
                          <span className="td-menu-dish">{dashData.menu[m.k] || '—'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="td-empty-state">
                    <Utensils size={32} />
                    <p>Menu not updated yet</p>
                  </div>
                )}
              </div>

              {/* Notice Board */}
              <div className="glass-panel p-6 td-card-anim">
                <div className="td-card-header">
                  <div className="td-card-header-icon" style={{ background:'rgba(248,113,113,0.15)', color:'#f87171' }}><Bell size={18} /></div>
                  <h3>Notice Board</h3>
                  {dashData?.notices?.length > 0 && (
                    <span className="td-card-tag td-tag-red">{dashData.notices.length} notice{dashData.notices.length > 1 ? 's' : ''}</span>
                  )}
                </div>
                {dashData?.notices?.length > 0 ? (
                  <div className="td-notices-list">
                    {dashData.notices.map((n, i) => (
                      <div key={n._id || i} className="td-notice-item">
                        <div className="td-notice-dot" />
                        <div className="td-notice-body">
                          <div className="td-notice-title">{n.title}</div>
                          <div className="td-notice-desc">{n.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="td-empty-state">
                    <Bell size={32} />
                    <p>No active notices</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Amenities ── */}
            <div className="glass-panel p-6 td-card-anim slide-up">
              <div className="td-card-header">
                <div className="td-card-header-icon" style={{ background:'rgba(56,189,248,0.15)', color:'#38bdf8' }}><Star size={18} /></div>
                <h3>Hostel Amenities</h3>
              </div>
              <div className="td-amenities-grid">
                {AMENITIES.map((am, i) => (
                  <div key={i} className="td-amenity-item">
                    <div className="td-amenity-icon" style={{ color: am.color }}>{am.icon}</div>
                    <span className="td-amenity-label">{am.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Emergency Contacts ── */}
            <div className="glass-panel p-6 td-card-anim slide-up">
              <div className="td-card-header">
                <div className="td-card-header-icon" style={{ background:'rgba(248,113,113,0.15)', color:'#f87171' }}><Phone size={18} /></div>
                <h3>Emergency & Support</h3>
              </div>
              <div className="td-contacts-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="td-contact-card" style={{ padding: '1.25rem', justifyContent: 'center' }}>
                  <span className="td-contact-emoji" style={{ fontSize: '2rem' }}>📞</span>
                  <div style={{ marginLeft: '0.5rem' }}>
                    <div className="td-contact-title" style={{ fontSize: '0.9rem' }}>Owner / Emergency Support</div>
                    <div className="td-contact-number" style={{ fontSize: '1.2rem', color: 'var(--aurora-1)' }}>
                      {dashData?.ownerPhone || 'Contact Owner via App'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Hostel Rules ── */}
            <div className="glass-panel p-6 td-card-anim slide-up td-rules-section">
              <div className="td-card-header" style={{ marginBottom:'1.5rem' }}>
                <div className="td-card-header-icon" style={{ background:'rgba(124, 58, 237,0.15)', color:'var(--aurora-1)' }}><BookOpen size={18} /></div>
                <h3>Hostel Rules & Regulations</h3>
                <span className="td-card-tag">Important</span>
              </div>
              <div className="td-rules-intro">
                <Info size={16} />
                <p>Please read and follow these rules to ensure a comfortable stay for everyone. Violations may result in penalties or eviction.</p>
              </div>
              <div className="td-rules-grid">
                {HOSTEL_RULES.map((rule, i) => (
                  <div key={i} className="td-rule-card">
                    <div className="td-rule-icon" style={{ background: rule.bg, color: rule.color }}>
                      {rule.icon}
                    </div>
                    <div className="td-rule-body">
                      <div className="td-rule-title">{rule.title}</div>
                      <div className="td-rule-desc">{rule.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="td-rules-footer">
                <ShieldCheck size={16} style={{ color:'var(--aurora-1)' }} />
                <span>By staying here, you agree to abide by all the above rules and regulations.</span>
              </div>
            </div>
          </>
        )}

        {/* ══════════ RENT TAB ══════════ */}
        {activeTab === 'rent' && (
          <div className="td-rent-tab slide-up">
            {/* Payment Card */}
            <div className="glass-panel p-8 td-payment-card-new">
              <div className="td-payment-hero">
                <div className="td-payment-hero-icon">
                  <IndianRupee size={32} />
                </div>
                <div>
                  <h2 style={{ marginBottom:'.25rem' }}>
                    {dueInfo?.month || ''} {dueInfo?.year || ''} Rent
                  </h2>
                  {dueInfo?.billing_day && (
                    <p style={{ fontSize:'.85rem', color:'var(--text-dim)' }}>
                      Due on <strong style={{ color:'var(--text-bright)' }}>{dueInfo.billing_day}th</strong> of every month
                    </p>
                  )}
                </div>
              </div>

              {dueInfo?.is_paid || paymentSuccess ? (
                <div className="td-payment-success-state">
                  <div className="td-payment-success-orb">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3>Payment Completed!</h3>
                  <p>Receipt sent to your registered WhatsApp & email.</p>
                  <div className="td-payment-success-badge">✅ All dues cleared for this month</div>
                </div>
              ) : (
                <>
                  <div className="td-payment-amount-display">
                    <span className="td-payment-currency">₹</span>
                    <span className="td-payment-amount-big">
                      {(dueInfo?.amount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="td-payment-breakdown">
                    <div className="td-breakdown-row">
                      <span>Monthly Rent</span>
                      <span>₹{(dueInfo?.amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="td-breakdown-row">
                      <span>Late Fee</span>
                      <span style={{ color:'var(--success)' }}>₹0</span>
                    </div>
                    <div className="td-breakdown-divider" />
                    <div className="td-breakdown-row td-breakdown-total">
                      <span>Total Due</span>
                      <span>₹{(dueInfo?.amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <button
                    id="pay-now-btn"
                    className="btn btn-primary btn-lg w-full"
                    onClick={handlePayment}
                    disabled={isPaying || !dueInfo?.amount}
                    style={{ marginTop:'1.5rem' }}
                  >
                    {isPaying ? (
                      <><Loader2 size={18} className="animate-spin" /> Processing...</>
                    ) : dueInfo?.amount
                      ? `Pay ₹${dueInfo.amount.toLocaleString('en-IN')} Now`
                      : 'Rent not configured'}
                  </button>
                  <p style={{ fontSize:'.78rem', color:'var(--text-ghost)', textAlign:'center', marginTop:'.75rem' }}>
                    🔒 Secured & encrypted via Cashfree Payments
                  </p>
                </>
              )}
            </div>

            {/* Payment History */}
            <div className="glass-panel p-6 td-history-section">
              <div className="td-card-header" style={{ marginBottom:'1.25rem' }}>
                <div className="td-card-header-icon" style={{ background:'rgba(167,139,250,0.15)', color:'#a78bfa' }}><History size={18} /></div>
                <h3>Payment History</h3>
                <span className="td-card-tag">{paymentHistory.length} records</span>
              </div>
              {paymentHistory.length > 0 ? (
                <div className="td-history-list">
                  {paymentHistory.map(pay => (
                    <div key={pay.id} className="td-history-item">
                      <div className="td-history-icon-wrap">
                        {pay.status === 'completed' ? <CheckCircle2 size={18} style={{ color:'#34d399' }} /> : <AlertCircle size={18} style={{ color:'#fbbf24' }} />}
                      </div>
                      <div className="td-history-meta">
                        <span className="td-history-month">{pay.month} {pay.year}</span>
                        <span className="td-history-date">{new Date(pay.paid_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                      </div>
                      <div className="td-history-right">
                        <span className="td-history-amount">₹{pay.amount.toLocaleString()}</span>
                        <span className={`status-pill ${pay.status}`}>{pay.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="td-empty-state">
                  <FileText size={36} />
                  <p>No payment history found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════ COMPLAINTS TAB ══════════ */}
        {activeTab === 'complaints' && (
          <div className="td-complaints-tab slide-up">
            <div className="glass-panel p-8 td-complaint-card">
              <div className="td-card-header" style={{ marginBottom:'1.5rem' }}>
                <div className="td-card-header-icon" style={{ background:'rgba(248,113,113,0.15)', color:'#f87171' }}><MessageSquare size={18} /></div>
                <h3>Raise a Complaint</h3>
              </div>
              <div className="td-complaint-info-box">
                <HelpCircle size={16} />
                <p>Describe your issue in detail. Our team will review and respond within 24 hours.</p>
              </div>
              <form onSubmit={submitComplaint}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Your Name</label>
                    <input className="form-control" id="complaint-name" placeholder={dashData?.tenant?.name || 'Full name'} value={complaintName} onChange={e => setComplaintName(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Room Number</label>
                    <input className="form-control" id="complaint-room" placeholder={dashData?.tenant?.roomNumber || 'e.g. 101'} value={complaintRoom} onChange={e => setComplaintRoom(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Issue Category</label>
                  <select className="form-control" id="complaint-category">
                    <option>Maintenance / Repair</option>
                    <option>Cleanliness</option>
                    <option>Water Supply</option>
                    <option>Electricity</option>
                    <option>WiFi / Internet</option>
                    <option>Noise Complaint</option>
                    <option>Security</option>
                    <option>Food / Mess</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Describe the Issue</label>
                  <textarea id="complaint-text" className="form-control" rows="5" placeholder="Describe your issue in detail — be specific about the location, time, and nature of the problem..." value={complaintText} onChange={e => setComplaintText(e.target.value)} required />
                </div>
                <button id="submit-complaint-btn" type="submit" className="btn btn-danger w-full" disabled={loadingComplaint}>
                  {loadingComplaint ? (
                    <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                  ) : (
                    <><Send size={16} /> Submit Complaint</>
                  )}
                </button>
              </form>
            </div>

            {/* Tips card */}
            <div className="glass-panel p-6 td-tips-card">
              <div className="td-card-header" style={{ marginBottom:'1rem' }}>
                <div className="td-card-header-icon" style={{ background:'rgba(251,191,36,0.15)', color:'#fbbf24' }}><ThumbsUp size={18} /></div>
                <h3>Tips for Faster Resolution</h3>
              </div>
              <ul className="td-tips-list">
                <li>📍 Mention the exact location (room, floor, common area)</li>
                <li>🕐 Include the time / frequency of the issue</li>
                <li>📸 If possible, attach a photo (contact warden directly)</li>
                <li>✅ Mark urgent issues as high-priority in the description</li>
              </ul>
            </div>
          </div>
        )}

        {/* ══════════ VACATE TAB ══════════ */}
        {activeTab === 'vacate' && (
          <div className="td-vacate-tab slide-up">
            {dashData?.tenant?.status === 'vacating' ? (
              <div className="glass-panel p-8 td-vacate-active-card">
                <div className="td-vacate-active-orb">
                  <CheckCircle2 size={40} />
                </div>
                <h2 style={{ color:'var(--warning)', marginBottom:'.5rem' }}>Vacate Notice Active</h2>
                <p style={{ color:'var(--text-dim)', marginBottom:'1rem' }}>
                  You are scheduled to vacate on{' '}
                  <strong style={{ color:'var(--text-bright)' }}>
                    {new Date(dashData.tenant.vacateDate).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
                  </strong>
                </p>
                <div className="td-vacate-reason-box">
                  <FileText size={16} style={{ color:'var(--text-dim)' }} />
                  <span>Reason: "{dashData.tenant.vacateReason}"</span>
                </div>
                <p style={{ fontSize:'.82rem', color:'var(--text-ghost)', marginTop:'1rem' }}>
                  Contact your owner if you wish to modify or cancel this notice.
                </p>
              </div>
            ) : (
              <>
                <div className="glass-panel p-8 td-vacate-form-card">
                  <div className="td-card-header" style={{ marginBottom:'1.25rem' }}>
                    <div className="td-card-header-icon" style={{ background:'rgba(251,146,60,0.15)', color:'#fb923c' }}><ArrowRightCircle size={18} /></div>
                    <h3>Initiate Move Out</h3>
                  </div>
                  <div className="td-vacate-warning-box">
                    <TriangleAlert size={16} />
                    <p>A minimum <strong>10-day notice period</strong> is required before vacating. This cannot be undone once submitted — contact the owner to modify.</p>
                  </div>
                  <form onSubmit={submitVacate}>
                    <div className="form-group">
                      <label className="form-label">Expected Vacate Date</label>
                      <input id="vacate-date" type="date" className="form-control" value={vacateDate} onChange={e => setVacateDate(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Reason for Leaving</label>
                      <textarea id="vacate-reason" className="form-control" rows="3" placeholder="Relocating, graduated, personal reasons, etc." value={vacateReason} onChange={e => setVacateReason(e.target.value)} required />
                    </div>
                    <button id="submit-vacate-btn" type="submit" className="btn w-full btn-lg" style={{ background:'var(--warning)', color:'#000', fontWeight:700 }} disabled={loadingVacate}>
                      {loadingVacate ? (
                        <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                      ) : (
                        <><ArrowRightCircle size={16} /> Submit Move-Out Notice</>
                      )}
                    </button>
                  </form>
                </div>

                {/* What to expect */}
                <div className="glass-panel p-6 td-vacate-info-card">
                  <div className="td-card-header" style={{ marginBottom:'1rem' }}>
                    <div className="td-card-header-icon" style={{ background:'rgba(96,165,250,0.15)', color:'#60a5fa' }}><Info size={18} /></div>
                    <h3>What Happens Next?</h3>
                  </div>
                  <div className="td-vacate-steps">
                    <div className="td-vacate-step">
                      <div className="td-vacate-step-num">1</div>
                      <div>
                        <strong>Notice Submitted</strong>
                        <p>Your vacate request is sent to the owner for review.</p>
                      </div>
                    </div>
                    <div className="td-vacate-step">
                      <div className="td-vacate-step-num">2</div>
                      <div>
                        <strong>Owner Acknowledgement</strong>
                        <p>Owner confirms your move-out date and conducts room inspection.</p>
                      </div>
                    </div>
                    <div className="td-vacate-step">
                      <div className="td-vacate-step-num">3</div>
                      <div>
                        <strong>Security Deposit</strong>
                        <p>Deposit is refunded after deducting any applicable damages.</p>
                      </div>
                    </div>
                    <div className="td-vacate-step">
                      <div className="td-vacate-step-num">4</div>
                      <div>
                        <strong>Move Out</strong>
                        <p>Return keys and complete the check-out process on your vacate date.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TenantDashboard;
