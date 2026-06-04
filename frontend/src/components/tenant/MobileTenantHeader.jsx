import React, { useState, useEffect } from 'react';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';
import '../owner/MobileOwnerHeader.css';

const MobileTenantHeader = ({ dashData }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { logoutContext } = useAuth();

  return (
    <div className="mobile-header-container">
      {/* Top Header */}
      <header className="mobile-header-top">
        <div className="header-left">
          <div className="header-logo">
            <span>easyPG</span>
          </div>
          
          <div className="header-hostel-select" style={{ border: 'none', background: 'transparent' }}>
            <div className="hostel-select-display" style={{ cursor: 'default', padding: 0 }}>
              <span className="hostel-name-truncate">{dashData?.hostelName || 'Tenant Portal'}</span>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <NotificationBell />
          <button className="icon-circle-btn" onClick={toggleTheme} title={isDarkMode ? 'Light mode' : 'Dark mode'}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-circle-btn" onClick={logoutContext} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>
    </div>
  );
};

export default MobileTenantHeader;
