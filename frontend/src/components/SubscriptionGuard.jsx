import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * SubscriptionGuard Component
 * Wraps owner dashboard routes to check trial/subscription status
 * Automatically redirects to select-plan if subscription has expired
 * Shows trial expiry warnings
 */
const SubscriptionGuard = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasCheckedExpiry, setHasCheckedExpiry] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'owner') return;

    const checkSubscription = () => {
      const now = new Date();
      const trialEnd = user.trial_end_date ? new Date(user.trial_end_date) : null;

      // If trial has expired and status is still 'trial', redirect to select-plan
      if (
        user.subscription_status === 'trial' &&
        trialEnd &&
        now > trialEnd
      ) {
        navigate('/select-plan', { replace: true });
        return;
      }

      // If status is neither 'trial' nor 'active', redirect to select-plan
      if (
        user.subscription_status !== 'trial' &&
        user.subscription_status !== 'active'
      ) {
        if (window.location.pathname !== '/select-plan') {
          navigate('/select-plan', { replace: true });
        }
        return;
      }

      setHasCheckedExpiry(true);
    };

    checkSubscription();

    // Re-check every minute
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  // Don't render children until we've confirmed subscription is valid
  if (user?.role === 'owner' && !hasCheckedExpiry) {
    return null; // Silent redirect, no loading screen
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
