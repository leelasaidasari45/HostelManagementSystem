import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';

const SelectRolePage = () => {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const { loginContext, user } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelection = async (role) => {
    setSelected(role);
    setLoading(true);
    try {
      const res = await api.put('/api/auth/update-role', { role });
      loginContext({
        ...user,
        role: res.data.role,
        token: res.data.token,
        payment_setup_complete: res.data.payment_setup_complete,
        subscription_status: res.data.subscription_status,
        trial_end_date: res.data.trial_end_date,
      });
      toast.success('Welcome aboard!');
      if (role === 'owner') {
        // Owner gets automatic 2-day free trial, route directly to dashboard
        navigate('/owner/dashboard', { replace: true });
      } else {
        // Tenant goes directly to join
        navigate('/tenant/join', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role');
      setSelected(null);
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg-base)', padding:'1.5rem', position:'relative', overflow:'hidden'
    }}>
      {/* Orbs */}
      <div style={{ position:'fixed', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', filter:'blur(80px)', top:-150, left:-100, pointerEvents:'none' }} />
      <div style={{ position:'fixed', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(5,150,105,0.15) 0%, transparent 70%)', filter:'blur(80px)', bottom:-100, right:-80, pointerEvents:'none' }} />

      <div className="slide-up" style={{ position:'relative', zIndex:1, width:'100%', maxWidth:480, display:'flex', flexDirection:'column', alignItems:'center' }}>
        {/* Logo */}
        <div style={{ marginBottom:'2.5rem' }}>
          <img src="/logo.png" alt="easyPG" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
        </div>

        <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <h1 style={{ fontSize:'2.2rem', fontWeight:700, marginBottom:'.5rem' }}>Welcome aboard!</h1>
          <p style={{ color:'var(--text-dim)', fontSize:'1rem' }}>How will you be using easyPG?</p>
        </div>

        {/* Cards */}
        <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:'.75rem' }}>
          {[
            {
              role: 'owner',
              icon: <Building2 size={28} color="#fff" />,
              iconBg: 'linear-gradient(135deg,#7c3aed,#2563eb)',
              glow: 'rgba(124,58,237,0.2)',
              title: 'I am a Hostel Owner',
              desc: 'Manage rooms, tenants, payments and analytics',
              badge: 'Owner',
              badgeColor: '#a78bfa',
            },
            {
              role: 'tenant',
              icon: <User size={28} color="#fff" />,
              iconBg: 'linear-gradient(135deg,#059669,#0891b2)',
              glow: 'rgba(5,150,105,0.2)',
              title: 'I am a Resident',
              desc: 'Join a PG, pay rent, and manage my stay',
              badge: 'Tenant',
              badgeColor: '#34d399',
            },
          ].map(({ role, icon, iconBg, glow, title, desc, badge, badgeColor }) => (
            <button
              key={role}
              onClick={() => handleRoleSelection(role)}
              disabled={loading}
              style={{
                width:'100%', display:'flex', alignItems:'center', gap:'1.25rem',
                padding:'1.5rem', background:'var(--bg-surface)',
                border:`1px solid ${selected===role ? 'var(--border-active)' : 'var(--border-muted)'}`,
                borderRadius:'var(--r-xl)', cursor:loading?'wait':'pointer',
                textAlign:'left', transition:'all 200ms',
                boxShadow: selected===role ? `0 0 20px ${glow}` : 'none',
                opacity: loading && selected!==role ? 0.5 : 1,
              }}
              onMouseEnter={e => { if(!loading) e.currentTarget.style.borderColor='var(--border-active)'; e.currentTarget.style.boxShadow=`0 0 20px ${glow}`; }}
              onMouseLeave={e => { if(selected!==role){ e.currentTarget.style.borderColor='var(--border-muted)'; e.currentTarget.style.boxShadow='none'; } }}
            >
              <div style={{ width:60, height:60, borderRadius:'50%', background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 8px 20px ${glow}`,
                animation: loading && selected===role ? 'pulse-op 1.2s infinite ease-in-out' : 'none' }}>
                {icon}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'.6rem', marginBottom:'.3rem' }}>
                  <h3 style={{ fontSize:'1.1rem', margin:0 }}>{title}</h3>
                  <span style={{ fontSize:'.72rem', fontWeight:600, padding:'.15rem .5rem', borderRadius:'99px', background:`${glow}`, color:badgeColor }}>{badge}</span>
                </div>
                <p style={{ fontSize:'.87rem', color:'var(--text-dim)', lineHeight:1.5 }}>{desc}</p>
              </div>
              <ChevronRight size={20} style={{ color:'var(--text-ghost)', flexShrink:0 }} />
            </button>
          ))}
        </div>

        <p style={{ marginTop:'2rem', fontSize:'.82rem', color:'var(--text-ghost)', textAlign:'center' }}>
          You can only select this once. Choose carefully.
        </p>
      </div>
    </div>
  );
};

export default SelectRolePage;
