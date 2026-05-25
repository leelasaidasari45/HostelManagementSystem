import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext();

// Reduced timeout — cached users never see a spinner at all
const AUTH_TIMEOUT_MS = 3000;

// Ping the backend every 10 minutes to prevent Render.com cold starts
const KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Instantly restore user from cache — zero loading flash
    try {
      const cached = localStorage.getItem('cached_user');
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [loadingAuth, setLoadingAuth] = useState(() => {
    // If we have a cached user, start as NOT loading
    return !localStorage.getItem('cached_user');
  });
  const hasTimedOut = useRef(false);

  api.defaults.withCredentials = true;

  // Check if subscription is valid (owner-specific check)
  const isSubscriptionValid = useCallback((userData) => {
    // If it's a native mobile app (Capacitor/Cordova), subscription is always valid
    const isNative = typeof window !== 'undefined' &&
      (window.Capacitor?.isNativePlatform?.() || window.cordova !== undefined);
    if (isNative) return true;

    if (!userData || userData.role !== 'owner') return true; // Tenants don't have subscriptions
    
    const now = new Date();
    const trialEnd = userData.trial_end_date ? new Date(userData.trial_end_date) : null;
    
    if (!trialEnd) return false; // No trial end date = subscription not set up
    if (now > trialEnd) return false; // Trial/subscription has expired
    
    const isTrialValid = userData.subscription_status === 'trial';
    const isSubscriptionActive = userData.subscription_status === 'active';
    
    return isTrialValid || isSubscriptionActive;
  }, []);

  const verifySession = useCallback(async (silent = false) => {
    if (!silent) setLoadingAuth(true);
    hasTimedOut.current = false;

    const timeoutId = setTimeout(() => {
      if (!silent) {
        hasTimedOut.current = true;
        setLoadingAuth(false);
      }
    }, AUTH_TIMEOUT_MS);

    try {
      const res = await api.get('/api/auth/me');
      clearTimeout(timeoutId);
      
      const freshUserData = res.data;
      
      // Update cache with fresh data
      localStorage.setItem('cached_user', JSON.stringify(freshUserData));
      setUser(freshUserData);
    } catch (err) {
      clearTimeout(timeoutId);
      // Only clear user if the server explicitly says unauthorized (401)
      // Don't clear on network errors (backend cold start / offline)
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('cached_user');
        setUser(null);
      }
    } finally {
      if (!hasTimedOut.current) {
        setLoadingAuth(false);
      }
    }
  }, []);

  useEffect(() => {
    const cachedToken = localStorage.getItem('access_token');
    if (cachedToken) {
      // User data already restored from cache in useState initializer
      // Just silently verify in background — no spinner shown
      verifySession(true);
    } else {
      verifySession(false);
    }

    // Keep-alive ping to prevent Render backend from sleeping
    const keepAlive = setInterval(() => {
      api.get('/').catch(() => {}); // Silent ping to root
    }, KEEP_ALIVE_INTERVAL_MS);

    return () => clearInterval(keepAlive);
  }, [verifySession]);

  const loginContext = useCallback((userData) => {
    if (userData.token) localStorage.setItem('access_token', userData.token);
    localStorage.setItem('cached_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logoutContext = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Backend logout failed, forcing frontend clear', err);
    } finally {
      sessionStorage.clear();
      localStorage.removeItem('access_token');
      localStorage.removeItem('cached_user');
      setUser(null);
      window.location.href = '/login';
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loadingAuth, loginContext, logoutContext, logout: logoutContext, verifySession, isSubscriptionValid }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
