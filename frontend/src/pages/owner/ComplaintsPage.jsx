import React, { useState, useEffect } from 'react';
import { CheckCircle, MessageSquare } from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
import { useHostel } from '../../context/HostelContext';
import OwnerHeader from '../../components/owner/OwnerHeader';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import PageSkeleton from '../../components/ui/SkeletonLoader';
import './OwnerDashboard.css';

const ComplaintsPage = () => {
  const { activeHostel, loadingHostels, complaints, setComplaints } = useHostel();
  const [loading, setLoading] = useState(complaints.length === 0);

  // Reset loading when hostel changes to prevent displaying stale property data
  useEffect(() => {
    setLoading(true);
  }, [activeHostel?._id]);

  const fetchComplaints = async () => {
    if (loadingHostels) return;
    if (!activeHostel) { setLoading(false); return; }
    try {
      if (complaints.length === 0) {
        setLoading(true);
      }
      const res = await api.get(`/api/owner/complaints?hostelId=${activeHostel._id}`);
      setComplaints(res.data);
    } catch { toast.error('Failed to load complaints'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchComplaints(); }, [activeHostel, loadingHostels]);

  const handleResolve = async (id) => {
    try {
      await api.put(`/api/owner/complaints/${id}/resolve`);
      toast.success('Marked as resolved!');
      fetchComplaints();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loadingHostels || loading) {
    return (
      <div className="dashboard-layout">
        <OwnerSidebar />
        <main className="dashboard-content fade-in">
          <OwnerHeader title="Complaints Center" subtitle="Issue tracking" />
          <PageSkeleton type="complaints" />
        </main>
      </div>
    );
  }

  const open = complaints.filter(c => c.status !== 'resolved');
  const resolved = complaints.filter(c => c.status === 'resolved');

  return (
    <div className="dashboard-layout">
      <OwnerSidebar />
      <main className="dashboard-content fade-in">
        <OwnerHeader title="Complaints Center" subtitle="Issue tracking" />

        {complaints.length === 0 ? (
          <div className="glass-panel p-8 text-center" style={{ maxWidth:440, margin:'4rem auto' }}>
            <MessageSquare size={48} style={{ color:'var(--success)', margin:'0 auto 1rem', display:'block' }} />
            <h3 style={{ marginBottom:'.5rem' }}>All Clear!</h3>
            <p style={{ color:'var(--text-dim)' }}>No complaints found. Your property is running perfectly!</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="stats-grid slide-up" style={{ marginBottom:'1.5rem' }}>
              <div className="stat-card">
                <p>Open Issues</p>
                <h3 style={{ color:'var(--warning)' }}>{open.length}</h3>
              </div>
              <div className="stat-card">
                <p>Resolved</p>
                <h3 style={{ color:'var(--success)' }}>{resolved.length}</h3>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap:'1.25rem' }}>
              {complaints.map(complaint => {
                const isResolved = complaint.status === 'resolved';
                return (
                  <div key={complaint._id} className="glass-panel slide-up"
                    style={{ 
                      display: 'flex', flexDirection: 'column', padding: '1.25rem',
                      borderTop: `4px solid ${isResolved ? 'var(--success)' : 'var(--warning)'}`,
                      position: 'relative', overflow: 'hidden'
                    }}>
                    
                    {/* Subtle Background Glow based on status */}
                    <div style={{
                      position: 'absolute', top: 0, right: 0, width: '100px', height: '100px',
                      background: isResolved ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                      filter: 'blur(30px)', borderRadius: '50%', pointerEvents: 'none'
                    }} />

                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                      <span className={`badge ${isResolved ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                        {isResolved ? '✓ Resolved' : '● Open'}
                      </span>
                      <span style={{ fontSize:'.75rem', color:'var(--text-ghost)', fontWeight: '500' }}>
                        {new Date(complaint.createdAt || complaint.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h4 style={{ fontSize: '1.05rem', fontWeight:600, marginBottom:'0.75rem', lineHeight:1.4, color: 'var(--text-bright)', flex: 1 }}>
                      {complaint.description || complaint.issue || 'No description provided'}
                    </h4>
                    
                    <div style={{ 
                      display:'flex', justifyContent:'space-between', alignItems:'center', 
                      marginTop:'0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' 
                    }}>
                      <div style={{ display:'flex', flexDirection: 'column', gap:'0.2rem', fontSize:'.8rem' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Reported by: <strong style={{ color: 'var(--text-primary)' }}>{complaint.tenantName || 'Unknown'}</strong></span>
                        <span style={{ color: 'var(--text-dim)' }}>Room: <strong style={{ color: 'var(--text-primary)' }}>{complaint.roomNumber || 'N/A'}</strong></span>
                      </div>
                      
                      {!isResolved && (
                        <button className="btn btn-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '6px' }} onClick={() => handleResolve(complaint._id)}>
                          <CheckCircle size={14} /> Resolve
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ComplaintsPage;
