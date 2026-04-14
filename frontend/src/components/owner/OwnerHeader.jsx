import React, { useState, useEffect } from 'react';
import { LogOut, QrCode, XCircle, Download, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { useHostel } from '../../context/HostelContext';
import toast from 'react-hot-toast';
import ThemeToggle from '../ThemeToggle';

const OwnerHeader = ({ title, subtitle }) => {
  const { activeHostel, hostels, switchHostel } = useHostel();
  const { logoutContext } = useAuth();
  const [showQrModal, setShowQrModal] = useState(false);

  // Toggle body class to hide sidebar when modal is open
  useEffect(() => {
    if (showQrModal) {
      document.body.classList.add('hide-sidebar-all');
    } else {
      document.body.classList.remove('hide-sidebar-all');
    }
    return () => document.body.classList.remove('hide-sidebar-all');
  }, [showQrModal]);

  // Generate the full direct-join URL
  const joinUrl = `${window.location.origin}/tenant/join?code=${activeHostel?.code || ''}`;

  const downloadQR = () => {
    const svg = document.getElementById('hostel-qr');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${activeHostel?.name || 'hostel'}-QR.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    toast.success('QR Code download started!');
  };

  return (
    <>
      <header className="dashboard-header flex items-center justify-between glass-panel mb-8">
        <div>
          <h1>{title}</h1>
          <p className="text-muted">
            {activeHostel ? `${subtitle}: ${activeHostel.name} (${activeHostel.code})` : 'Select a property'}
          </p>
        </div>
        <div className="header-actions flex items-center gap-3">
          {hostels.length > 0 && (
            <select
              className="form-control"
              style={{ width: 'auto', padding: '0.4rem 1rem' }}
              value={activeHostel?._id || ''}
              onChange={(e) => switchHostel(e.target.value)}
            >
              {hostels.map(h => (
                <option key={h._id} value={h._id}>{h.name}</option>
              ))}
            </select>
          )}
          
          {activeHostel ? (
            <button 
              className="header-logout-btn qr-btn" 
              style={{ 
                background: 'rgba(249, 115, 22, 0.15)', 
                color: '#f97316', 
                borderColor: 'rgba(249, 115, 22, 0.3)',
                fontWeight: '700'
              }}
              onClick={() => setShowQrModal(true)}
              title="Show Hostel QR Code"
            >
              <QrCode size={18} /> QR CODE
            </button>
          ) : hostels.length > 0 ? (
            <button className="header-logout-btn opacity-50 cursor-wait">
              <Loader2 size={18} className="animate-spin" /> QR
            </button>
          ) : null}

          <ThemeToggle />

          <button onClick={logoutContext} className="header-logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="flex items-center justify-center p-4 fade-in" style={{ background: 'rgba(0,0,0,0.8)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <div className="glass-panel p-8 w-full max-w-sm slide-up text-center" style={{ position: 'relative', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <button
              onClick={() => setShowQrModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <XCircle size={24} />
            </button>

            <h3 className="mb-2">Hostel QR Code</h3>
            <p className="text-muted mb-6">Tenants can scan this to join <strong>{activeHostel?.name}</strong> instantly.</p>
            
            <div className="qr-container p-4 bg-white rounded-xl mb-6 mx-auto" style={{ width: 'fit-content' }}>
              <QRCodeSVG 
                id="hostel-qr"
                value={joinUrl} 
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="flex-col gap-2">
                <p className="text-xs text-muted mb-4 truncate">Link: {joinUrl}</p>
                <button className="btn btn-primary w-full gap-2" onClick={downloadQR}>
                  <Download size={18} /> Download QR
                </button>
                <button className="btn btn-secondary w-full mt-2" onClick={() => {
                   navigator.clipboard.writeText(joinUrl);
                   toast.success('Join link copied!');
                }}>
                  Copy Link
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OwnerHeader;
