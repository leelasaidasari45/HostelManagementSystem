import React from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../owner/MobileOwnerHeader.css';

const MobileTenantHeader = ({ dashData }) => {
  const navigate = useNavigate();

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
          <button className="icon-circle-btn" style={{ background: '#fff' }} onClick={() => navigate('/tenant/profile')} title="Profile">
            <User size={18} color="#000" fill="#000" />
          </button>
        </div>
      </header>
    </div>
  );
};

export default MobileTenantHeader;
