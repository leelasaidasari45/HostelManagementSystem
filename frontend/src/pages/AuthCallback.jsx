import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { loginContext } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        if (!session) {
          navigate('/login');
          return;
        }

        // Sync with backend
        const res = await api.post('/api/auth/social-sync', {
          supabaseId: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata.full_name || session.user.email.split('@')[0],
        });

        // Set our backend JWT
        loginContext(res.data);
        
        toast.success('Successfully logged in with Google!');
        
        // Redirect based on role
        if (res.data.role === 'unassigned') {
          navigate('/select-role');
        } else if (res.data.role === 'owner') {
          navigate('/owner/dashboard');
        } else {
          navigate('/tenant/dashboard');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        toast.error('Failed to sync social login with account');
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, loginContext]);

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--bg-base)', gap: '1.5rem' }}>
      <div className="skeleton skeleton-avatar" style={{ width: 64, height: 64, borderRadius: '50%' }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <div className="skeleton skeleton-title" style={{ width: 200, height: 20 }} />
        <div className="skeleton skeleton-text" style={{ width: 150 }} />
      </div>
      <p className="pulse-opacity" style={{ fontSize:'1rem', color:'var(--text-dim)', fontWeight:500, letterSpacing:'0.02em', marginTop: '0.5rem' }}>
        Finishing your secure login
        <span className="pulsing-dot-container">
          <span className="pulsing-dot"></span>
          <span className="pulsing-dot"></span>
          <span className="pulsing-dot"></span>
        </span>
      </p>
    </div>
  );
};

export default AuthCallback;
