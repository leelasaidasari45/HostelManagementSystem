import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, CreditCard, MessageSquare, ArrowRightCircle, Menu, LogOut, X, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../owner/MobileBottomNav.css';

const MobileTenantBottomNav = ({ activeTab, setActiveTab }) => {
  const { logoutContext } = useAuth();
  const navigate = useNavigate();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isActive = (tab) => activeTab === tab;

  return (
    <>
      <nav className="mobile-bottom-nav">
        <button className={`nav-item ${isActive('dashboard') ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <Home size={22} />
          <span>Home</span>
        </button>
        <button className={`nav-item ${isActive('rent') ? 'active' : ''}`} onClick={() => setActiveTab('rent')}>
          <CreditCard size={22} />
          <span>Rent</span>
        </button>
        {/* Center Main Action */}
        <div className="nav-item-center" style={{ transform: 'translateY(-20px)' }}>
          <button 
            className="center-btn" 
            onClick={() => setActiveTab('dashboard')} 
            style={{ 
              background: '#ffffff', 
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.35)',
              border: '3px solid var(--aurora-1)',
              width: '60px',
              height: '60px',
              padding: '4px'
            }}
          >
            <img src="/logo.png" alt="easyPG" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </button>
        </div>

        <button className={`nav-item ${isActive('complaints') ? 'active' : ''}`} onClick={() => setActiveTab('complaints')}>
          <MessageSquare size={22} />
          <span>Issues</span>
        </button>
        
        <button className="nav-item" onClick={() => setShowMoreMenu(true)}>
          <Menu size={22} />
          <span>More</span>
        </button>
      </nav>

      {/* Slide-up "More" Menu */}
      <div className={`more-menu-overlay ${showMoreMenu ? 'visible' : ''}`} onClick={() => setShowMoreMenu(false)}>
        <div className={`more-menu-content ${showMoreMenu ? 'slide-up-active' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="more-menu-header">
            <h3>More Options</h3>
            <button className="close-btn" onClick={() => setShowMoreMenu(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="more-menu-links">
            <button onClick={() => { navigate('/tenant/search'); setShowMoreMenu(false); }}>
              <Search size={20} style={{ color: 'var(--aurora-1)' }} /> 
              <span>Search Hostels</span>
            </button>
            <button onClick={() => { setActiveTab('vacate'); setShowMoreMenu(false); }}>
              <ArrowRightCircle size={20} style={{ color: 'var(--warning)' }} /> 
              <span>Notice to Vacate</span>
            </button>
            <button className="logout-btn" onClick={logoutContext} style={{ marginTop: '0.5rem', width: '100%' }}>
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileTenantBottomNav;
