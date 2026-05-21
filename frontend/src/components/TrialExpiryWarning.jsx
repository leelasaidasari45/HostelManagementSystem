import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const TrialExpiryWarning = ({ trialEndDate, user, onUpgradeClick }) => {
  const [show, setShow] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!trialEndDate || user?.subscription_status !== 'trial') return;

    const checkExpiry = () => {
      const endDate = new Date(trialEndDate);
      const now = new Date();
      const diff = endDate - now;

      if (diff <= 0) {
        // Trial expired, will be handled by SubscriptionGuard redirect
        setShow(false);
      } else if (diff <= 24 * 60 * 60 * 1000) {
        // Less than 24 hours left
        setShow(true);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setShow(false);
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [trialEndDate, user]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        maxWidth: '380px',
        padding: '1rem',
        background: 'linear-gradient(135deg, rgba(239,68,68,0.95), rgba(249,115,22,0.95))',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 40px rgba(239,68,68,0.2)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        animation: 'slideInRight 300ms ease-out',
      }}
    >
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <AlertTriangle size={20} color="#dc2626" flexShrink={0} />
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 0.25rem 0', color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>
            Your trial ends soon!
          </h4>
          <p style={{ margin: '0 0 0.75rem 0', color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}>
            {timeLeft} left to upgrade and continue using easyPG
          </p>
          <button
            onClick={() => {
              onUpgradeClick?.();
              setShow(false);
            }}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'all 200ms',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
          >
            Upgrade Now
          </button>
        </div>
        <button
          onClick={() => setShow(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default TrialExpiryWarning;
