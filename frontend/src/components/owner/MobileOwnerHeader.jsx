import React, { useState } from 'react';
import { ChevronDown, User, CheckCircle2, Home, X } from 'lucide-react';
import { useHostel } from '../../context/HostelContext';
import { useNavigate } from 'react-router-dom';
import './MobileOwnerHeader.css';
import './MobileOwnerHeader.css';

const MobileOwnerHeader = () => {
  const { activeHostel, hostels, switchHostel } = useHostel();
  const navigate = useNavigate();

  const [showHostelModal, setShowHostelModal] = useState(false);

  const handleSelectHostel = (id) => {
    switchHostel(id);
    setShowHostelModal(false);
  };

  return (
    <div className="mobile-header-container">
      {/* Top Header */}
      <header className="mobile-header-top">
        <div className="header-left">
          <div className="header-logo">
            <span>easyPG</span>
          </div>
          
          <div className="header-hostel-select" onClick={() => setShowHostelModal(true)} style={{ cursor: 'pointer' }}>
            <div className="hostel-select-display" style={{ pointerEvents: 'auto' }}>
              <span className="hostel-name-truncate">{activeHostel?.name || 'Select Property'}</span>
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <button className="icon-circle-btn" style={{ background: '#fff' }} onClick={() => navigate('/owner/profile')} title="Profile">
            <User size={18} color="#000" fill="#000" />
          </button>
        </div>
      </header>

      {/* Custom Property Selector Modal */}
      {showHostelModal && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(6, 8, 16, 0.75)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            zIndex: 1000, animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setShowHostelModal(false)}
        >
          <div 
            style={{
              width: '100%', background: 'var(--bg-surface)', 
              borderRadius: '28px 28px 0 0', padding: '1.5rem',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
              animation: 'slideUpSheet 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              maxHeight: '80vh', display: 'flex', flexDirection: 'column'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 40, height: 4, background: 'var(--border-muted)', borderRadius: 4, margin: '0 auto 1.5rem' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-bright)', margin: 0 }}>Select Property</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-ghost)', margin: '0.25rem 0 0' }}>Choose a hostel to manage</p>
              </div>
              <button 
                onClick={() => setShowHostelModal(false)}
                style={{ background: 'var(--bg-elevated)', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: 'env(safe-area-inset-bottom, 1rem)' }}>
              {hostels.map(h => {
                const isActive = activeHostel?._id === h._id;
                return (
                  <button
                    key={h._id}
                    onClick={() => handleSelectHostel(h._id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '1rem', background: isActive ? 'rgba(249, 115, 22, 0.1)' : 'var(--bg-elevated)',
                      border: isActive ? '1px solid rgba(249, 115, 22, 0.3)' : '1px solid var(--border-muted)',
                      borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', width: '100%'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: 44, height: 44, borderRadius: 12, 
                        background: isActive ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'var(--bg-secondary)',
                        color: isActive ? '#fff' : 'var(--text-dim)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Home size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: isActive ? '#ea580c' : 'var(--text-bright)' }}>{h.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-ghost)', marginTop: '0.15rem' }}>Code: {h.code}</div>
                      </div>
                    </div>
                    {isActive && <CheckCircle2 size={22} style={{ color: '#ea580c' }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideUpSheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MobileOwnerHeader;
