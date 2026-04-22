import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, BuildingIcon, MessageSquare, Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHostel } from '../../context/HostelContext';
import api from '../../api';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import OwnerHeader from '../../components/owner/OwnerHeader';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import './OwnerDashboard.css';

const OwnerDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingNotice, setLoadingNotice] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);

  const { activeHostel, loadingHostels } = useHostel();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (loadingHostels) return;

      if (!activeHostel) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get(`/api/owner/analytics?hostelId=${activeHostel._id}`);
        setAnalytics(res.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [activeHostel, loadingHostels]);

  if (loadingHostels) {
    return <div className="flex justify-center items-center h-screen"><Loader2 size={48} className="animate-spin text-accent" /></div>;
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <OwnerSidebar />

      {/* Main Content */}
      <main className="dashboard-content fade-in">
        <OwnerHeader 
          title="Overview" 
          subtitle="Managing" 
        />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={48} className="animate-spin text-accent" />
          </div>
        ) : !analytics?.hostel ? (
          <div className="glass-panel p-8 text-center" style={{ marginTop: '4rem' }}>
            <BuildingIcon size={64} className="mx-auto text-muted mb-4" />
            <h3 className="mb-2">No Property Found</h3>
            <p className="text-muted mb-6">You need to create your first hostel to view analytics.</p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.href = '/owner/create-hostel'}
            >
              Setup New Hostel
            </button>
          </div>
        ) : (
          <>
            <div className="stats-grid grid gap-6 mb-8">
              <div className="stat-card glass-panel">
                <p className="text-muted">Total Collection</p>
                <h3>₹ {analytics.metrics.totalCollection.toLocaleString()}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span style={{ color: analytics.metrics.collectionTrend >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: '0.875rem' }}>
                    {analytics.metrics.collectionTrend >= 0 ? '+' : ''}{analytics.metrics.collectionTrend}% this month
                  </span>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    (Last: ₹{analytics.metrics.lastMonthCollection.toLocaleString()})
                  </span>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <p className="text-muted">Total Tenants</p>
                <h3>{analytics.metrics.totalTenants}</h3>
                <span style={{ color: 'var(--success)', fontSize: '0.875rem' }}>Active Tenants</span>
              </div>
              <div className="stat-card glass-panel">
                <p className="text-muted">Occupancy Rate</p>
                <h3>{analytics.metrics.occupancyRate}%</h3>
                <span>{analytics.metrics.availableRooms} Rooms available</span>
              </div>
            </div>

            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              {/* Notice Board Widget */}
              <div className="glass-panel p-6">
                <h3 className="mb-4">Post Notice</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target;
                  setLoadingNotice(true);
                  try {
                    await api.post(`/api/owner/notices?hostelId=${activeHostel._id}`, {
                      title: form.title.value,
                      message: form.message.value
                    });
                    toast.success("Notice Posted to Tenants!");
                    form.reset();
                  } catch (err) { toast.error("Failed to post notice") }
                  finally { setLoadingNotice(false); }
                }}>
                  <div className="form-group mb-2">
                    <input name="title" type="text" className="form-control" placeholder="Notice Title" required />
                  </div>
                  <div className="form-group">
                    <textarea name="message" className="form-control" rows="3" placeholder="Message body..." required></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary w-full" disabled={loadingNotice}>
                    {loadingNotice ? <Loader2 size={16} className="animate-spin inline mr-2" /> : null}
                    {loadingNotice ? "Posting..." : "Broadcast"}
                  </button>
                </form>
              </div>

              {/* Daily Menu Widget */}
              <div className="glass-panel p-6">
                <h3 className="mb-4">Update Today's Menu</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target;
                  const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                  setLoadingMenu(true);
                  try {
                    await api.put(`/api/owner/menu?hostelId=${activeHostel._id}`, {
                      day,
                      breakfast: form.breakfast.value,
                      lunch: form.lunch.value,
                      snacks: form.snacks.value,
                      dinner: form.dinner.value
                    });
                    toast.success(`Menu updated for ${day}!`);
                    form.reset();
                  } catch (err) { toast.error("Failed to update menu") }
                  finally { setLoadingMenu(false); }
                }}>
                  <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <input name="breakfast" type="text" className="form-control" placeholder="Breakfast" required />
                    <input name="lunch" type="text" className="form-control" placeholder="Lunch" required />
                    <input name="snacks" type="text" className="form-control" placeholder="Snacks" required />
                    <input name="dinner" type="text" className="form-control" placeholder="Dinner" required />
                  </div>
                  <button type="submit" className="btn btn-secondary w-full mt-4" disabled={loadingMenu}>
                    {loadingMenu ? <Loader2 size={16} className="animate-spin inline mr-2" /> : null}
                    {loadingMenu ? "Saving..." : "Save Menu"}
                  </button>
                </form>
              </div>

              {/* Share Property Widget */}
              <div className="glass-panel p-6 border-accent" style={{ border: '1px solid rgba(249, 115, 22, 0.3)', background: 'rgba(249, 115, 22, 0.02)' }}>
                <h3 className="mb-2">Share Property QR</h3>
                <p className="text-muted mb-4 small">Tenants can scan this to join instantly.</p>
                <div className="bg-white p-3 rounded-lg w-fit mx-auto mb-4">
                  <QRCodeSVG 
                    value={`${window.location.origin}/tenant/join?code=${activeHostel.code}`}
                    size={140}
                  />
                </div>
                <div className="text-center">
                  <span className="text-xs text-muted block mb-1">Hostel Code</span>
                  <div className="font-bold text-xl tracking-widest mb-3" style={{ color: '#f97316' }}>{activeHostel.code}</div>
                  <button 
                    className="btn btn-primary w-full btn-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/tenant/join?code=${activeHostel.code}`);
                      toast.success("Join Link Copied!");
                    }}
                  >
                    Copy Join Link
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;


