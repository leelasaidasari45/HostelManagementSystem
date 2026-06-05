import React from 'react';
import { ChevronDown, User } from 'lucide-react';
import { useHostel } from '../../context/HostelContext';
import { useNavigate } from 'react-router-dom';
import './MobileOwnerHeader.css';
import './MobileOwnerHeader.css';

const MobileOwnerHeader = () => {
  const { activeHostel, hostels, switchHostel } = useHostel();
  const navigate = useNavigate();

  const handleSwitch = (e) => {
    switchHostel(e.target.value);
  };

  return (
    <div className="mobile-header-container">
      {/* Top Header */}
      <header className="mobile-header-top">
        <div className="header-left">
          <div className="header-logo">
            <span>easyPG</span>
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
          <button className="icon-circle-btn" style={{ background: '#fff' }} onClick={() => navigate('/owner/profile')} title="Profile">
            <User size={18} color="#000" fill="#000" />
          </button>
        </div>
      </header>
    </div>
  );
};

export default MobileOwnerHeader;
