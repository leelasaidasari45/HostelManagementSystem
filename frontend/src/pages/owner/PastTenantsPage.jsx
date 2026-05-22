import React, { useState, useEffect } from 'react';
import { BuildingIcon, Users, LayoutDashboard, MessageSquare, Plus, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';
import { useHostel } from '../../context/HostelContext';
import OwnerHeader from '../../components/owner/OwnerHeader';
import MobileOwnerHeader from '../../components/owner/MobileOwnerHeader';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import PageSkeleton from '../../components/ui/SkeletonLoader';
import './OwnerDashboard.css';

const PastTenantsPage = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const { activeHostel, loadingHostels } = useHostel();

  const fetchTenants = async () => {
    if (loadingHostels) return;
    if (!activeHostel) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/api/owner/tenants/archived?hostelId=${activeHostel._id}`);
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

  if (loadingHostels || loading) {
    return (
      <div className="dashboard-layout">
        <OwnerSidebar />
        <MobileOwnerHeader />
        <main className="dashboard-content fade-in mobile-pb">
          <div className="desktop-only-widgets">
            <OwnerHeader 
              title="Archived Residents" 
              subtitle="History of past tenants" 
            />
          </div>
          <h2 className="mobile-page-title">Archived Residents</h2>
          <PageSkeleton type="tenants" />
        </main>
      </div>
    );
  }

  // No pending tenets here

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
            title="Archived Residents" 
            subtitle="History of past tenants" 
          />
        </div>
        <h2 className="mobile-page-title">Archived Residents</h2>

        <div>
          {/* Active Tenants List */}
          <div>
            <h3 className="mb-4">Archived Records</h3>
            {tenants.length === 0 ? (
              <p className="text-muted">No past tenants found for this hostel.</p>
            ) : (
              <div className="glass-panel" style={{ overflowX: 'auto', width: '100%', borderRadius: '7px', padding: '1rem' }}>
                <table style={{ width: '100%', minWidth: '600px', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                  <tr style={{ borderBottom:'1px solid var(--border-subtle)' }}>
                      <th style={{ padding:'.9rem 1rem', color:'var(--text-dim)', fontSize:'.82rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>Name</th>
                      <th style={{ padding:'.9rem 1rem', color:'var(--text-dim)', fontSize:'.82rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>Room</th>
                      <th style={{ padding:'.9rem 1rem', color:'var(--text-dim)', fontSize:'.82rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>Join Date</th>
                      <th style={{ padding:'.9rem 1rem', color:'var(--text-dim)', fontSize:'.82rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>Vacated On</th>
                      <th style={{ padding:'.9rem 1rem', color:'var(--text-dim)', fontSize:'.82rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em', textAlign:'right' }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map(t => (
                      <tr key={t._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td className="p-3 font-medium">
                          {t.user?.name || t.fatherName || "Tenant User"}
                        </td>
                        <td className="p-3"><span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{t.roomNumber}</span></td>
                        <td className="p-3 text-muted">{new Date(t.admissionDate).toLocaleDateString()}</td>
                        <td className="p-3 text-muted">
                          {new Date(t.vacateDate).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            className="btn"
                            style={{ padding: '0.4rem 0.8rem', background: 'transparent', color: 'var(--accent-primary)', fontSize: '0.8rem' }}
                            onClick={() => setSelectedTenant(t)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* View Details Modal */}
        {selectedTenant && (
          <div className="modal-backdrop fade-in" onClick={() => setSelectedTenant(null)}>
            <div className="modal-card slide-up" style={{ maxWidth:560 }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedTenant(null)}
                style={{ position:'absolute', top:'1rem', right:'1rem', background:'transparent', border:'none', color:'var(--text-dim)', cursor:'pointer' }}>
                <XCircle size={22} />
              </button>

              <h3 className="mb-6 flex justify-between items-center border-b border-glass pb-3"> Tenant Details</h3>
              <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div><strong className="text-muted block text-sm mb-1">Full Name</strong><span className="font-medium">{selectedTenant.user?.name || selectedTenant.fatherName || 'N/A'}</span></div>
                <div><strong className="text-muted block text-sm mb-1">Father's Name</strong><span className="font-medium">{selectedTenant.fatherName || 'N/A'}</span></div>
                <div><strong className="text-muted block text-sm mb-1">Mobile Phone</strong><span className="font-medium">{selectedTenant.mobile || 'N/A'}</span></div>
                <div><strong className="text-muted block text-sm mb-1">Assigned Room</strong><span className="font-medium">{selectedTenant.roomNumber || 'N/A'}</span></div>
                <div><strong className="text-muted block text-sm mb-1">Joined Date</strong><span className="font-medium">{new Date(selectedTenant.admissionDate).toLocaleDateString()}</span></div>
                <div><strong className="text-muted block text-sm mb-1">Vacated Date</strong><span className="font-medium">{new Date(selectedTenant.vacateDate).toLocaleDateString()}</span></div>
                <div><strong className="text-muted block text-sm mb-1">Vehicle Number</strong><span className="font-medium">{selectedTenant.vehicleNumber || 'N/A'}</span></div>
                <div style={{ gridColumn: '1 / -1' }}><strong className="text-muted block text-sm mb-1">Permanent Address</strong><span className="font-medium">{selectedTenant.address || 'N/A'}</span></div>

                {selectedTenant.aadhaarFile && (
                  <div className="mt-2 text-center p-4 rounded" style={{ gridColumn: '1 / -1', background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <strong className="text-muted block text-sm mb-3">Identity Verification</strong>
                    <a
                      href={`/${selectedTenant.aadhaarFile.replace(/\\/g, '/')}`}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="btn btn-secondary inline-flex gap-2 mx-auto"
                    >
                      <span style={{ fontSize: '1.1rem' }}>💾</span> Download Aadhaar Document
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PastTenantsPage;


