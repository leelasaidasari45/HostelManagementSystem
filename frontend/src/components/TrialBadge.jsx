import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

const TrialBadge = ({ trialEndDate, onUpgrade, subscription_status }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpiring, setIsExpiring] = useState(false);

  useEffect(() => {
    if (subscription_status !== 'trial' || !trialEndDate) return;

    const updateTimeLeft = () => {
      const endDate = new Date(trialEndDate);
      const now = new Date();
      const diff = endDate - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setIsExpiring(true);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h left`);
        } else {
          setTimeLeft(`${hours}h left`);
          if (hours <= 12) setIsExpiring(true);
        }
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [trialEndDate, subscription_status]);

  if (subscription_status !== 'trial') return null;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem 1rem',
      background: isExpiring
        ? 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(249,115,22,0.1))'
        : 'linear-gradient(135deg, rgba(124, 58, 237,0.1), rgba(59, 130, 246,0.1))',
      border: isExpiring ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(124, 58, 237,0.3)',
      borderRadius: '0.75rem',
      animation: isExpiring ? 'pulse-warning 1.5s ease-in-out infinite' : 'none',
    }}>
      <Sparkles
        size={16}
        color={isExpiring ? '#ef4444' : '#7c3aed'}
        fill={isExpiring ? '#ef4444' : '#7c3aed'}
      />
      <span style={{
        fontSize: '0.85rem',
        fontWeight: 600,
        color: isExpiring ? '#ef4444' : '#7c3aed',
      }}>
        {isExpiring ? '⚠️ ' : ''}Trial: {timeLeft}
      </span>
      <button
        onClick={onUpgrade}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          padding: '0.3rem 0.6rem',
          background: isExpiring ? 'rgba(239,68,68,0.2)' : 'rgba(124, 58, 237,0.2)',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: isExpiring ? '#dc2626' : '#6d28d9',
          transition: 'all 200ms',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = isExpiring ? 'rgba(239,68,68,0.3)' : 'rgba(124, 58, 237,0.3)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = isExpiring ? 'rgba(239,68,68,0.2)' : 'rgba(124, 58, 237,0.2)';
        }}
      >
        Upgrade <ArrowRight size={12} />
      </button>
      <style>{`
        @keyframes pulse-warning {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default TrialBadge;
