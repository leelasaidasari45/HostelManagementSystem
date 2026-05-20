import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Loader2, TrendingUp, TrendingDown, Users, DoorOpen, IndianRupee, Plus, Bell, Utensils } from 'lucide-react';
import { useHostel } from '../../context/HostelContext';
import api from '../../api';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import OwnerHeader from '../../components/owner/OwnerHeader';
import MobileOwnerHeader from '../../components/owner/MobileOwnerHeader';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import MobileDashboardSections from '../../components/owner/MobileDashboardSections';
import './OwnerDashboard.css';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingNotice, setLoadingNotice] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const { activeHostel, loadingHostels } = useHostel();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (loadingHostels) return;
      if (!activeHostel) { setLoading(false); return; }
      try {
        setLoading(true);
        const res = await api.get(`/api/owner/analytics?hostelId=${activeHostel._id}`);
        setAnalytics(res.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load analytics');
      } finally { setLoading(false); }
    };
    fetchAnalytics();
  }, [activeHostel, loadingHostels]);

  if (loadingHostels) return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 size={40} className="animate-spin" style={{ color: 'var(--aurora-1)' }} />
    </div>
  );

  return (
    <div className="dashboard-layout">
      <OwnerSidebar />
      <MobileOwnerHeader />
      <main className="dashboard-content fade-in mobile-pb">
        <div className="desktop-only-widgets">
          <OwnerHeader title="Overview" subtitle="Managing" />
        </div>

        {!activeHostel ? (
          <div className="glass-panel p-8 text-center" style={{ maxWidth: 480, margin: '4rem auto' }}>
            <div style={{ width:72, height:72, background:'rgba(124,58,237,0.12)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem' }}>
              <Building2 size={36} style={{ color: 'var(--aurora-1)' }} />
            </div>
            <h3 style={{ marginBottom:'.75rem' }}>No Property Found</h3>
            <p style={{ color:'var(--text-dim)', marginBottom:'1.5rem' }}>Create your first hostel to start managing tenants and view analytics.</p>
            <button className="btn btn-primary" onClick={() => navigate('/owner/create-hostel')}>
              <Plus size={16} /> Setup New Hostel
            </button>
          </div>
        ) : (
          <>
            {/* KPI Stats (Desktop Only) */}
            <div className="stats-grid slide-up desktop-only-widgets">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="stat-card" style={{ opacity: 0.7 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ width: 100, height: 16, background: 'var(--bg-elevated)', borderRadius: 4 }}></div>
                      <div style={{ width: 18, height: 18, background: 'var(--bg-elevated)', borderRadius: '50%' }}></div>
                    </div>
                    <div style={{ width: 140, height: 32, background: 'var(--bg-elevated)', borderRadius: 6, margin: '0.5rem 0' }}></div>
                    <div style={{ width: 80, height: 14, background: 'var(--bg-elevated)', borderRadius: 4 }}></div>
                  </div>
                ))
              ) : (
                <>
              <div className="stat-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <p>Total Collection</p>
                  <IndianRupee size={18} style={{ color:'var(--aurora-1)' }} />
                </div>
                <h3>₹{analytics.metrics.totalCollection.toLocaleString()}</h3>
                <span className={`stat-trend ${analytics.metrics.collectionTrend < 0 ? 'down' : ''}`}>
                  {analytics.metrics.collectionTrend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {' '}{analytics.metrics.collectionTrend >= 0 ? '+' : ''}{analytics.metrics.collectionTrend}% this month
                </span>
              </div>
              <div className="stat-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <p>Active Tenants</p>
                  <Users size={18} style={{ color:'var(--aurora-2)' }} />
                </div>
                <h3>{analytics.metrics.totalTenants}</h3>
                <span className="stat-trend">Currently active</span>
              </div>
              <div className="stat-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <p>Occupancy Rate</p>
                  <DoorOpen size={18} style={{ color:'var(--aurora-3)' }} />
                </div>
                <h3>{analytics.metrics.occupancyRate}%</h3>
                <span className="stat-trend">{analytics.metrics.availableRooms} rooms available</span>
              </div>
                </>
              )}
            </div>

            {/* Mobile Specific Sections (Hidden on Desktop) */}
            <MobileDashboardSections analytics={loading ? null : analytics} />

            {/* Widget row (Hidden on Mobile) */}
            <div className="grid gap-6 desktop-only-widgets" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))' }}>
              {loading ? (
                <div className="flex justify-center items-center h-64 w-full" style={{ gridColumn: '1 / -1' }}>
                  <Loader2 size={40} className="animate-spin" style={{ color: 'var(--aurora-1)' }} />
                </div>
              ) : (
                <>
              {/* Notice */}
              <div className="glass-panel p-6 slide-up">
                <div style={{ display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'1.25rem' }}>
                  <Bell size={18} style={{ color:'var(--aurora-1)' }} />
                  <h3 style={{ fontSize:'1rem', margin:0 }}>Post Notice</h3>
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target; setLoadingNotice(true);
                  try {
                    await api.post(`/api/owner/notices?hostelId=${activeHostel._id}`, { title: form.title.value, message: form.message.value });
                    toast.success('Notice broadcasted!'); form.reset();
                  } catch { toast.error('Failed to post notice'); }
                  finally { setLoadingNotice(false); }
                }}>
                  <div className="form-group">
                    <input name="title" type="text" className="form-control" placeholder="Notice title" required />
                  </div>
                  <div className="form-group">
                    <textarea name="message" className="form-control" rows="3" placeholder="Message body..." required></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary w-full" disabled={loadingNotice}>
                    {loadingNotice ? <Loader2 size={15} className="animate-spin" /> : <Bell size={15} />}
                    {loadingNotice ? 'Posting...' : 'Broadcast Notice'}
                  </button>
                </form>
              </div>

              {/* Menu */}
              <div className="glass-panel p-6 slide-up delay-100">
                <div style={{ display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'1.25rem' }}>
                  <Utensils size={18} style={{ color:'var(--aurora-3)' }} />
                  <h3 style={{ fontSize:'1rem', margin:0 }}>Today's Menu</h3>
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target;
                  const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                  setLoadingMenu(true);
                  try {
                    await api.put(`/api/owner/menu?hostelId=${activeHostel._id}`, { day, breakfast: form.breakfast.value, lunch: form.lunch.value, snacks: form.snacks.value, dinner: form.dinner.value });
                    toast.success(`Menu updated for ${day}!`); form.reset();
                  } catch { toast.error('Failed to update menu'); }
                  finally { setLoadingMenu(false); }
                }}>
                  <div className="grid gap-2" style={{ gridTemplateColumns:'1fr 1fr', marginBottom:'.75rem' }}>
                    {['breakfast','lunch','snacks','dinner'].map(m => (
                      <input key={m} name={m} type="text" className="form-control" placeholder={m.charAt(0).toUpperCase()+m.slice(1)} required />
                    ))}
                  </div>
                  <button type="submit" className="btn btn-secondary w-full" disabled={loadingMenu}>
                    {loadingMenu ? <Loader2 size={15} className="animate-spin" /> : null}
                    {loadingMenu ? 'Saving...' : 'Save Menu'}
                  </button>
                </form>
              </div>

              {/* QR */}
              <div className="glass-panel p-6 slide-up delay-200" style={{ border:'1px solid rgba(249,115,22,0.2)', background:'rgba(249,115,22,0.03)' }}>
                <h3 style={{ fontSize:'1rem', marginBottom:'.5rem' }}>Property QR Code</h3>
                <p style={{ color:'var(--text-dim)', fontSize:'.85rem', marginBottom:'1.25rem' }}>Tenants scan to join instantly.</p>
                <div style={{ background:'#fff', padding:'.75rem', borderRadius:10, width:'fit-content', margin:'0 auto 1rem' }}>
                  <QRCodeSVG value={`${window.location.origin}/tenant/join?code=${activeHostel.code}`} size={130} />
                </div>
                <div style={{ textAlign:'center', marginBottom:'1rem' }}>
                  <span style={{ fontSize:'.72rem', color:'var(--text-dim)' }}>Hostel Code</span>
                  <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'1.4rem', fontWeight:700, color:'#f97316', letterSpacing:'.12em' }}>{activeHostel.code}</div>
                </div>
                <button className="btn btn-primary w-full btn-sm" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/tenant/join?code=${activeHostel.code}`); toast.success('Link copied!'); }}>
                  Copy Join Link
                </button>
              </div>
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;
