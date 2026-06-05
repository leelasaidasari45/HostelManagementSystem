import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, QrCode, Bell, LogOut, Landmark, CreditCard, MessageSquare, Trash2, AlertTriangle, Download, XCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useHostel } from '../../context/HostelContext';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import api from '../../api';
import './OwnerProfilePage.css';

const OwnerProfilePage = () => {
  const navigate = useNavigate();
  const { user, logoutContext } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { activeHostel } = useHostel();

  const [showQrModal, setShowQrModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const joinUrl = `${window.location.origin}/tenant/join?code=${activeHostel?.code || ''}`;
  
  const downloadQR = () => {
    const svg = document.getElementById('profile-hostel-qr');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height;
      ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = `${activeHostel?.name || 'hostel'}-QR.png`;
      a.href = canvas.toDataURL('image/png'); a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    toast.success('QR downloaded!');
  };

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

  return (
    <div className="profile-page-container">
      {/* Top Gradient Card */}
      <div className="profile-top-card">
        <div className="profile-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} color="#fff" />
          </button>
          <span style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600 }}>Help</span>
        </div>
        <div className="profile-user-info">
          <h2>{user?.name || 'Owner'}</h2>
          <p>{user?.phone || ''}</p>
          <p>{user?.email || ''}</p>
        </div>
      </div>

      <div className="profile-content">
        {/* 4 Features Row (From old header) */}
        <div className="profile-features-grid">
          <button className="feature-card" onClick={toggleTheme}>
            <div className="feature-icon">{isDarkMode ? <Sun size={24} /> : <Moon size={24} />}</div>
            <span>Theme</span>
          </button>
          <button className="feature-card" onClick={() => activeHostel ? setShowQrModal(true) : toast.error('Select a hostel first')}>
            <div className="feature-icon"><QrCode size={24} /></div>
            <span>QR Code</span>
          </button>
          <button className="feature-card" onClick={() => navigate('/owner/complaints')}>
            <div className="feature-icon"><Bell size={24} /></div>
            <span>Alerts</span>
          </button>
          <button className="feature-card" onClick={logoutContext}>
            <div className="feature-icon"><LogOut size={24} /></div>
            <span>Logout</span>
          </button>
        </div>

        {/* Vertical List from Bottom Nav "More" */}
        <div className="profile-list">
          <button className="list-item" onClick={() => navigate('/owner/bank-accounts')}>
            <Landmark size={20} className="list-icon" />
            <span>Bank Accounts</span>
            <ChevronRight size={18} className="list-chevron" />
          </button>
          <button className="list-item" onClick={() => navigate('/owner/billing')}>
            <CreditCard size={20} className="list-icon" />
            <span>Billing & Subscriptions</span>
            <ChevronRight size={18} className="list-chevron" />
          </button>
          <button className="list-item" onClick={() => navigate('/owner/complaints')}>
            <MessageSquare size={20} className="list-icon" />
            <span>Complaints</span>
            <ChevronRight size={18} className="list-chevron" />
          </button>
          <button className="list-item" onClick={() => setShowConfirmDelete(true)}>
            <Trash2 size={20} color="#ef4444" className="list-icon" />
            <span style={{ color: '#ef4444' }}>Delete Account</span>
            <ChevronRight size={18} className="list-chevron" />
          </button>
        </div>
      </div>

      {/* QR Modal */}
      {showQrModal && (
        <div className="modal-backdrop fade-in" onClick={() => setShowQrModal(false)}>
          <div className="modal-card slide-up" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowQrModal(false)}
              style={{ position:'absolute', top:'1rem', right:'1rem', background:'transparent', border:'none', color:'var(--text-dim)', cursor:'pointer' }}>
              <XCircle size={22} />
            </button>
            <h3 style={{ marginBottom:'.5rem' }}>Hostel QR Code</h3>
            <p style={{ color:'var(--text-dim)', fontSize:'.88rem', marginBottom:'1.5rem' }}>
              Tenants scan this to join <strong>{activeHostel?.name}</strong>
            </p>
            <div style={{ background:'#fff', padding:'1rem', borderRadius:'12px', width:'fit-content', margin:'0 auto 1.5rem' }}>
              <QRCodeSVG id="profile-hostel-qr" value={joinUrl} size={180} level="H" includeMargin />
            </div>
            <div style={{ textAlign:'center', marginBottom:'1rem' }}>
              <span style={{ fontSize:'.75rem', color:'var(--text-dim)' }}>Hostel Code</span>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'1.5rem', fontWeight:700, color:'#f97316', letterSpacing:'.15em' }}>
                {activeHostel?.code}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'.5rem' }}>
              <button className="btn btn-primary w-full" onClick={downloadQR}>
                <Download size={16} /> Download QR
              </button>
              <button className="btn btn-secondary w-full" onClick={() => { navigator.clipboard.writeText(joinUrl); toast.success('Link copied!'); }}>
                Copy Join Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showConfirmDelete && (
        <div className="modal-backdrop fade-in" onClick={() => !isDeleting && setShowConfirmDelete(false)} style={{ zIndex: 10000 }}>
          <div className="modal-card slide-up" onClick={e => e.stopPropagation()} style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertTriangle size={30} />
            </div>
            <h3 style={{ marginBottom: '0.5rem', color: '#f87171' }}>Delete Account?</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              This action is permanent and cannot be undone. All your properties, tenants, and payment history will be permanently deleted.
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

export default OwnerProfilePage;
