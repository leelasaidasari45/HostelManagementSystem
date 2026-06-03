import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, IndianRupee, Eye, ListFilter, Search, LogOut, Phone, ShieldCheck, Mail, Calendar, Settings, BedDouble } from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await api.get('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        toast.error('Session expired or unauthorized');
        sessionStorage.removeItem('admin_token');
        navigate('/admin/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    toast.success('Logged out successfully');
    navigate('/admin/login', { replace: true });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)', color: 'var(--text-bright)', flexDirection: 'column', gap: '1rem'
      }}>
        <div className="spinner" style={{
          width: 40, height: 40, border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--aurora-1)', borderRadius: '50%', animation: 'spin 1s linear infinite'
        }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-ghost)', fontWeight: 600 }}>Loading easyPG Administration...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!stats) return null;

  // Filtered Leads
  const filteredLeads = stats.leads.filter(lead => {
    const q = searchTerm.toLowerCase();
    return (lead.name || '').toLowerCase().includes(q) || (lead.phone || '').toLowerCase().includes(q);
  });

  // Filtered Users
  const filteredUsers = stats.users.filter(user => {
    const q = searchTerm.toLowerCase();
    return (user.name || '').toLowerCase().includes(q) || 
           (user.email || '').toLowerCase().includes(q) || 
           (user.phone || '').toLowerCase().includes(q);
  });

  // KPI calculations
  const totalUsers = stats.users.length;
  const totalOwners = stats.users.filter(u => u.role === 'owner').length;
  const totalTenants = stats.users.filter(u => u.role === 'tenant').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '2rem 1.5rem', position: 'relative' }}>
      {/* Background Orbs */}
      <div className="orb orb-1" style={{ top: '-10%', left: '-10%', opacity: 0.15 }} />
      <div className="orb orb-2" style={{ bottom: '-10%', right: '-10%', opacity: 0.15 }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', zIndex: 10, position: 'relative' }}>
        
        {/* Header Block */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-muted)', paddingBottom: '1.25rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--text-bright)' }}>easyPG Platform Admin</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-ghost)', margin: '0.2rem 0 0' }}>Comprehensive platform metrics, user analysis, and revenue insights.</p>
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.6rem 1.25rem',
            borderRadius: 12, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
          }}>
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>

        {/* KPI Summaries */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          
          <div className="stat-card" style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-muted)', borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-ghost)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04m' }}>Platform Revenue</span>
              <IndianRupee size={18} style={{ color: 'var(--success)' }} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-bright)' }}>₹{stats.revenue.totalPlatformRevenue.toLocaleString('en-IN')}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-ghost)' }}>{stats.revenue.activeSubscriptionsCount} Active Subscriptions</span>
          </div>

          <div className="stat-card" style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-muted)', borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-ghost)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04m' }}>Tenant Rent Volume</span>
              <IndianRupee size={18} style={{ color: 'var(--aurora-1)' }} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-bright)' }}>₹{stats.revenue.totalTenantRentVolume.toLocaleString('en-IN')}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-ghost)' }}>{stats.revenue.completedRentPaymentsCount} Payments Transacted</span>
          </div>

          <div className="stat-card" style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-muted)', borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-ghost)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04m' }}>Captured Leads</span>
              <ListFilter size={18} style={{ color: '#fbbf24' }} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-bright)' }}>{stats.leads.length}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-ghost)' }}>Landing Form submissions</span>
          </div>

          <div className="stat-card" style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-muted)', borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-ghost)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04m' }}>Total Users</span>
              <Users size={18} style={{ color: '#60a5fa' }} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-bright)' }}>{totalUsers}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-ghost)' }}>{totalOwners} Owners | {totalTenants} Tenants</span>
          </div>

          <div className="stat-card" style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-muted)', borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-ghost)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04m' }}>Page Traffic</span>
              <Eye size={18} style={{ color: '#f43f5e' }} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-bright)' }}>{stats.totalVisits}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-ghost)' }}>Cumulative application views</span>
          </div>

        </div>

        {/* Tab Navigator & Search Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {[['leads', `Leads (${stats.leads.length})`], ['users', `Users (${totalUsers})`], ['payments', 'Sub. Payments'], ['traffic', 'Traffic / Analytics']].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setSearchTerm(''); }}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontSize: '1rem', fontWeight: activeTab === id ? 700 : 500,
                    color: activeTab === id ? 'var(--aurora-1)' : 'var(--text-ghost)',
                    paddingBottom: '0.75rem', borderBottom: activeTab === id ? '2px solid var(--aurora-1)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Inline search bar (only for Leads and Users) */}
            {(activeTab === 'leads' || activeTab === 'users') && (
              <div className="search-container" style={{ maxWidth: 300, width: '100%', margin: 0 }}>
                <Search size={16} style={{ color: 'var(--text-ghost)' }} />
                <input
                  type="text"
                  className="search-input"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* TABLE / DETAILS DISPLAY */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-muted)', borderRadius: 20, padding: '1.5rem', overflowX: 'auto' }}>
            
            {/* LEADS TAB */}
            {activeTab === 'leads' && (
              <div>
                {filteredLeads.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-ghost)' }}>
                    No leads found matching "{searchTerm}"
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-muted)', color: 'var(--text-ghost)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '0.85rem' }}>Name</th>
                        <th style={{ padding: '0.85rem' }}>Mobile Number</th>
                        <th style={{ padding: '0.85rem' }}>Hostel Capacity</th>
                        <th style={{ padding: '0.85rem' }}>Submission Date</th>
                        <th style={{ padding: '0.85rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.92rem' }}>
                          <td style={{ padding: '1rem 0.85rem', fontWeight: 600, color: 'var(--text-bright)' }}>{lead.name}</td>
                          <td style={{ padding: '1rem 0.85rem' }}>
                            <a href={`tel:${lead.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--aurora-1)', textDecoration: 'none', fontWeight: 600 }}>
                              <Phone size={13} />
                              <span>{lead.phone}</span>
                            </a>
                          </td>
                          <td style={{ padding: '1rem 0.85rem' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                              <BedDouble size={14} style={{ color: 'var(--text-ghost)' }} />
                              <span>{lead.hostel_capacity || 'N/A'} beds</span>
                            </span>
                          </td>
                          <td style={{ padding: '1rem 0.85rem', color: 'var(--text-dim)' }}>
                            {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '1rem 0.85rem', textAlign: 'right' }}>
                            <a href={`https://wa.me/91${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{
                              padding: '0.4rem 0.85rem', borderRadius: 8, background: 'rgba(34, 197, 94, 0.08)',
                              border: '1px solid rgba(34, 197, 94, 0.15)', color: '#22c55e', textDecoration: 'none',
                              fontSize: '0.8rem', fontWeight: 700
                            }}>
                              WhatsApp
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div>
                {filteredUsers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-ghost)' }}>
                    No users found matching "{searchTerm}"
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 700 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-muted)', color: 'var(--text-ghost)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '0.85rem' }}>User Info</th>
                        <th style={{ padding: '0.85rem' }}>Role</th>
                        <th style={{ padding: '0.85rem' }}>Phone</th>
                        <th style={{ padding: '0.85rem' }}>Joined Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.92rem' }}>
                          <td style={{ padding: '1rem 0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div style={{
                                width: 34, height: 34, borderRadius: '50%',
                                background: user.role === 'owner' ? 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))' : 'linear-gradient(135deg, #fde047, #06b6d4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.85rem', fontWeight: 800, color: '#fff'
                              }}>
                                {(user.name || 'U')[0].toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-bright)' }}>{user.name || 'Unnamed User'}</div>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-ghost)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                  <Mail size={11} />
                                  <span>{user.email}</span>
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '1rem 0.85rem' }}>
                            <span style={{
                              padding: '0.15rem 0.5rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                              textTransform: 'uppercase', border: '1px solid',
                              background: user.role === 'owner' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(253, 224, 71, 0.08)',
                              borderColor: user.role === 'owner' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(253, 224, 71, 0.2)',
                              color: user.role === 'owner' ? '#a78bfa' : '#60a5fa'
                            }}>
                              {user.role}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 0.85rem', fontWeight: 500 }}>{user.phone || 'N/A'}</td>
                          <td style={{ padding: '1rem 0.85rem', color: 'var(--text-dim)' }}>
                            {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === 'payments' && (
              <div>
                {stats.revenue.platformSubsHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-ghost)' }}>
                    No subscription transactions recorded yet.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 700 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-muted)', color: 'var(--text-ghost)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '0.85rem' }}>Owner ID</th>
                        <th style={{ padding: '0.85rem' }}>Plan</th>
                        <th style={{ padding: '0.85rem' }}>Amount</th>
                        <th style={{ padding: '0.85rem' }}>Status</th>
                        <th style={{ padding: '0.85rem' }}>Transaction Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.revenue.platformSubsHistory.map((sub, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.92rem' }}>
                          <td style={{ padding: '1rem 0.85rem', color: 'var(--text-bright)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {sub.owner_id}
                          </td>
                          <td style={{ padding: '1rem 0.85rem', fontWeight: 600 }}>{sub.plan_name}</td>
                          <td style={{ padding: '1rem 0.85rem', fontWeight: 700, color: 'var(--text-bright)' }}>₹{sub.amount.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '1rem 0.85rem' }}>
                            <span style={{
                              padding: '0.15rem 0.5rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                              textTransform: 'uppercase', border: '1px solid',
                              background: sub.status === 'active' || sub.status === 'trial' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                              borderColor: sub.status === 'active' || sub.status === 'trial' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: sub.status === 'active' || sub.status === 'trial' ? '#34d399' : '#f87171'
                            }}>
                              {sub.status}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 0.85rem', color: 'var(--text-dim)' }}>
                            {new Date(sub.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* TRAFFIC TAB */}
            {activeTab === 'traffic' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontFamily: "'Space Grotesk', sans-serif" }}>Recent Navigation Hits (Last 100)</h3>
                  {stats.recentVisits.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-ghost)' }}>No visits logged yet.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {stats.recentVisits.map((visit, idx) => (
                        <div key={idx} style={{
                          padding: '0.85rem 1rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-muted)',
                          borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                              padding: '0.2rem 0.45rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--aurora-1)',
                              borderRadius: 6, fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase'
                            }}>GET</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-bright)' }}>{visit.page}</span>
                          </div>
                          <span style={{ color: 'var(--text-ghost)', fontSize: '0.78rem' }}>
                            {new Date(visit.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
