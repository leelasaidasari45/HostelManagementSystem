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
    <div className="auth-container bg-[#0f172a]" style={{ minHeight: '100vh', padding: '2rem' }}>
      <div className="max-w-4xl w-full mx-auto">
        <div className="text-center mb-12 slide-up">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Path</h1>
          <p className="text-slate-400 text-lg">How will you be using easyPG?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Owner Card */}
          <div 
            onClick={() => setSelectedRole('owner')}
            className={`role-card glass-panel p-8 cursor-pointer transition-all duration-300 transform ${
              selectedRole === 'owner' ? 'ring-2 ring-indigo-500 scale-[1.02] bg-indigo-500/10' : 'hover:scale-[1.01] hover:bg-white/5'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${selectedRole === 'owner' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-indigo-400'}`}>
                <Building2 size={40} />
              </div>
              {selectedRole === 'owner' && <CheckCircle2 className="text-indigo-500" size={24} />}
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Hostel Owner</h3>
            <p className="text-slate-400 leading-relaxed mb-6">
              Manage rooms, automate rent collection, and track tenant complaints across all your properties in one place.
            </p>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full" /> QR-based onboarding</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full" /> Digital ledger management</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full" /> Staff management</li>
            </ul>
          </div>

          {/* Tenant Card */}
          <div 
            onClick={() => setSelectedRole('tenant')}
            className={`role-card glass-panel p-8 cursor-pointer transition-all duration-300 transform ${
              selectedRole === 'tenant' ? 'ring-2 ring-emerald-500 scale-[1.02] bg-emerald-500/10' : 'hover:scale-[1.01] hover:bg-white/5'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${selectedRole === 'tenant' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-emerald-400'}`}>
                <User size={40} />
              </div>
              {selectedRole === 'tenant' && <CheckCircle2 className="text-emerald-500" size={24} />}
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Resident / Tenant</h3>
            <p className="text-slate-400 leading-relaxed mb-6">
              Easily pay rent, report maintenance issues, and stay updated with hostel notices from your personal portal.
            </p>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full" /> Easy digital payments</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full" /> Quick issue reporting</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full" /> Daily food menu view</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center slide-up" style={{ animationDelay: '0.2s' }}>
          <button 
            onClick={handleRoleSelection}
            disabled={!selectedRole || loading}
            className={`btn btn-primary btn-lg px-12 py-4 rounded-xl flex items-center gap-3 transition-all ${
              !selectedRole ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Continue Application <ArrowRight size={20} /></>}
          </button>
          <p className="text-slate-500 mt-6 text-sm">You can change your role later by contacting support.</p>
        </div>
      </div>

      <style>{`
        .role-card {
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 2rem;
          min-height: 400px;
          display: flex;
          flex-direction: column;
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
