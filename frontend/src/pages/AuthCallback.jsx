import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
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
    <div className="flex flex-col items-center justify-center h-screen bg-[#0f172a] text-white">
      <Loader2 size={48} className="animate-spin text-indigo-500 mb-4" />
      <p className="text-xl font-medium">Finishing your secure login...</p>
    </div>
  );
};

export default AuthCallback;
