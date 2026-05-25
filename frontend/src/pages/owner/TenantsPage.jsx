import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Search, X, Phone, Home, Hash, Car, Calendar, FileText, IndianRupee, User, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import toast from 'react-hot-toast';
import { useHostel } from '../../context/HostelContext';
import OwnerHeader from '../../components/owner/OwnerHeader';
import MobileOwnerHeader from '../../components/owner/MobileOwnerHeader';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import PageSkeleton, { SkeletonRect } from '../../components/ui/SkeletonLoader';
import './OwnerDashboard.css';

const getPaymentBadgeStyle = (status) => {
  switch (status) {
    case 'paid':
      return {
        background: 'rgba(16, 185, 129, 0.12)',
        color: '#10b981',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        padding: '0.15rem 0.5rem',
        borderRadius: '99px',
        fontSize: '0.72rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        display: 'inline-flex',
        alignItems: 'center'
      };
    case 'partial':
      return {
        background: 'rgba(245, 158, 11, 0.12)',
        color: '#f59e0b',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        padding: '0.15rem 0.5rem',
        borderRadius: '99px',
        fontSize: '0.72rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        display: 'inline-flex',
        alignItems: 'center'
      };
    case 'unpaid':
    default:
      return {
        background: 'rgba(239, 68, 68, 0.12)',
        color: '#ef4444',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        padding: '0.15rem 0.5rem',
        borderRadius: '99px',
        fontSize: '0.72rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        display: 'inline-flex',
        alignItems: 'center'
      };
  }
};

const TenantsPage = () => {
  const { activeHostel, hostels, switchHostel, loadingHostels, tenants, setTenants } = useHostel();
  const [loading, setLoading] = useState(tenants.length === 0);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenantPayments, setTenantPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'dues'
  const [modalTab, setModalTab] = useState('profile'); // 'profile', 'payments', 'actions'
  const { logoutContext } = useAuth();

  // Reset loading when hostel changes to prevent displaying stale property data
  useEffect(() => {
    setLoading(true);
  }, [activeHostel?._id]);

  const fetchTenants = async () => {
    if (loadingHostels) return;
    if (!activeHostel) {
      setLoading(false);
      return;
    }
    try {
      if (tenants.length === 0) {
        setLoading(true);
      }
      const res = await api.get(`/api/owner/tenants?hostelId=${activeHostel._id}`);
      setTenants(res.data);
    } catch (err) {
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [activeHostel?._id, loadingHostels]);

  // Fetch payment history when a tenant is selected
  const openTenantDetail = async (tenant) => {
    setSelectedTenant(tenant);
    setModalTab('profile');
    setTenantPayments([]);
    if (!tenant?.tenant_id) return;
    setLoadingPayments(true);
    try {
      const res = await api.get(`/api/owner/tenant-payments/${tenant.tenant_id}`);
      setTenantPayments(res.data || []);
    } catch {
      setTenantPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const getFooterStatusMessage = () => {
    if (!selectedTenant) return { text: '', icon: null };
    if (selectedTenant.due_amount > 0) {
      return {
        text: 'Payment Not Done',
        icon: <AlertCircle size={14} />,
        bg: 'rgba(239, 68, 68, 0.08)',
        color: '#ef4444',
        border: '1px solid rgba(239, 68, 68, 0.15)'
      };
    }
    if (!selectedTenant.aadhaarFile) {
      return {
        text: 'Aadhaar Document Missing',
        icon: <AlertCircle size={14} />,
        bg: 'rgba(245, 158, 11, 0.08)',
        color: '#f59e0b',
        border: '1px solid rgba(245, 158, 11, 0.15)'
      };
    }
    return {
      text: 'Payment Completed',
      icon: <CheckCircle size={14} />,
      bg: 'rgba(16, 185, 129, 0.08)',
      color: '#10b981',
      border: '1px solid rgba(16, 185, 129, 0.15)'
    };
  };

  const filteredTenants = React.useMemo(() => {
    return tenants.filter(t => {
      const q = searchTerm.toLowerCase();
      const name = (t.user?.name || t.fatherName || "").toLowerCase();
      const room = (t.roomNumber || "").toString().toLowerCase();
      return name.includes(q) || room.includes(q);
    });
  }, [tenants, searchTerm]);

  const pendingTenants = React.useMemo(() => filteredTenants.filter(t => t.status === 'pending'), [filteredTenants]);
  const activeTenants = React.useMemo(() => filteredTenants.filter(t => t.status === 'active' || t.status === 'vacating'), [filteredTenants]);
  const duesTenants = React.useMemo(() => activeTenants.filter(t => (t.due_amount || 0) > 0), [activeTenants]);

  if (loadingHostels || loading) {
    return (
      <div className="dashboard-layout">
        <OwnerSidebar />
        <MobileOwnerHeader />
        <main className="dashboard-content fade-in mobile-pb">
          <div className="desktop-only-widgets">
            <OwnerHeader
              title="Tenants Management"
              subtitle="Approve and manage residents"
            />
          </div>
          <h2 className="mobile-page-title">Tenants Management</h2>
          <PageSkeleton type="tenants" />
        </main>
      </div>
    );
  }

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/owner/tenants/${id}/approve`);
      toast.success("Tenant Approved & Assigned!");
      fetchTenants(); // Re-fetch list
    } catch (err) {
      toast.error('Failed to approve tenant');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this application?")) return;
    try {
      await api.put(`/api/owner/tenants/${id}/reject`);
      toast.success("Application Rejected");
      fetchTenants();
    } catch (err) {
      toast.error('Failed to reject application');
    }
  };

  const handleVacate = async (id) => {
    if (!window.confirm("Mark this tenant as vacated? This frees up bed space.")) return;
    try {
      await api.put(`/api/owner/tenants/${id}/vacate`);
      toast.success("Tenant marked as vacated");
      fetchTenants();
    } catch (err) {
      toast.error('Failed to process vacate');
    }
  };

  const handleCompleteVacate = async (id) => {
    if (!window.confirm("Are you sure you want to forcibly evict or complete the move-out? This will lock the tenant out, remove them from this list, and free up the room capacity securely.")) return;
    try {
      await api.put(`/api/owner/tenants/${id}/vacate_complete`);
      toast.success("Tenant marked as vacated and room capacity freed.");
      fetchTenants();
    } catch (err) {
      toast.error("Failed to process move out");
    }
  };

  const handleAadhaarDownload = async (filePath, tenantName) => {
    try {
      const response = await fetch(`/${filePath.replace(/\\/g, '/')}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const extension = filePath.split('.').pop();
      link.download = `aadhaar_${tenantName.replace(/\s+/g, '_')}.${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Download started!");
    } catch (err) {
      toast.error("Failed to download file");
    }
  };

  return (
    <div className="dashboard-layout" style={selectedTenant ? { display: 'block' } : {}}>
      {/* Sidebar */}
      {!selectedTenant && (
        <OwnerSidebar />
      )}

      <MobileOwnerHeader />

      <main className="dashboard-content fade-in mobile-pb">
        <div className="desktop-only-widgets">
          <OwnerHeader
            title="Tenants Management"
            subtitle="Approve and manage residents"
          />
        </div>

        <h2 className="mobile-page-title">Tenants Management</h2>

        <div>
            {/* Summary Metrics Row */}
            <div style={{ 
              display: 'flex', 
              gap: '0.85rem', 
              justifyContent: 'center', 
              maxWidth: 600, 
              width: '100%', 
              margin: '0 auto 1.5rem auto' 
            }}>
              {/* Card 1: Total Tenants Present */}
              <div style={{
                flex: 1,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-muted)',
                borderRadius: 16,
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--aurora-1)',
                  padding: '0.5rem',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-ghost)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Present Tenants</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-bright)' }}>{activeTenants.length}</div>
                </div>
              </div>

              {/* Card 2: Tenants with Dues */}
              <div style={{
                flex: 1,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-muted)',
                borderRadius: 16,
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  padding: '0.5rem',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IndianRupee size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-ghost)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Tenants Due</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ef4444' }}>{duesTenants.length}</div>
                </div>
              </div>
            </div>

            {/* Redesigned Search Bar */}
            <div style={{ display:'flex', justifyContent:'center', marginBottom:'1.5rem' }}>
              <div className="search-container" style={{ maxWidth:600, width:'100%' }}>
                <Search size={18} style={{ color:'var(--text-dim)', flexShrink:0 }} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name or room number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} style={{ background:'transparent', border:'none', color:'var(--text-dim)', cursor:'pointer', display:'flex' }}>
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Pending Approvals */}
            {pendingTenants.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-4 flex items-center gap-2">
                  <Users size={20} color="var(--warning)" /> Pending Approvals
                </h3>
                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                  {pendingTenants.map(t => (
                    <div key={t._id} className="glass-panel p-4 slide-up" style={{ border: '1px solid rgba(217,119,6,0.3)', background:'rgba(217,119,6,0.04)' }}>
                      <h4 className="mb-1">{t.user?.name || t.fatherName || "Incoming Tenant"}</h4>
                      <p className="text-muted" style={{ fontSize: '0.875rem' }}>Phone: {t.mobile}</p>
                      <p className="text-muted" style={{ fontSize: '0.875rem' }}>Expected Join: <strong>{new Date(t.admissionDate).toLocaleDateString()}</strong></p>
                      <p className="text-muted" style={{ fontSize: '0.875rem' }}>Requested Room: <strong>{t.roomNumber}</strong></p>

                      <div className="flex justify-between items-center mt-4" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                        <button className="btn" style={{ padding: '0.5rem', background: 'transparent', color: 'var(--accent-primary)', fontSize: '0.85rem', flexShrink: 0 }} onClick={() => openTenantDetail(t)}>
                          View Details
                        </button>
                        <div className="flex gap-2" style={{ flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
                          <button className="btn" style={{ padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', flex: 1, minWidth: '100px' }} onClick={() => handleApprove(t._id)}>
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button className="btn" style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', flex: 1, minWidth: '100px' }} onClick={() => handleReject(t._id)}>
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Selector */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '0.5rem' }}>
              <button
                onClick={() => setActiveTab('active')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: activeTab === 'active' ? 'var(--aurora-1)' : 'var(--text-ghost)',
                  fontSize: '1.05rem',
                  fontWeight: activeTab === 'active' ? '700' : '500',
                  cursor: 'pointer',
                  paddingBottom: '0.5rem',
                  borderBottom: activeTab === 'active' ? '2px solid var(--aurora-1)' : 'none',
                  marginBottom: '-0.5rem',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <CheckCircle size={18} color={activeTab === 'active' ? 'var(--success)' : 'var(--text-ghost)'} />
                <span>Active Residents</span>
                <span style={{
                  fontSize: '0.75rem',
                  background: activeTab === 'active' ? 'rgba(16, 185, 129, 0.12)' : 'var(--border-subtle)',
                  color: activeTab === 'active' ? '#10b981' : 'var(--text-ghost)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 99,
                  fontWeight: 700
                }}>
                  {activeTenants.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('dues')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: activeTab === 'dues' ? 'var(--aurora-1)' : 'var(--text-ghost)',
                  fontSize: '1.05rem',
                  fontWeight: activeTab === 'dues' ? '700' : '500',
                  cursor: 'pointer',
                  paddingBottom: '0.5rem',
                  borderBottom: activeTab === 'dues' ? '2px solid var(--aurora-1)' : 'none',
                  marginBottom: '-0.5rem',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <IndianRupee size={16} color={activeTab === 'dues' ? 'var(--aurora-1)' : 'var(--text-ghost)'} />
                <span>Dues This Month</span>
                <span style={{
                  fontSize: '0.75rem',
                  background: activeTab === 'dues' ? 'rgba(239, 68, 68, 0.12)' : 'var(--border-subtle)',
                  color: activeTab === 'dues' ? '#ef4444' : 'var(--text-ghost)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 99,
                  fontWeight: 700
                }}>
                  {duesTenants.length}
                </span>
              </button>
            </div>

            {activeTab === 'active' ? (
              <div>
                {activeTenants.length === 0 ? (
                  <div className="glass-panel p-8 text-center text-muted">No active tenants yet.</div>
                ) : (
                  <div className="flex-col gap-3">
                    {activeTenants.map(t => (
                      <div key={t._id} className="tenant-premium-card slide-up relative overflow-hidden"
                        style={{
                          background: t.status === 'vacating' ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-surface)',
                          borderColor: t.status === 'vacating' ? '#f59e0b' : 'var(--border-muted)',
                        }}>

                        {t.status === 'vacating' && (
                          <div className="absolute top-0 right-0 px-3 py-0.5 bg-warning text-black text-[10px] font-bold uppercase tracking-wider" style={{ borderRadius: '0 0 0 8px' }}>
                            Notice
                          </div>
                        )}

                        {/* Left section: Avatar & Name & Status Badge */}
                        <div className="tenant-pc-left">
                          <div className="tenant-pc-avatar">
                            {(t.user?.name || t.fatherName || 'T')[0].toUpperCase()}
                          </div>
                          <div className="tenant-pc-info">
                            <div className="tenant-pc-name-row">
                              <span className="tenant-pc-name">{t.user?.name || t.fatherName || "Tenant User"}</span>
                              <span style={getPaymentBadgeStyle(t.payment_status)}>
                                {t.payment_status === 'paid' ? 'Paid' : t.payment_status === 'partial' ? 'Partial' : 'Unpaid'}
                              </span>
                            </div>
                            {t.mobile && <span className="tenant-pc-subtext">{t.mobile}</span>}
                          </div>
                        </div>

                        {/* Middle section: Metrics */}
                        <div className="tenant-pc-middle">
                          <div className="tenant-pc-metric">
                            <span className="tenant-pc-metric-label">Room</span>
                            <span className="tenant-pc-metric-value">
                              <Home size={14} style={{ color: 'var(--aurora-1)' }} />
                              <span>{t.roomNumber || 'N/A'}</span>
                            </span>
                          </div>

                          <div className="tenant-pc-metric">
                            <span className="tenant-pc-metric-label">Join Date</span>
                            <span className="tenant-pc-metric-value">
                              <Calendar size={14} style={{ color: 'var(--aurora-1)' }} />
                              <span>
                                {t.admissionDate && t.admissionDate !== 'N/A' && !isNaN(Date.parse(t.admissionDate))
                                  ? new Date(t.admissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                  : 'N/A'}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Right section: Action links */}
                        <div className="tenant-pc-right">
                          <button
                            className="tenant-btn-details"
                            onClick={() => openTenantDetail(t)}
                          >
                            View Details
                          </button>

                          <button
                            className="tenant-btn-vacate"
                            onClick={() => handleCompleteVacate(t._id)}
                          >
                            {t.status === 'vacating' ? 'Finalize' : 'Vacate'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {duesTenants.length === 0 ? (
                  <div className="glass-panel p-8 text-center text-muted">No tenants with dues this month.</div>
                ) : (
                  <div className="flex-col gap-3">
                    {duesTenants.map(t => (
                      <div key={t._id} className="tenant-premium-card slide-up relative overflow-hidden"
                        style={{
                          background: t.status === 'vacating' ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-surface)',
                          borderColor: t.status === 'vacating' ? '#f59e0b' : 'var(--border-muted)',
                        }}>

                        {t.status === 'vacating' && (
                          <div className="absolute top-0 right-0 px-3 py-0.5 bg-warning text-black text-[10px] font-bold uppercase tracking-wider" style={{ borderRadius: '0 0 0 8px' }}>
                            Notice
                          </div>
                        )}

                        {/* Left section: Avatar & Name & Status Badge */}
                        <div className="tenant-pc-left">
                          <div className="tenant-pc-avatar">
                            {(t.user?.name || t.fatherName || 'T')[0].toUpperCase()}
                          </div>
                          <div className="tenant-pc-info">
                            <div className="tenant-pc-name-row">
                              <span className="tenant-pc-name">{t.user?.name || t.fatherName || "Tenant User"}</span>
                              <span style={getPaymentBadgeStyle(t.payment_status)}>
                                {t.payment_status === 'paid' ? 'Paid' : t.payment_status === 'partial' ? 'Partial' : 'Unpaid'}
                              </span>
                            </div>
                            {t.mobile && <span className="tenant-pc-subtext">{t.mobile}</span>}
                          </div>
                        </div>

                        {/* Middle section: Metrics */}
                        <div className="tenant-pc-middle">
                          <div className="tenant-pc-metric">
                            <span className="tenant-pc-metric-label">Room</span>
                            <span className="tenant-pc-metric-value">
                              <Home size={14} style={{ color: 'var(--aurora-1)' }} />
                              <span>{t.roomNumber || 'N/A'}</span>
                            </span>
                          </div>

                          <div className="tenant-pc-metric">
                            <span className="tenant-pc-metric-label">Dues This Month</span>
                            <span className="tenant-pc-metric-value" style={{ color: '#ef4444' }}>
                              <IndianRupee size={14} />
                              <span style={{ fontWeight: 700 }}>{(t.due_amount || 0).toLocaleString('en-IN')}</span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-ghost)', fontWeight: 500, marginLeft: '0.15rem' }}>
                                (Paid: ₹{(t.paid_amount || 0).toLocaleString('en-IN')})
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Right section: Action links */}
                        <div className="tenant-pc-right">
                          <button
                            className="tenant-btn-details"
                            onClick={() => openTenantDetail(t)}
                          >
                            View Details
                          </button>

                          <button
                            className="tenant-btn-vacate"
                            onClick={() => handleCompleteVacate(t._id)}
                          >
                            {t.status === 'vacating' ? 'Finalize' : 'Vacate'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
        </div>

        {/* View Details Modal */}
        {selectedTenant && (
          <div className="detail-modal-backdrop" onClick={() => setSelectedTenant(null)}>
            <div className="detail-modal-card" onClick={e => e.stopPropagation()}>
              <div className="modal-drag-handle" />

              {/* ── Modal Header Banner ── */}
              <div style={{
                background: 'linear-gradient(135deg, var(--aurora-1) 0%, var(--aurora-2) 100%)',
                padding: '1.75rem 1.75rem 4rem',
                position: 'relative',
              }}>
                <button onClick={() => setSelectedTenant(null)}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', border: 'none' }}>
                  <X size={18} />
                </button>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '.78rem', marginBottom: '.3rem', fontWeight: 600, letterSpacing: '.08em' }}>TENANT PROFILE</p>
                <h2 style={{ color: '#fff', margin: 0, fontSize: '1.5rem', fontFamily: "'Space Grotesk', sans-serif" }}>{selectedTenant.user?.name || 'Tenant'}</h2>
              </div>

              {/* ── Avatar overlapping banner ── */}
              <div style={{ padding: '0 1.75rem', marginTop: -36, marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-end', gap: '1rem', zIndex: 5 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.75rem', fontWeight: 800, color: '#fff',
                  border: '3px solid var(--bg-surface)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  flexShrink: 0,
                }}>
                  {(selectedTenant.user?.name || 'T')[0].toUpperCase()}
                </div>
                {/* Status badge */}
                <div style={{ paddingBottom: '.5rem' }}>
                  <span style={{
                    padding: '.35rem 1rem', borderRadius: 99, fontSize: '.75rem', fontWeight: 700, letterSpacing: '.05em',
                    background: selectedTenant.status === 'active' ? 'rgba(52,211,153,0.12)' : selectedTenant.status === 'pending' ? 'rgba(251,191,36,0.12)' : 'rgba(248,113,113,0.12)',
                    color: selectedTenant.status === 'active' ? '#34d399' : selectedTenant.status === 'pending' ? '#fbbf24' : '#f87171',
                    border: `1px solid ${selectedTenant.status === 'active' ? 'rgba(52,211,153,0.2)' : selectedTenant.status === 'pending' ? 'rgba(251,191,36,0.2)' : 'rgba(248,113,113,0.2)'}`,
                    textTransform: 'uppercase'
                  }}>
                    {selectedTenant.status === 'active' ? '✓ Active' : selectedTenant.status === 'pending' ? '⏳ Pending' : selectedTenant.status}
                  </span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-muted)', padding: '0 1.25rem', background: 'var(--bg-secondary)' }}>
                <button 
                  onClick={() => setModalTab('profile')} 
                  className={`modal-tab-btn ${modalTab === 'profile' ? 'active' : ''}`}
                >
                  <User size={15} />
                  <span>Profile Info</span>
                </button>
                <button 
                  onClick={() => setModalTab('payments')} 
                  className={`modal-tab-btn ${modalTab === 'payments' ? 'active' : ''}`}
                >
                  <IndianRupee size={15} />
                  <span>Payments</span>
                </button>
                <button 
                  onClick={() => setModalTab('actions')} 
                  className={`modal-tab-btn ${modalTab === 'actions' ? 'active' : ''}`}
                >
                  <AlertCircle size={15} />
                  <span>Manage</span>
                </button>
              </div>

              {/* ── Modal Content Body ── */}
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                {modalTab === 'profile' && (
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', flex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                      {[
                        { icon: <User size={14} />,     label: 'Full Name',      value: selectedTenant.user?.name || 'N/A' },
                        { icon: <User size={14} />,     label: "Father's Name",  value: selectedTenant.fatherName || 'N/A' },
                        { icon: <Phone size={14} />,    label: 'Mobile',         value: selectedTenant.mobile || 'N/A' },
                        { icon: <Hash size={14} />,     label: 'Room Number',    value: selectedTenant.roomNumber || 'N/A' },
                        { icon: <Calendar size={14} />, label: selectedTenant.status === 'pending' ? 'Expected Join' : 'Joined On', value: selectedTenant.admissionDate ? new Date(selectedTenant.admissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A' },
                        { icon: <Car size={14} />,      label: 'Vehicle No.',    value: selectedTenant.vehicleNumber || 'N/A' },
                      ].map(({ icon, label, value }) => (
                        <div key={label} style={{ padding: '0.85rem', background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border-muted)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-ghost)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                            {icon} {label}
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-bright)', wordBreak: 'break-word' }}>{value}</div>
                        </div>
                      ))}
                      
                      <div style={{ gridColumn: '1 / -1', padding: '0.85rem', background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border-muted)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-ghost)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                          <Home size={14} /> Permanent Address
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-bright)' }}>{selectedTenant.address || 'N/A'}</div>
                      </div>
                    </div>

                    {selectedTenant.aadhaarFile && (
                      <div style={{ 
                        padding: '1rem', 
                        background: 'rgba(124, 58, 237, 0.04)', 
                        border: '1px solid rgba(124, 58, 237, 0.15)', 
                        borderRadius: 16, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        gap: '1rem',
                        marginTop: '0.25rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ background: 'rgba(124, 58, 237, 0.1)', padding: '0.5rem', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={20} style={{ color: 'var(--aurora-1)' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-bright)' }}>Identity Verification</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-ghost)' }}>Aadhaar document uploaded</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAadhaarDownload(selectedTenant.aadhaarFile, selectedTenant.user?.name || 'Tenant')}
                          style={{ 
                            padding: '0.5rem 1rem', 
                            background: 'linear-gradient(135deg, var(--aurora-1) 0%, #4f46e5 100%)', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: 10, 
                            fontSize: '0.82rem', 
                            fontWeight: 700, 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.4rem', 
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)'
                          }}
                        >
                          <FileText size={14} /> Download
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {modalTab === 'payments' && (
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', flex: 1 }}>
                    <div style={{ padding: '1.25rem', background: 'var(--bg-elevated)', borderRadius: 20, border: '1px solid var(--border-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-ghost)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Rent Configuration</span>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0 0', color: 'var(--text-bright)' }}>
                          ₹{(selectedTenant.rent_amount || 0).toLocaleString('en-IN')}
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 500 }}> / month</span>
                        </h3>
                      </div>
                      {selectedTenant.status === 'active' || selectedTenant.status === 'vacating' ? (
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-ghost)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>Current Due</span>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '99px',
                            fontSize: '0.82rem',
                            fontWeight: '700',
                            ...getPaymentBadgeStyle(selectedTenant.payment_status)
                          }}>
                            {selectedTenant.payment_status === 'paid' ? 'Paid' : selectedTenant.payment_status === 'partial' ? `Due: ₹${selectedTenant.due_amount}` : `Unpaid: ₹${selectedTenant.due_amount}`}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <IndianRupee size={15} style={{ color: 'var(--aurora-1)' }} />
                        <span>Payment History</span>
                      </h4>

                      {loadingPayments ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <SkeletonRect height="52px" marginBottom="0" />
                          <SkeletonRect height="52px" marginBottom="0" />
                        </div>
                      ) : tenantPayments.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {tenantPayments.map((p, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'var(--bg-elevated)', borderRadius: 14, border: '1px solid var(--border-muted)' }}>
                              <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-bright)' }}>{p.month} {p.year}</div>
                                {p.paid_at && <div style={{ fontSize: '0.75rem', color: 'var(--text-ghost)' }}>Paid on {new Date(p.paid_at).toLocaleDateString('en-IN')}</div>}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-bright)' }}>₹{Number(p.amount).toLocaleString('en-IN')}</span>
                                <span style={{
                                  padding: '0.2rem 0.6rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                                  background: p.status === 'completed' ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)',
                                  color: p.status === 'completed' ? '#34d399' : '#fbbf24',
                                  border: `1px solid ${p.status === 'completed' ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)'}`
                                }}>
                                  {p.status === 'completed' ? '✓ Paid' : '⏳ Pending'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: '2rem 1.25rem', background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border-muted)', textAlign: 'center', color: 'var(--text-ghost)', fontSize: '0.85rem' }}>
                          <AlertCircle size={24} style={{ margin: '0 auto 0.5rem', display: 'block', color: 'var(--text-ghost)' }} />
                          <span>No historical payment records found</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {modalTab === 'actions' && (
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', flex: 1 }}>
                    <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-ghost)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Current Status</span>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-bright)', marginTop: '0.15rem' }}>
                          {selectedTenant.status === 'active' ? 'Active Resident' : selectedTenant.status === 'pending' ? 'Pending Approval' : selectedTenant.status === 'vacating' ? 'Notice Period (Vacating)' : selectedTenant.status?.toUpperCase()}
                        </div>
                      </div>
                      <span style={{
                        padding: '0.3rem 0.85rem', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700,
                        background: selectedTenant.status === 'active' ? 'rgba(52,211,153,0.12)' : selectedTenant.status === 'pending' ? 'rgba(251,191,36,0.12)' : 'rgba(248,113,113,0.12)',
                        color: selectedTenant.status === 'active' ? '#34d399' : selectedTenant.status === 'pending' ? '#fbbf24' : '#f87171',
                        border: `1px solid ${selectedTenant.status === 'active' ? 'rgba(52,211,153,0.2)' : selectedTenant.status === 'pending' ? 'rgba(251,191,36,0.2)' : 'rgba(248,113,113,0.2)'}`
                      }}>
                        {selectedTenant.status === 'active' ? 'Active' : selectedTenant.status === 'pending' ? 'Pending' : selectedTenant.status}
                      </span>
                    </div>

                    {selectedTenant.mobile && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-ghost)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Quick Contact</span>
                        <a
                          href={`tel:${selectedTenant.mobile}`}
                          style={{
                            textDecoration: 'none',
                            padding: '0.85rem',
                            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                            border: '1px solid rgba(124, 58, 237, 0.2)',
                            borderRadius: 14,
                            color: 'var(--aurora-1)',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'center'
                          }}
                        >
                          <Phone size={16} /> Direct Call ({selectedTenant.mobile})
                        </a>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-ghost)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Administrative Controls</span>
                      
                      {selectedTenant.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.85rem', flex: 1, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                            onClick={() => { handleApprove(selectedTenant._id); setSelectedTenant(null); }}
                          >
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button 
                            className="btn" 
                            style={{ padding: '0.85rem', flex: 1, borderRadius: 14, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                            onClick={() => { handleReject(selectedTenant._id); setSelectedTenant(null); }}
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      )}

                      {(selectedTenant.status === 'active' || selectedTenant.status === 'vacating') && (
                        <button 
                          className="btn" 
                          style={{ 
                            width: '100%', 
                            padding: '0.85rem', 
                            background: 'rgba(239, 68, 68, 0.08)', 
                            color: '#ef4444', 
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: 14,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer'
                          }}
                          onClick={() => { handleCompleteVacate(selectedTenant._id); setSelectedTenant(null); }}
                        >
                          <XCircle size={16} />
                          {selectedTenant.status === 'vacating' ? 'Finalize Move-Out & Evict' : 'Mark Resident as Vacated'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Modal Footer (Sticky) ── */}
              <div style={{
                padding: '1rem 1.25rem',
                borderTop: '1px solid var(--border-muted)',
                background: 'var(--bg-secondary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                zIndex: 10
              }}>
                {/* Left Bottom Corner: Status / Warning Alert */}
                <div>
                  {(() => {
                    const status = getFooterStatusMessage();
                    return (
                      <div style={{
                        background: status.bg,
                        border: status.border,
                        borderRadius: 10,
                        padding: '0.35rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        color: status.color,
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}>
                        {status.icon}
                        <span>{status.text}</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Right Bottom Corner: Close Button */}
                <button 
                  onClick={() => setSelectedTenant(null)}
                  className="btn"
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: 10,
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: 'var(--border-subtle)',
                    border: '1px solid var(--border-muted)',
                    color: 'var(--text-bright)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: 'none'
                  }}
                >
                  Close
                </button>
              </div>

              {/* Dynamic bottom drawer layout stylesheet */}
              <style>{`
                .detail-modal-backdrop {
                  position: fixed;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: rgba(6, 8, 16, 0.75);
                  backdrop-filter: blur(8px);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  z-index: 1000;
                  animation: fadeInDetails 0.22s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .detail-modal-card {
                  background: var(--bg-surface);
                  border: 1px solid var(--border-muted);
                  border-radius: 24px;
                  box-shadow: 0 20px 45px rgba(0,0,0,0.35);
                  width: 92%;
                  max-width: 580px;
                  max-height: 85vh;
                  overflow: hidden;
                  display: flex;
                  flex-direction: column;
                  position: relative;
                  animation: scaleUpDetails 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                @media (max-width: 640px) {
                  .detail-modal-backdrop {
                    align-items: flex-end;
                  }
                  .detail-modal-card {
                    width: 100%;
                    max-width: 100%;
                    border-radius: 28px 28px 0 0;
                    border-bottom: none;
                    max-height: 90vh;
                    animation: slideUpDetailsSheet 0.32s cubic-bezier(0.16, 1, 0.3, 1);
                    padding-bottom: env(safe-area-inset-bottom, 0px);
                  }
                }

                .modal-drag-handle {
                  display: none;
                }
                @media (max-width: 640px) {
                  .modal-drag-handle {
                    display: block;
                    width: 36px;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 99px;
                    margin: 8px auto 0;
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 10;
                  }
                }

                .modal-tab-btn {
                  flex: 1;
                  background: transparent;
                  border: none;
                  color: var(--text-ghost);
                  font-size: 0.85rem;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.04em;
                  cursor: pointer;
                  padding: 1rem 0.5rem;
                  border-bottom: 2px solid transparent;
                  transition: all 0.2s ease;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 0.4rem;
                }
                .modal-tab-btn.active {
                  color: var(--aurora-1);
                  border-bottom-color: var(--aurora-1);
                }
                .modal-tab-btn:hover:not(.active) {
                  color: var(--text-dim);
                }

                @keyframes fadeInDetails {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }

                @keyframes scaleUpDetails {
                  from { transform: scale(0.95); opacity: 0; }
                  to { transform: scale(1); opacity: 1; }
                }

                @keyframes slideUpDetailsSheet {
                  from { transform: translateY(100%); }
                  to { transform: translateY(0); }
                }
              `}</style>

            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TenantsPage;


