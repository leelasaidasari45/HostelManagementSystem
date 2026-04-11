import React, { useState, useEffect } from 'react';
import { BuildingIcon, Users, CreditCard, LayoutDashboard, Loader2, MessageSquare, Plus, CheckCircle, XCircle, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import toast from 'react-hot-toast';
import { useHostel } from '../../context/HostelContext';
import OwnerHeader from '../../components/owner/OwnerHeader';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import './OwnerDashboard.css';

const TenantsPage = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { activeHostel, hostels, switchHostel, loadingHostels } = useHostel();
  const { logoutContext } = useAuth();

  const fetchTenants = async () => {
    if (loadingHostels) return;
    if (!activeHostel) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
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
  }, [activeHostel, loadingHostels]);

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

  if (loadingHostels) {
    return <div className="flex justify-center items-center h-screen"><Loader2 size={48} className="animate-spin text-accent" /></div>;
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

      <main className="dashboard-content fade-in">
        <OwnerHeader 
          title="Tenants Management" 
          subtitle="Approve and manage residents" 
        />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={48} className="animate-spin text-accent" />
          </div>
        ) : (
          <div>
            {/* Redesigned Search Bar */}
            <div className="search-toolbar flex justify-center mb-8">
              <div className="search-container glass-panel flex items-center gap-3 px-5 py-3 w-full" style={{ maxWidth: '600px', borderRadius: '12px' }}>
                <Search size={20} className="text-muted" />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search name or room #..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#000', width: '100%', outline: 'none', fontSize: '1.05rem' }}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                    className="hover:text-white transition-colors"
                  >
                    <X size={18} />
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
                    <div key={t._id} className="glass-panel p-4 slide-up" style={{ border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      <h4 className="mb-1">{t.user?.name || t.fatherName || "Incoming Tenant"}</h4>
                      <p className="text-muted" style={{ fontSize: '0.875rem' }}>Phone: {t.mobile}</p>
                      <p className="text-muted" style={{ fontSize: '0.875rem' }}>Expected Join: <strong>{new Date(t.admissionDate).toLocaleDateString()}</strong></p>
                      <p className="text-muted" style={{ fontSize: '0.875rem' }}>Requested Room: <strong>{t.roomNumber}</strong></p>

                      <div className="flex justify-between items-center mt-4">
                        <button className="btn" style={{ padding: '0.5rem', background: 'transparent', color: 'var(--accent-primary)', fontSize: '0.85rem' }} onClick={() => setSelectedTenant(t)}>
                          View Details
                        </button>
                        <div className="flex gap-2">
                          <button className="btn" style={{ padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }} onClick={() => handleApprove(t._id)}>
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button className="btn" style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }} onClick={() => handleReject(t._id)}>
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Tenants List */}
            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <CheckCircle size={20} color="var(--success)" /> Active Residents
              </h3>
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
                          <span className="tenant-value">{t.user?.name || t.fatherName || "Tenant User"}</span>
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
                            onClick={() => setSelectedTenant(t)}
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
          </div>
        )}

        {/* View Details Modal */}
        {selectedTenant && (
          <div className="flex items-center justify-center p-4 fade-in" style={{ background: 'rgba(0,0,0,0.8)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
            <div className="glass-panel p-8 w-full max-w-lg slide-up" style={{ position: 'relative', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <button
                onClick={() => setSelectedTenant(null)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--muted-text)', cursor: 'pointer' }}
              >
                <XCircle size={24} />
              </button>

              <h3 className="mb-6 flex justify-between items-center border-b border-glass pb-3"> Tenant Details</h3>
              <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div><strong className="text-muted block text-sm mb-1">Full Name</strong><span className="font-medium">{selectedTenant.user?.name || selectedTenant.fatherName || 'N/A'}</span></div>
                <div><strong className="text-muted block text-sm mb-1">Father's Name</strong><span className="font-medium">{selectedTenant.fatherName || 'N/A'}</span></div>
                <div><strong className="text-muted block text-sm mb-1">Mobile Phone</strong><span className="font-medium">{selectedTenant.mobile || 'N/A'}</span></div>
                <div><strong className="text-muted block text-sm mb-1">Requested/Assigned Room</strong><span className="font-medium">{selectedTenant.roomNumber || 'N/A'}</span></div>
                <div><strong className="text-muted block text-sm mb-1">{selectedTenant.status === 'pending' ? 'Expected Join Date' : 'Joined Date'}</strong><span className="font-medium">{new Date(selectedTenant.admissionDate).toLocaleDateString()}</span></div>
                <div><strong className="text-muted block text-sm mb-1">Vehicle Number</strong><span className="font-medium">{selectedTenant.vehicleNumber || 'N/A'}</span></div>
                <div style={{ gridColumn: '1 / -1' }}><strong className="text-muted block text-sm mb-1">Permanent Address</strong><span className="font-medium">{selectedTenant.address || 'N/A'}</span></div>

                {selectedTenant.aadhaarFile && (
                  <div className="mt-2 text-center p-4 rounded" style={{ gridColumn: '1 / -1', background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <strong className="text-muted block text-sm mb-3">Identity Verification</strong>
                    
                    {(() => {
                      const isImage = /\.(jpg|jpeg|png|webp)$/i.test(selectedTenant.aadhaarFile);
                      const tenantName = selectedTenant.user?.name || selectedTenant.fatherName || 'Tenant';
                      
                      return (
                        <button
                          onClick={() => handleAadhaarDownload(selectedTenant.aadhaarFile, tenantName)}
                          className="btn btn-secondary inline-flex gap-3 mx-auto px-6 py-3"
                          style={{ borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)' }}
                        >
                          {isImage ? (
                            <>
                              <span style={{ fontSize: '1.2rem' }}>🖼️</span>
                              <span>Download Photo (Gallery)</span>
                            </>
                          ) : (
                            <>
                              <span style={{ fontSize: '1.2rem' }}>📄</span>
                              <span>Download Aadhaar PDF</span>
                            </>
                          )}
                        </button>
                      );
                    })()}
                  </div>
                )}
              </div>

              {selectedTenant.status === 'pending' && (
                <div className="flex gap-4 mt-6">
                  <button className="btn btn-primary flex-1" onClick={() => { handleApprove(selectedTenant._id); setSelectedTenant(null); }}>Approve</button>
                  <button className="btn w-full flex-1" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }} onClick={() => handleReject(selectedTenant._id)}>Reject</button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TenantsPage;


