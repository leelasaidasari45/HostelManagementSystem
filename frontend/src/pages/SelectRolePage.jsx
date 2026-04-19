import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';

const SelectRolePage = () => {
  const [loading, setLoading] = useState(false);
  const { loginContext, user } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelection = async (role) => {
    setLoading(true);
    try {
      const res = await api.put('/api/auth/update-role', { role });
      
      // Update local context with new role
      loginContext({ ...user, role: res.data.role, token: res.data.token });
      
      toast.success(`Welcome aboard!`);
      
      // Navigate to respective dashboard or setup page
      if (role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/tenant/join'); // Send tenants to "Enter Code" page
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-selection-wrapper">
      <div className="mesh-background"></div>
      
      <div className="content-container slide-up">
        <div className="header-section">
          <h1 className="main-title">Welcome!</h1>
          <p className="sub-title">Tell us how you'll be using easyPG</p>
        </div>

        <div className="role-menu glass-effect">
          {/* Owner Option */}
          <button 
            onClick={() => handleRoleSelection('owner')}
            disabled={loading}
            className="role-item group"
          >
            <div className="icon-circle icon-owner shadow-indigo">
              <Building2 size={32} />
            </div>
            <div className="item-text">
              <h3 className="item-title">I am a Hostel Owner</h3>
              <p className="item-desc">I want to manage rooms and tenants</p>
            </div>
            <div className="arrow-wrapper">
              <ChevronRight size={24} className="group-hover:translate-x-1" />
            </div>
          </button>

          <div className="menu-divider"></div>

          {/* Tenant Option */}
          <button 
            onClick={() => handleRoleSelection('tenant')}
            disabled={loading}
            className="role-item group"
          >
            <div className="icon-circle icon-tenant shadow-emerald">
              <User size={32} />
            </div>
            <div className="item-text">
              <h3 className="item-title">I am a Resident</h3>
              <p className="item-desc">I am looking for or staying in a room</p>
            </div>
            <div className="arrow-wrapper">
              <ChevronRight size={24} className="group-hover:translate-x-1" />
            </div>
          </button>
        </div>

        {loading && (
          <div className="loading-overlay">
            <Loader2 className="animate-spin text-white" size={32} />
            <p>Setting up your dashboard...</p>
          </div>
        )}
      </div>

      <style>{`
        .role-selection-wrapper {
          min-height: 100vh;
          background-color: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
        }

        .mesh-background {
          position: absolute;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 20% 20%, #e0e7ff 0%, transparent 40%),
                      radial-gradient(circle at 80% 80%, #d1fae5 0%, transparent 40%);
          filter: blur(100px);
          opacity: 0.8;
        }

        .content-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 480px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .header-section {
          text-align: center;
          margin-bottom: 3rem;
        }

        .main-title {
          font-size: 3.5rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 0.5rem;
          letter-spacing: -2px;
          background: linear-gradient(to bottom, #1e293b, #64748b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sub-title {
          color: #64748b;
          font-size: 1.1rem;
        }

        .role-menu {
          width: 100%;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 1);
          border-radius: 2.5rem;
          padding: 1rem;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.05);
        }

        .role-item {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 1.5rem;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 2rem;
          text-align: left;
        }

        .role-item:hover {
          background: rgba(0, 0, 0, 0.02);
        }

        .icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1.5rem;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .icon-owner {
          background: #4f46e5;
          color: white;
        }

        .shadow-indigo {
          box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);
        }

        .icon-tenant {
          background: #10b981;
          color: white;
        }

        .shadow-emerald {
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
        }

        .role-item:hover .icon-circle {
          transform: scale(1.1);
        }

        .item-text {
          flex: 1;
        }

        .item-title {
          color: #1e293b;
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .item-desc {
          color: #64748b;
          font-size: 0.9rem;
        }

        .arrow-wrapper {
          color: #cbd5e1;
          transition: all 0.3s ease;
        }

        .role-item:hover .arrow-wrapper {
          color: #1e293b;
        }

        .menu-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(0,0,0,0.05), transparent);
          margin: 0.5rem 0;
        }

        .loading-overlay {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.9rem;
        }

        .slide-up {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 480px) {
          .main-title { font-size: 2.5rem; }
          .icon-circle { width: 56px; height: 56px; }
          .role-item { padding: 1rem; }
        }
      `}</style>
    </div>
  );
};

export default SelectRolePage;
