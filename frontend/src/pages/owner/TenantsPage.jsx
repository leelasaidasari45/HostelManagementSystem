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
                      <div key={t._id} className="glass-panel p-4 slide-up relative overflow-hidden tenant-row-item"
                        style={{
                          border: '1px solid var(--border-color)',
                          background: t.status === 'vacating' ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-secondary)',
                          width: '100%'
                        }}>

                        {t.status === 'vacating' && (
                          <div className="absolute top-0 right-0 px-2 py-0.5 bg-warning text-black text-[10px] font-bold uppercase tracking-wider">
                            Notice
                          </div>
                        )}

                        <div className="tenant-row-grid">
                          {/* Name Column */}
                          <div className="flex-col">
                            <span className="tenant-label">Name</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span className="tenant-value">{t.user?.name || t.fatherName || "Tenant User"}</span>
                              <span style={getPaymentBadgeStyle(t.payment_status)}>
                                {t.payment_status === 'paid' ? 'Paid' : t.payment_status === 'partial' ? 'Partial' : 'Unpaid'}
                              </span>
                            </div>
                          </div>

                          {/* Room Column */}
                          <div className="flex-col">
                            <span className="tenant-label">Room</span>
                            <span className="tenant-value">{t.roomNumber}</span>
                          </div>

                          {/* Date Column */}
                          <div className="flex-col">
                            <span className="tenant-label">joindate</span>
                            <span className="tenant-value">{new Date(t.admissionDate).toLocaleDateString()}</span>
                          </div>

                          {/* Actions Column - Aligned to headers/values */}
                          <div className="flex-col">
                            <button
                              className="tenant-action-link"
                              onClick={() => openTenantDetail(t)}
                            >
                              View Details
                            </button>

                            <button
                              className="tenant-action-link"
                              onClick={() => handleCompleteVacate(t._id)}
                            >
                              {t.status === 'vacating' ? 'Finalize' : 'Vacate'}
                            </button>
                          </div>
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
                      <div key={t._id} className="glass-panel p-4 slide-up relative overflow-hidden tenant-row-item"
                        style={{
                          border: '1px solid var(--border-color)',
                          background: t.status === 'vacating' ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-secondary)',
                          width: '100%'
                        }}>

                        {t.status === 'vacating' && (
                          <div className="absolute top-0 right-0 px-2 py-0.5 bg-warning text-black text-[10px] font-bold uppercase tracking-wider">
                            Notice
                          </div>
                        )}

                        <div className="tenant-row-grid">
                          {/* Name Column */}
                          <div className="flex-col">
                            <span className="tenant-label">Name</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span className="tenant-value">{t.user?.name || t.fatherName || "Tenant User"}</span>
                              <span style={getPaymentBadgeStyle(t.payment_status)}>
                                {t.payment_status === 'paid' ? 'Paid' : t.payment_status === 'partial' ? 'Partial' : 'Unpaid'}
                              </span>
                            </div>
                          </div>

                          {/* Room Column */}
                          <div className="flex-col">
                            <span className="tenant-label">Room</span>
                            <span className="tenant-value">{t.roomNumber}</span>
                          </div>

                          {/* Dues Column */}
                          <div className="flex-col">
                            <span className="tenant-label">Dues This Month</span>
                            <span className="tenant-value" style={{ color: '#ef4444', fontWeight: '700' }}>
                              ₹{(t.due_amount || 0).toLocaleString('en-IN')}
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-ghost)', fontWeight: '500', marginLeft: '0.35rem', whiteSpace: 'nowrap' }}>
                                (Paid: ₹{(t.paid_amount || 0).toLocaleString('en-IN')})
                              </span>
                            </span>
                          </div>

                          {/* Actions Column */}
                          <div className="flex-col">
                            <button
                              className="tenant-action-link"
                              onClick={() => openTenantDetail(t)}
                            >
                              View Details
                            </button>

                            <button
                              className="tenant-action-link"
                              onClick={() => handleCompleteVacate(t._id)}
                            >
                              {t.status === 'vacating' ? 'Finalize' : 'Vacate'}
                            </button>
                          </div>
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
          <div className="modal-backdrop fade-in" onClick={() => setSelectedTenant(null)}>
            <div className="modal-card slide-up" style={{ maxWidth: 600, padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>

              {/* ── Modal Header Banner ── */}
              <div style={{
                background: 'linear-gradient(135deg, var(--aurora-1) 0%, var(--aurora-2) 100%)',
                padding: '1.75rem 1.75rem 4rem',
                position: 'relative',
              }}>
                <button onClick={() => setSelectedTenant(null)}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={18} />
                </button>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '.78rem', marginBottom: '.3rem', fontWeight: 600, letterSpacing: '.08em' }}>TENANT PROFILE</p>
                <h2 style={{ color: '#fff', margin: 0, fontSize: '1.5rem' }}>{selectedTenant.user?.name || 'Tenant'}</h2>
              </div>

              {/* ── Avatar overlapping banner ── */}
              <div style={{ padding: '0 1.75rem', marginTop: -36, marginBottom: '1rem', display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.75rem', fontWeight: 800, color: '#fff',
                  border: '3px solid var(--bg-surface)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  flexShrink: 0,
                }}>
                  {(selectedTenant.user?.name || 'T')[0].toUpperCase()}
                </div>
                {/* Status badge */}
                <div style={{ paddingBottom: '.5rem' }}>
                  <span style={{
                    padding: '.3rem .9rem', borderRadius: 99, fontSize: '.75rem', fontWeight: 700, letterSpacing: '.05em',
                    background: selectedTenant.status === 'active' ? 'rgba(52,211,153,0.15)' : selectedTenant.status === 'pending' ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)',
                    color: selectedTenant.status === 'active' ? '#34d399' : selectedTenant.status === 'pending' ? '#fbbf24' : '#f87171',
                    border: `1px solid ${selectedTenant.status === 'active' ? 'rgba(52,211,153,0.3)' : selectedTenant.status === 'pending' ? 'rgba(251,191,36,0.3)' : 'rgba(248,113,113,0.3)'}`,
                  }}>
                    {selectedTenant.status === 'active' ? '✓ Active' : selectedTenant.status === 'pending' ? '⏳ Pending Approval' : selectedTenant.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* ── Body ── */}
              <div style={{ padding: '0 1.75rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '65vh', overflowY: 'auto' }}>

                {/* Personal Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.85rem' }}>
                  {[
                    { icon: <User size={14} />,     label: 'Full Name',      value: selectedTenant.user?.name || 'N/A' },
                    { icon: <User size={14} />,     label: "Father's Name",  value: selectedTenant.fatherName || 'N/A' },
                    { icon: <Phone size={14} />,    label: 'Mobile',         value: selectedTenant.mobile || 'N/A' },
                    { icon: <Hash size={14} />,     label: 'Room Number',    value: selectedTenant.roomNumber || 'N/A' },
                    { icon: <Calendar size={14} />, label: selectedTenant.status === 'pending' ? 'Expected Join' : 'Joined On', value: selectedTenant.admissionDate ? new Date(selectedTenant.admissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A' },
                    { icon: <Car size={14} />,      label: 'Vehicle No.',    value: selectedTenant.vehicleNumber || 'N/A' },
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={{ padding: '.75rem', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', color: 'var(--text-ghost)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.06em', marginBottom: '.35rem', textTransform: 'uppercase' }}>
                        {icon} {label}
                      </div>
                      <div style={{ fontSize: '.92rem', fontWeight: 600, color: 'var(--text-bright)', wordBreak: 'break-word' }}>{value}</div>
                    </div>
                  ))}
                  {/* Full-width address */}
                  <div style={{ gridColumn: '1 / -1', padding: '.75rem', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', color: 'var(--text-ghost)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.06em', marginBottom: '.35rem', textTransform: 'uppercase' }}>
                      <Home size={14} /> Permanent Address
                    </div>
                    <div style={{ fontSize: '.92rem', fontWeight: 600, color: 'var(--text-bright)' }}>{selectedTenant.address || 'N/A'}</div>
                  </div>
                </div>

                {/* Aadhaar Download */}
                {selectedTenant.aadhaarFile && (
                  <div style={{ padding: '.9rem', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                      <ShieldCheck size={18} style={{ color: 'var(--aurora-1)' }} />
                      <div>
                        <div style={{ fontSize: '.85rem', fontWeight: 600 }}>Identity Verification</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-ghost)' }}>Aadhaar document uploaded</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAadhaarDownload(selectedTenant.aadhaarFile, selectedTenant.user?.name || 'Tenant')}
                      style={{ padding: '.5rem 1rem', background: 'var(--aurora-1)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.4rem', flexShrink: 0 }}
                    >
                      <FileText size={14} /> Download
                    </button>
                  </div>
                )}

                {/* Payment History */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.85rem' }}>
                    <IndianRupee size={16} style={{ color: 'var(--aurora-1)' }} />
                    <h4 style={{ margin: 0, fontSize: '.95rem' }}>Payment History</h4>
                  </div>

                  {loadingPayments ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                      <SkeletonRect height="44px" marginBottom="0" />
                      <SkeletonRect height="44px" marginBottom="0" />
                    </div>
                  ) : tenantPayments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                      {tenantPayments.map((p, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.75rem 1rem', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border-muted)' }}>
                          <div>
                            <div style={{ fontSize: '.88rem', fontWeight: 600 }}>{p.month} {p.year}</div>
                            {p.paid_at && <div style={{ fontSize: '.74rem', color: 'var(--text-ghost)' }}>Paid on {new Date(p.paid_at).toLocaleDateString('en-IN')}</div>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '.95rem' }}>₹{Number(p.amount).toLocaleString('en-IN')}</span>
                            <span style={{
                              padding: '.2rem .6rem', borderRadius: 99, fontSize: '.72rem', fontWeight: 700,
                              background: p.status === 'completed' ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)',
                              color: p.status === 'completed' ? '#34d399' : '#fbbf24',
                            }}>
                              {p.status === 'completed' ? '✓ Paid' : '⏳ Pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '1.25rem', background: 'var(--bg-elevated)', borderRadius: 12, textAlign: 'center', color: 'var(--text-ghost)', fontSize: '.85rem' }}>
                      <AlertCircle size={20} style={{ margin: '0 auto .5rem', display: 'block' }} />
                      No payment records yet
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {selectedTenant.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '.75rem', paddingTop: '.5rem' }}>
                    <button className="btn btn-primary flex-1" style={{ padding: '.85rem' }}
                      onClick={() => { handleApprove(selectedTenant._id); setSelectedTenant(null); }}>
                      <CheckCircle size={16} /> Approve Tenant
                    </button>
                    <button className="btn flex-1" style={{ padding: '.85rem', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}
                      onClick={() => { handleReject(selectedTenant._id); setSelectedTenant(null); }}>
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                )}
                {(selectedTenant.status === 'active' || selectedTenant.status === 'vacating') && (
                  <button className="btn w-full" style={{ padding: '.85rem', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}
                    onClick={() => { handleCompleteVacate(selectedTenant._id); setSelectedTenant(null); }}>
                    {selectedTenant.status === 'vacating' ? 'Finalize Move-Out' : 'Mark as Vacated'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TenantsPage;


