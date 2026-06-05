import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Bell, LogOut, MessageSquare, Trash2, AlertTriangle, ChevronRight, User, Search, ArrowRightCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import api from '../../api';
import '../owner/OwnerProfilePage.css'; // Reusing the exact same sleek CSS!

const TenantProfilePage = () => {
  const navigate = useNavigate();
  const { user, logoutContext } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await api.delete('/api/auth/delete-account');
      toast.success('Account deleted successfully');
      setTimeout(() => { logoutContext(); }, 1000);
    } catch (err) {
      setIsDeleting(false);
      setShowConfirmDelete(false);
      toast.error('Failed to delete account');
      console.error(err);
    }
  };

  const displayName = user?.name && user.name !== user.phone ? user.name : (user?.name || user?.phone || 'Tenant Profile');
  const displayPhone = user?.phone && user.phone !== displayName ? user.phone : null;

  return (
    <div className="profile-page-container">
      {/* Banner */}
      <div className="profile-banner">
        <div className="profile-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} className="icon-contrast" />
          </button>
          <span className="header-title">Profile</span>
        </div>
      </div>

      {/* Avatar and Info */}
      <div className="profile-info-section">
        <div className="profile-avatar">
          <User size={40} className="avatar-icon" />
        </div>
        <h2 className="profile-name">{displayName}</h2>
        {displayPhone && <p className="profile-phone">{displayPhone}</p>}
        {user?.email && <p className="profile-email">{user?.email}</p>}
        
        <div className="profile-role-badge" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}>
          Tenant
        </div>
      </div>

      <div className="profile-content">
        {/* 4 Features Row */}
        <div className="profile-features-grid">
          <button className="feature-card" onClick={toggleTheme}>
            <div className="feature-icon">{isDarkMode ? <Sun size={24} /> : <Moon size={24} />}</div>
            <span>Theme</span>
          </button>
          <button className="feature-card" onClick={() => navigate('/tenant/search')}>
            <div className="feature-icon"><Search size={24} /></div>
            <span>Search PG</span>
          </button>
          <button className="feature-card" onClick={() => toast('No new notifications')}>
            <div className="feature-icon"><Bell size={24} /></div>
            <span>Alerts</span>
          </button>
          <button className="feature-card" onClick={logoutContext}>
            <div className="feature-icon"><LogOut size={24} /></div>
            <span>Logout</span>
          </button>
        </div>

        {/* Vertical List */}
        <div className="profile-list">
          <button className="list-item" onClick={() => navigate('/tenant/search')}>
            <Search size={20} className="list-icon" />
            <span>Search Hostels</span>
            <ChevronRight size={18} className="list-chevron" />
          </button>
          <button className="list-item" onClick={() => toast('Vacate notice initiated (demo)')}>
            <ArrowRightCircle size={20} className="list-icon" />
            <span>Notice to Vacate</span>
            <ChevronRight size={18} className="list-chevron" />
          </button>
          <button className="list-item" onClick={() => setShowConfirmDelete(true)}>
            <Trash2 size={20} color="#ef4444" className="list-icon" />
            <span style={{ color: '#ef4444' }}>Delete Account</span>
            <ChevronRight size={18} className="list-chevron" />
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showConfirmDelete && (
        <div className="modal-backdrop fade-in" onClick={() => !isDeleting && setShowConfirmDelete(false)} style={{ zIndex: 10000 }}>
          <div className="modal-card slide-up" onClick={e => e.stopPropagation()} style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertTriangle size={30} />
            </div>
            <h3 style={{ marginBottom: '0.5rem', color: '#f87171' }}>Delete Account?</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              This action is permanent and cannot be undone. All your data, payment history, and hostel association will be deleted.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-secondary w-full" 
                onClick={() => setShowConfirmDelete(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary w-full" 
                style={{ background: '#ef4444', border: 'none' }}
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantProfilePage;
