import React, { useState, useEffect } from 'react';
import { Building2, BedDouble, Search, X, Phone, Calendar, User, CheckCircle, ShieldCheck } from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
import { useHostel } from '../../context/HostelContext';
import OwnerHeader from '../../components/owner/OwnerHeader';
import MobileOwnerHeader from '../../components/owner/MobileOwnerHeader';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import PageSkeleton from '../../components/ui/SkeletonLoader';
import './OwnerDashboard.css';

const RoomsPage = () => {
  const { activeHostel, loadingHostels, rooms, setRooms } = useHostel();
  const [loading, setLoading] = useState(rooms.length === 0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Reset loading when hostel changes to prevent displaying stale property data
  useEffect(() => {
    setLoading(true);
  }, [activeHostel?._id]);

  useEffect(() => {
    const fetchRooms = async () => {
      if (loadingHostels) return;
      if (!activeHostel) { setLoading(false); return; }
      try {
        if (rooms.length === 0) {
          setLoading(true);
        }
        const res = await api.get(`/api/owner/rooms?hostelId=${activeHostel._id}`);
        setRooms(res.data);
      } catch { toast.error('Failed to load rooms'); }
      finally { setLoading(false); }
    };
    fetchRooms();
  }, [activeHostel?._id, loadingHostels]);

  if (loadingHostels || loading) {
    return (
      <div className="dashboard-layout">
        <OwnerSidebar />
        <MobileOwnerHeader />
        <main className="dashboard-content fade-in mobile-pb">
          <div className="desktop-only-widgets">
            <OwnerHeader title="Rooms Overview" subtitle="Occupancy tracking" />
          </div>
          <h2 className="mobile-page-title">Rooms Overview</h2>
          <PageSkeleton type="rooms" />
        </main>
      </div>
    );
  }

  // Real-time statistics from full dataset
  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBeds = rooms.reduce((acc, r) => acc + r.occupants.length, 0);
  const emptyRoomsCount = rooms.filter(r => r.occupants.length === 0).length;
  const partialRoomsCount = rooms.filter(r => r.occupants.length > 0 && r.occupants.length < r.capacity).length;
  const fullRoomsCount = rooms.filter(r => r.occupants.length >= r.capacity).length;

  // Filtered rooms based on search query
  const filteredRooms = rooms.filter(room => {
    const q = searchTerm.toLowerCase();
    const roomNum = (room.number || "").toString().toLowerCase();
    const floorNum = (room.floor || "").toString().toLowerCase();
    const occupantMatch = room.occupants.some(occ => (occ.user?.name || "").toLowerCase().includes(q));
    return roomNum.includes(q) || floorNum.includes(q) || occupantMatch;
  });

  // Group filtered rooms by floor
  const floors = filteredRooms.reduce((acc, room) => {
    if (!acc[room.floor]) acc[room.floor] = [];
    acc[room.floor].push(room); return acc;
  }, {});

  return (
    <div className="dashboard-layout">
      <OwnerSidebar />
      <MobileOwnerHeader />
      <main className="dashboard-content fade-in mobile-pb">
        {/* Desktop Header and Desktop KPI summary widgets */}
        <div className="desktop-only-widgets">
          <OwnerHeader title="Rooms Overview" subtitle="Occupancy tracking" />
          
          {rooms.length > 0 && (
            <div className="stats-grid slide-up" style={{ marginBottom: '2rem' }}>
              <div className="stat-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <p>Occupancy Rate</p>
                  <BedDouble size={18} style={{ color:'var(--aurora-1)' }} />
                </div>
                <h3>{totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0}%</h3>
                <span className="stat-trend" style={{ color: 'var(--text-dim)' }}>{occupiedBeds} / {totalBeds} Beds Booked</span>
              </div>
              <div className="stat-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <p>Empty Rooms</p>
                  <div className="legend-dot" style={{ background: 'var(--success)', width: 10, height: 10, boxShadow: '0 0 8px var(--success)' }} />
                </div>
                <h3>{emptyRoomsCount}</h3>
                <span className="stat-trend" style={{ color: 'var(--success)' }}>Ready for check-in</span>
              </div>
              <div className="stat-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <p>Partially Filled</p>
                  <div className="legend-dot" style={{ background: 'var(--warning)', width: 10, height: 10, boxShadow: '0 0 8px var(--warning)' }} />
                </div>
                <h3>{partialRoomsCount}</h3>
                <span className="stat-trend" style={{ color: 'var(--warning)' }}>Sharing available</span>
              </div>
              <div className="stat-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <p>Fully Booked</p>
                  <div className="legend-dot" style={{ background: 'var(--danger)', width: 10, height: 10, boxShadow: '0 0 8px var(--danger)' }} />
                </div>
                <h3>{fullRoomsCount}</h3>
                <span className="stat-trend" style={{ color: 'var(--danger)' }}>At max capacity</span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Title */}
        <h2 className="mobile-page-title">Rooms Overview</h2>

        {/* Mobile Horizontal Scrolling KPI summary cards */}
        {!loading && rooms.length > 0 && (
          <div className="mobile-only-sections">
            <div className="summary-cards-scroll">
              <div className="summary-card">
                <div className="sc-top">
                  <span className="sc-value" style={{ color: 'var(--aurora-1)' }}>{totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0}%</span>
                </div>
                <div className="sc-bottom">
                  <span className="sc-label">Occupancy<br/>Rate</span>
                  <BedDouble size={14} className="sc-icon" style={{ color: 'var(--aurora-1)' }} />
                </div>
              </div>

              <div className="summary-card">
                <div className="sc-top">
                  <span className="sc-value green">{emptyRoomsCount}</span>
                </div>
                <div className="sc-bottom">
                  <span className="sc-label">Empty<br/>Rooms</span>
                  <div className="legend-dot" style={{ background: 'var(--success)', width: 8, height: 8 }} />
                </div>
              </div>

              <div className="summary-card">
                <div className="sc-top">
                  <span className="sc-value warning">{partialRoomsCount}</span>
                </div>
                <div className="sc-bottom">
                  <span className="sc-label">Partially<br/>Filled</span>
                  <div className="legend-dot" style={{ background: 'var(--warning)', width: 8, height: 8 }} />
                </div>
              </div>

              <div className="summary-card">
                <div className="sc-top">
                  <span className="sc-value red">{fullRoomsCount}</span>
                </div>
                <div className="sc-bottom">
                  <span className="sc-label">Fully<br/>Booked</span>
                  <div className="legend-dot" style={{ background: 'var(--danger)', width: 8, height: 8 }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Redesigned Search Bar */}
        {!loading && rooms.length > 0 && (
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'1.5rem' }}>
            <div className="search-container" style={{ maxWidth:600, width:'100%' }}>
              <Search size={18} style={{ color:'var(--text-dim)', flexShrink:0 }} />
              <input
                type="text"
                className="search-input"
                placeholder="Search rooms, floors or tenants..."
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
        )}

        {rooms.length === 0 ? (
          <div className="glass-panel p-8 text-center" style={{ maxWidth:400, margin:'4rem auto' }}>
            <Building2 size={48} style={{ color:'var(--text-dim)', margin:'0 auto 1rem', display:'block' }} />
            <p style={{ color:'var(--text-dim)' }}>No rooms found. Initialize your property first.</p>
          </div>
        ) : Object.keys(floors).length === 0 ? (
          <div className="glass-panel p-8 text-center" style={{ maxWidth:400, margin:'2rem auto' }}>
            <p style={{ color:'var(--text-dim)' }}>No rooms found matching "{searchTerm}".</p>
          </div>
        ) : (
          <>
            {/* Desktop Legend (Hidden on Mobile since KPIs display status colors) */}
            <div className="rooms-legend desktop-only-widgets">
              {[['var(--success)','Empty'],['var(--warning)','Partial'],['var(--danger)','Full']].map(([color, label]) => (
                <div key={label} className="legend-item">
                  <div className="legend-dot" style={{ background:color, boxShadow:`0 0 10px ${color}` }} />
                  <span className="legend-label">{label}</span>
                </div>
              ))}
            </div>

            {Object.keys(floors).sort().map(floorNum => {
              const floorRooms = floors[floorNum];
              const occupied = floorRooms.filter(r => r.occupants.length > 0).length;
              return (
                <div key={floorNum} className="floor-section slide-up">
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
                    <h3 style={{ margin:0 }}>Floor {floorNum}</h3>
                    <span className="badge badge-aurora">{occupied}/{floorRooms.length} occupied</span>
                  </div>
                  <div className="rooms-grid">
                    {floorRooms.map(room => {
                      const isFull = room.occupants.length >= room.capacity;
                      const isOccupied = room.occupants.length > 0;
                      const statusColor = isFull ? 'var(--danger)' : isOccupied ? 'var(--warning)' : 'var(--success)';
                      const statusClass = isFull ? 'status-full' : isOccupied ? 'status-partial' : 'status-empty';
                      const statusLabel = isFull ? 'Full' : isOccupied ? 'Sharing' : 'Empty';

                      return (
                        <div 
                          key={room._id} 
                          className={`room-card-premium ${statusClass}`}
                          onClick={() => setSelectedRoom(room)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="rc-header">
                            <span className="rc-number">{room.number}</span>
                            <span className={`rc-status-tag ${statusClass}`}>{statusLabel}</span>
                          </div>
                          
                          <div className="rc-capacity-section">
                            <div className="rc-capacity-info">
                              <BedDouble size={14} className="rc-bed-icon" />
                              <span>{room.occupants.length} / {room.capacity} Beds</span>
                            </div>
                            <div className="rc-capacity-bar">
                              <div 
                                className="rc-capacity-fill" 
                                style={{ 
                                  width: `${(room.occupants.length / room.capacity) * 100}%`,
                                  backgroundColor: statusColor 
                                }} 
                              />
                            </div>
                          </div>

                          {room.occupants.length > 0 && (
                            <div className="rc-occupants-section">
                              <span className="rc-occupants-label">Occupants</span>
                              <div className="rc-avatar-stack">
                                {room.occupants.map((occ, idx) => {
                                  const initials = (occ.user?.name || 'T')[0].toUpperCase();
                                  const colorIdx = initials.charCodeAt(0) % 5;
                                  const bgColors = ['var(--aurora-1)', 'var(--aurora-2)', 'var(--aurora-3)', 'var(--warning)', '#ec4899'];
                                  const avatarBg = bgColors[colorIdx];
                                  
                                  return (
                                    <div 
                                      key={occ._id} 
                                      className="rc-avatar-circle" 
                                      style={{ backgroundColor: avatarBg, zIndex: 5 - idx }}
                                      title={occ.user?.name || 'Tenant'}
                                    >
                                      {initials}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Room Details Modal */}
        {selectedRoom && (
          <div className="room-modal-backdrop" onClick={() => setSelectedRoom(null)}>
            <div className="room-modal-card" onClick={e => e.stopPropagation()}>
              <div className="modal-drag-handle" />

              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg, var(--aurora-1) 0%, var(--aurora-2) 100%)',
                padding: '1.75rem 1.75rem 2rem',
                position: 'relative',
              }}>
                <button onClick={() => setSelectedRoom(null)}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', border: 'none' }}>
                  <X size={18} />
                </button>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '.78rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>Room Configuration</span>
                <h2 style={{ color: '#fff', margin: '0.25rem 0 0', fontSize: '1.75rem', fontFamily: "'Space Grotesk', sans-serif" }}>Room {selectedRoom.number}</h2>
              </div>

              {/* Room Stats Quick Info */}
              <div style={{ display: 'flex', gap: '0.85rem', padding: '1.25rem', borderBottom: '1px solid var(--border-muted)', background: 'var(--bg-secondary)' }}>
                <div style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-muted)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-ghost)', textTransform: 'uppercase', fontWeight: 700 }}>Floor</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-bright)', marginTop: '0.15rem' }}>{selectedRoom.floor}</div>
                </div>
                <div style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-muted)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-ghost)', textTransform: 'uppercase', fontWeight: 700 }}>Occupancy</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-bright)', marginTop: '0.15rem' }}>{selectedRoom.occupants.length} / {selectedRoom.capacity}</div>
                </div>
                <div style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-muted)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-ghost)', textTransform: 'uppercase', fontWeight: 700 }}>Rent Price</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-bright)', marginTop: '0.15rem' }}>₹{selectedRoom.rent_amount.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Occupants List Body */}
              <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-bright)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <BedDouble size={16} style={{ color: 'var(--aurora-1)' }} />
                  <span>Current Occupants</span>
                </h4>

                {selectedRoom.occupants.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border-muted)', textAlign: 'center', color: 'var(--text-ghost)' }}>
                    <BedDouble size={28} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.5 }} />
                    <span style={{ fontSize: '0.85rem' }}>No residents allocated to this room yet</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selectedRoom.occupants.map((occ) => (
                      <div key={occ._id} style={{ 
                        padding: '1rem', 
                        background: 'var(--bg-elevated)', 
                        border: '1px solid var(--border-muted)', 
                        borderRadius: 16,
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}>
                        {/* Occupant Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{
                              width: 38, height: 38, borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.95rem', fontWeight: 800, color: '#fff',
                              boxShadow: '0 4px 10px rgba(124, 58, 237, 0.15)'
                            }}>
                              {(occ.user?.name || 'T')[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-bright)' }}>{occ.user?.name || 'Tenant'}</div>
                              <span style={{ 
                                display: 'inline-block',
                                fontSize: '0.7rem', 
                                color: occ.status === 'active' ? '#34d399' : occ.status === 'pending' ? '#fbbf24' : '#f87171',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                              }}>
                                {occ.status === 'active' ? '✓ Active' : occ.status === 'pending' ? '⏳ Pending' : occ.status}
                              </span>
                            </div>
                          </div>
                          
                          {occ.phone && occ.phone !== 'N/A' && (
                            <a href={`tel:${occ.phone}`} style={{
                              width: 34, height: 34, borderRadius: '50%',
                              background: 'rgba(79, 70, 229, 0.08)',
                              border: '1px solid rgba(79, 70, 229, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--aurora-1)',
                              cursor: 'pointer',
                              textDecoration: 'none'
                            }}>
                              <Phone size={14} />
                            </a>
                          )}
                        </div>

                        {/* Occupant Details Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', fontSize: '0.8rem' }}>
                          <div>
                            <span style={{ color: 'var(--text-ghost)', textTransform: 'uppercase', fontWeight: 700, fontSize: '0.68rem', display: 'block', marginBottom: '0.15rem' }}>Phone Number</span>
                            <span style={{ color: 'var(--text-bright)', fontWeight: 500 }}>{occ.phone || 'N/A'}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-ghost)', textTransform: 'uppercase', fontWeight: 700, fontSize: '0.68rem', display: 'block', marginBottom: '0.15rem' }}>Admission Date</span>
                            <span style={{ color: 'var(--text-bright)', fontWeight: 500 }}>
                              {occ.admissionDate && occ.admissionDate !== 'N/A' && !isNaN(Date.parse(occ.admissionDate)) 
                                ? new Date(occ.admissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) 
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '1rem 1.25rem',
                borderTop: '1px solid var(--border-muted)',
                background: 'var(--bg-secondary)',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                zIndex: 10
              }}>
                <button 
                  onClick={() => setSelectedRoom(null)}
                  className="btn"
                  style={{
                    padding: '0.5rem 1.5rem',
                    borderRadius: 10,
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: 'var(--border-subtle)',
                    border: '1px solid var(--border-muted)',
                    color: 'var(--text-bright)',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  Close
                </button>
              </div>

              {/* stylesheet */}
              <style>{`
                .room-modal-backdrop {
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
                  animation: fadeInRoom 0.22s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .room-modal-card {
                  background: var(--bg-surface);
                  border: 1px solid var(--border-muted);
                  border-radius: 24px;
                  box-shadow: 0 20px 45px rgba(0,0,0,0.35);
                  width: 92%;
                  max-width: 480px;
                  max-height: 80vh;
                  overflow: hidden;
                  display: flex;
                  flex-direction: column;
                  position: relative;
                  animation: scaleUpRoom 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                @media (max-width: 640px) {
                  .room-modal-backdrop {
                    align-items: flex-end;
                  }
                  .room-modal-card {
                    width: 100%;
                    max-width: 100%;
                    border-radius: 28px 28px 0 0;
                    border-bottom: none;
                    max-height: 85vh;
                    animation: slideUpRoomSheet 0.32s cubic-bezier(0.16, 1, 0.3, 1);
                    padding-bottom: env(safe-area-inset-top, 0px);
                  }
                }

                @keyframes fadeInRoom {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }

                @keyframes scaleUpRoom {
                  from { transform: scale(0.95); opacity: 0; }
                  to { transform: scale(1); opacity: 1; }
                }

                @keyframes slideUpRoomSheet {
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

export default RoomsPage;
