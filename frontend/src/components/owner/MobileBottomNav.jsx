import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, DoorOpen, Menu, CreditCard, MessageSquare, LogOut, X, Landmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="mobile-bottom-nav">
        <Link to="/owner/dashboard" className={`nav-item ${isActive('/owner/dashboard') ? 'active' : ''}`}>
          <Home size={22} />
          <span>Home</span>
        </Link>
        <Link to="/owner/tenants" className={`nav-item ${isActive('/owner/tenants') ? 'active' : ''}`}>
          <Users size={22} />
          <span>Tenants</span>
        </Link>
        
        <Link to="/owner/bank-accounts" className={`nav-item ${isActive('/owner/bank-accounts') ? 'active' : ''}`}>
          <Landmark size={22} />
          <span>Bank</span>
        </Link>

        <Link to="/owner/rooms" className={`nav-item ${isActive('/owner/rooms') ? 'active' : ''}`}>
          <DoorOpen size={22} />
          <span>Rooms</span>
        </Link>
        
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
            <Link to="/owner/billing" onClick={() => setShowMoreMenu(false)}>
              <CreditCard size={20} /> Billing & Subscriptions
            </Link>
            <Link to="/owner/complaints" onClick={() => setShowMoreMenu(false)}>
              <MessageSquare size={20} /> Complaints
            </Link>
            <button className="logout-btn" onClick={logout}>
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileBottomNav;
