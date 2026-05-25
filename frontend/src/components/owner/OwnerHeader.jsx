import React, { useState, useEffect } from 'react';
import { LogOut, QrCode, XCircle, Download, Sun, Moon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { useHostel } from '../../context/HostelContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import TrialBadge from '../TrialBadge';
import toast from 'react-hot-toast';

const OwnerHeader = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const { activeHostel, hostels, switchHostel } = useHostel();
  const { logoutContext, user } = useAuth();
  const isNative = typeof window !== 'undefined' &&
    (window.Capacitor?.isNativePlatform?.() || window.cordova !== undefined);
  const { isDarkMode, toggleTheme } = useTheme();
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    if (showQrModal) document.body.classList.add('hide-sidebar-all');
    else document.body.classList.remove('hide-sidebar-all');
    return () => document.body.classList.remove('hide-sidebar-all');
  }, [showQrModal]);

  const joinUrl = `${window.location.origin}/tenant/join?code=${activeHostel?.code || ''}`;

    const downloadQR = () => {
      const svg = document.getElementById('hostel-qr');
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



  return (
    <>
      <header className="dashboard-header glass-panel">
        <div>
          <h1>{title}</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '.88rem', marginTop: '.15rem' }}>
            {activeHostel ? `${subtitle}: ${activeHostel.name} · ${activeHostel.code}` : 'Select a property'}
          </p>
        </div>

        <div className="header-actions">
          {hostels.length > 0 && (
            <select
              className="form-control"
              style={{ width: 'auto', padding: '.45rem .9rem', fontSize: '.88rem' }}
              value={activeHostel?._id || ''}
              onChange={(e) => switchHostel(e.target.value)}
            >
              {hostels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
            </select>
          )}

          {/* Trial Badge */}
          {!isNative && user?.subscription_status === 'trial' && (
            <TrialBadge
              trialEndDate={user.trial_end_date}
              subscription_status={user.subscription_status}
              onUpgrade={() => navigate('/select-plan')}
            />
          )}

          {/* Theme toggle */}
          <button className="icon-btn" onClick={toggleTheme} title={isDarkMode ? 'Light mode' : 'Dark mode'}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* QR button */}
          {activeHostel && (
            <button className="icon-btn" onClick={() => setShowQrModal(true)} title="Hostel QR Code"
              style={{ color: '#f97316', borderColor: 'rgba(249,115,22,0.3)' }}>
              <QrCode size={18} />
            </button>
          )}

          {/* Avatar + Logout */}

          <button onClick={logoutContext} className="header-logout-btn" title="Logout">
            <LogOut size={16} /> <span className="btn-label">Logout</span>
          </button>
        </div>
      </header>

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
              <QRCodeSVG id="hostel-qr" value={joinUrl} size={180} level="H" includeMargin />
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
    </>
  );
};

export default OwnerHeader;
