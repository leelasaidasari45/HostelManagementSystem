import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Plus, DoorOpen, Menu, CreditCard, MessageSquare, LogOut, X, Landmark, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../api';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await api.delete('/api/auth/delete-account');
      toast.success('Account deleted successfully');
      
      setTimeout(() => {
        logout();
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
        <Link to="/owner/dashboard" className={`nav-item ${isActive('/owner/dashboard') ? 'active' : ''}`}>
          <Home size={22} />
          <span>Home</span>
        </Link>
        <Link to="/owner/tenants" className={`nav-item ${isActive('/owner/tenants') ? 'active' : ''}`}>
          <Users size={22} />
          <span>Tenants</span>
        </Link>

        {/* Center Add Button */}
        <div className="nav-item-center">
          <Link to="/owner/create-hostel" className="center-btn pulse-glow">
            <Plus size={28} />
          </Link>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-ghost)', marginTop: '4px' }}>Add New</span>
        </div>

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
            <Link to="/owner/bank-accounts" onClick={() => setShowMoreMenu(false)}>
              <Landmark size={20} /> Bank Accounts
            </Link>
            <Link to="/owner/billing" onClick={() => setShowMoreMenu(false)}>
              <CreditCard size={20} /> Billing & Subscriptions
            </Link>
            <Link to="/owner/complaints" onClick={() => setShowMoreMenu(false)}>
              <MessageSquare size={20} /> Complaints
            </Link>
            <button onClick={() => setShowConfirmDelete(true)} style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
              <Trash2 size={20} style={{ color: '#ef4444' }} /> 
              <span style={{ color: '#ef4444', fontSize: '0.95rem', fontWeight: 500 }}>Delete Account</span>
            </button>
            <button className="logout-btn" onClick={logout} style={{ marginTop: '0.5rem' }}>
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
              This action is permanent and cannot be undone. All your data, properties, tenants, and payment history will be deleted.
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

export default MobileBottomNav;
