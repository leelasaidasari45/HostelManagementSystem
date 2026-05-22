import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';

const MobileSplash = () => {
  const [status, setStatus] = useState('Initializing...');
  const messages = [
    'Waking up secure servers...',
    'Establishing encrypted link...',
    'Loading your workspace...',
    'Welcome to easyPG!'
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) { setStatus(messages[i]); i++; }
    }, 520);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position:'fixed', inset:0,
      background:'#060810',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      zIndex:9999, fontFamily:"'Inter', system-ui, sans-serif",
      animation:'splashFadeOut 0.4s ease-in-out 2.4s forwards'
    }}>
      {/* Ambient orb */}
      <div style={{
        position:'absolute', width:350, height:350, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
        filter:'blur(60px)', top:-80, left:-60, pointerEvents:'none'
      }} />

      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem', position:'relative', zIndex:1, animation:'splashFadeIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards' }}>
        {/* Logo image */}
        <img
          src="/logo.png"
          alt="easyPG"
          style={{
            width: 160,
            height: 'auto',
            objectFit: 'contain',
            animation: 'splashFloat 2.5s ease-in-out infinite',
            filter: 'drop-shadow(0 0 20px rgba(0,212,170,0.35))'
          }}
        />
      </div>

      <div style={{ position:'absolute', bottom:'3.5rem', display:'flex', flexDirection:'column', alignItems:'center', gap:'.75rem', animation:'splashSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both' }}>
        <div style={{ width:120, height:2, background:'rgba(255,255,255,0.06)', borderRadius:99, overflow:'hidden', position:'relative' }}>
          <div style={{ position:'absolute', width:'45%', height:'100%', background:'linear-gradient(90deg,#00d4aa,#2563eb)', borderRadius:99, animation:'splashSweep 1.4s ease-in-out infinite' }} />
        </div>
        <p style={{ fontSize:'.72rem', color:'rgba(255,255,255,0.3)', fontWeight:500, letterSpacing:'.04em' }}>{status}</p>
      </div>

      <style>{`
        @keyframes splashFadeIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        @keyframes splashSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes splashFadeOut { to{opacity:0;pointer-events:none} }
        @keyframes splashFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes splashSweep { 0%{transform:translateX(-150%)} 100%{transform:translateX(320%)} }
      `}</style>
    </div>
  );
};

export default MobileSplash;
