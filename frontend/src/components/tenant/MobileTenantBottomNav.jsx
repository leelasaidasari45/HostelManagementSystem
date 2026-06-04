import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, CreditCard, MessageSquare, ArrowRightCircle, Menu, LogOut, X, Search, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../api';
import '../owner/MobileBottomNav.css';

const MobileTenantBottomNav = ({ activeTab, setActiveTab }) => {
  const { logoutContext } = useAuth();
  const navigate = useNavigate();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isActive = (tab) => activeTab === tab;

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await api.delete('/api/auth/delete-account');
      toast.success('Account deleted successfully');
      
      // Wait a moment then logout
      setTimeout(() => {
        logoutContext();
      }, 1000);
    } catch (err) {
      setIsDeleting(false);
      setShowConfirmDelete(false);
      toast.error('Failed to delete account');
      console.error(err);
    }
  };

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
            <button onClick={() => setShowConfirmDelete(true)} style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
              <Trash2 size={20} style={{ color: '#ef4444' }} /> 
              <span style={{ color: '#ef4444' }}>Delete Account</span>
            </button>
            <button className="logout-btn" onClick={logoutContext} style={{ marginTop: '0.5rem', width: '100%' }}>
              <LogOut size={20} /> Logout
            </button>
          </div>
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
    </>
  );
};

export default MobileTenantBottomNav;
