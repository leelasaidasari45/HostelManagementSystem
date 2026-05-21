import React, { useState, useEffect } from 'react';
import { Building2, BedDouble, Search, X } from 'lucide-react';
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
  }, [activeHostel, loadingHostels]);

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
                        <div key={room._id} className={`room-card-premium ${statusClass}`}>
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
      </main>
    </div>
  );
};

export default RoomsPage;
