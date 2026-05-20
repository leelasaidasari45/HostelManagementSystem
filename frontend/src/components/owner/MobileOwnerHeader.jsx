import React from 'react';
import { ChevronDown, Bell, HelpCircle, Search } from 'lucide-react';
import { useHostel } from '../../context/HostelContext';
import './MobileOwnerHeader.css';

const MobileOwnerHeader = () => {
  const { activeHostel, hostels, switchHostel } = useHostel();

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
          <button className="icon-circle-btn">
            <Bell size={18} />
          </button>
          <button className="icon-circle-btn">
            <HelpCircle size={18} />
          </button>
        </div>
      </header>

      {/* Bottom Search Bar */}
      <div className="mobile-header-search">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon-left" />
          <input type="text" placeholder="Search Ten" className="header-search-input" />
        </div>
      </div>
    </div>
  );
};

export default MobileOwnerHeader;
