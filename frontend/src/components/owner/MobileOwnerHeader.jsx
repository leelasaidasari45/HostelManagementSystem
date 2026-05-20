import React from 'react';
import { ChevronDown, Bell, HelpCircle, Search, Sun, Moon } from 'lucide-react';
import { useHostel } from '../../context/HostelContext';
import { useTheme } from '../../context/ThemeContext';
import './MobileOwnerHeader.css';

const MobileOwnerHeader = () => {
  const { activeHostel, hostels, switchHostel } = useHostel();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleSwitch = (e) => {
    switchHostel(e.target.value);
  };

  return (
    <div className="mobile-header-container">
      {/* Top Blue Header */}
      <header className="mobile-header-top">
        <div className="header-left">
          <div className="header-logo">
            <span style={{ fontWeight: 800, fontSize: '0.65rem', color: '#2563eb' }}>easyPG</span>
          </div>
          
          <div className="header-hostel-select">
            <select
              value={activeHostel?._id || ''}
              onChange={handleSwitch}
              className="hostel-dropdown-select"
            >
              {hostels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
            </select>
            <div className="hostel-select-display">
              <span className="hostel-name-truncate">{activeHostel?.name || 'Select Property'}</span>
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <button className="icon-circle-btn" onClick={toggleTheme} title={isDarkMode ? 'Light mode' : 'Dark mode'}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-circle-btn">
            <Bell size={18} />
          </button>
          <button className="icon-circle-btn">
            <HelpCircle size={18} />
          </button>
        </div>
      </header>
    </div>
  );
};

export default MobileOwnerHeader;
