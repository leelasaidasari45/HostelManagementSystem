import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';

const SelectRolePage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginContext, user } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelection = async () => {
    if (!selectedRole) return toast.error('Please select a role to continue');

    setLoading(true);
    try {
      const res = await api.put('/api/auth/update-role', { role: selectedRole });
      
      // Update local context with new role
      loginContext({ ...user, role: res.data.role, token: res.data.token });
      
      toast.success(`Welcome aboard as a ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}!`);
      
      // Navigate to respective dashboard
      if (selectedRole === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/tenant/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container bg-[#0f172a] flex flex-col items-center justify-center" style={{ minHeight: '100vh', padding: '1rem' }}>
      <div className="max-w-lg w-full mx-auto slide-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Choose Your Path</h1>
          <p className="text-slate-400">Select how you'll use easyPG</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Owner Card */}
          <div 
            onClick={() => setSelectedRole('owner')}
            className={`role-card glass-panel p-5 cursor-pointer transition-all duration-300 transform flex flex-col items-center text-center ${
              selectedRole === 'owner' 
                ? 'ring-2 ring-indigo-500 scale-[1.05] bg-indigo-500/10 border-indigo-500/50' 
                : 'hover:scale-[1.02] hover:bg-white/5 border-white/5'
            }`}
            style={{ minHeight: '240px' }}
          >
            <div className={`p-4 rounded-xl mb-4 ${selectedRole === 'owner' ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-slate-800 text-indigo-400'}`}>
              <Building2 size={32} className={selectedRole === 'owner' ? 'text-white' : ''} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Hostel Owner</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Manage rooms, automate rent, and handle complaints.
            </p>
            {selectedRole === 'owner' && (
              <div className="mt-auto pt-2 text-indigo-400">
                <CheckCircle2 size={20} />
              </div>
            )}
          </div>

          {/* Tenant Card */}
          <div 
            onClick={() => setSelectedRole('tenant')}
            className={`role-card glass-panel p-5 cursor-pointer transition-all duration-300 transform flex flex-col items-center text-center ${
              selectedRole === 'tenant' 
                ? 'ring-2 ring-emerald-500 scale-[1.05] bg-emerald-500/10 border-emerald-500/50' 
                : 'hover:scale-[1.02] hover:bg-white/5 border-white/5'
            }`}
            style={{ minHeight: '240px' }}
          >
            <div className={`p-4 rounded-xl mb-4 ${selectedRole === 'tenant' ? 'bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-800 text-emerald-400'}`}>
              <User size={32} className={selectedRole === 'tenant' ? 'text-white' : ''} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Resident</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Pay rent, track notices, and report issues.
            </p>
            {selectedRole === 'tenant' && (
              <div className="mt-auto pt-2 text-emerald-400">
                <CheckCircle2 size={20} />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <button 
            onClick={handleRoleSelection}
            disabled={!selectedRole || loading}
            className={`btn btn-primary w-full max-w-xs py-3 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${
              !selectedRole ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:scale-[1.02]'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Get Started <ArrowRight size={20} /></>}
          </button>
        </div>
      </div>

      <style>{`
        .role-card {
          border-width: 1px;
          border-style: solid;
          border-radius: 2rem;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .slide-up {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SelectRolePage;
