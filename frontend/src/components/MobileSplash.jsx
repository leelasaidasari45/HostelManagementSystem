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
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position:'fixed', inset:0,
      background:'#f8fafc',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      zIndex:9999, fontFamily:"'Inter', system-ui, sans-serif",
      animation:'splashFadeOut 1.0s cubic-bezier(0.4, 0, 0.2, 1) 2.0s forwards'
    }}>
      {/* Ambient orb */}
      <div style={{
        position:'absolute', width:400, height:400, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(234, 179, 8,0.12) 0%, transparent 70%)',
        filter:'blur(80px)', top:-100, left:-80, pointerEvents:'none'
      }} />

      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem', position:'relative', zIndex:1, animation:'splashFadeIn 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
        {/* Logo image */}
        <img
          src="/logo.png"
          alt="easyPG"
          style={{
            width: 170,
            height: 'auto',
            objectFit: 'contain',
            animation: 'splashFloat 3s ease-in-out infinite',
            filter: 'drop-shadow(0 8px 30px rgba(234, 179, 8,0.15))'
          }}
        />
      </div>

      <div style={{ position:'absolute', bottom:'3.5rem', display:'flex', flexDirection:'column', alignItems:'center', gap:'.75rem', animation:'splashSlideUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both' }}>
        <div style={{ width:130, height:3, background:'rgba(15, 23, 42, 0.06)', borderRadius:99, overflow:'hidden', position:'relative' }}>
          <div style={{ position:'absolute', width:'45%', height:'100%', background:'linear-gradient(90deg, #eab308, #fde047)', borderRadius:99, animation:'splashSweep 1.4s ease-in-out infinite' }} />
        </div>
        <p style={{ fontSize:'.75rem', color:'#64748b', fontWeight:500, letterSpacing:'.04em' }}>{status}</p>
      </div>

      <style>{`
        @keyframes splashFadeIn { 
          from { opacity: 0; transform: scale(0.85) translateY(15px); filter: blur(8px); } 
          to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); } 
        }
        @keyframes splashSlideUp { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes splashFadeOut { 
          from { opacity: 1; transform: scale(1); filter: blur(0); }
          to { opacity: 0; transform: scale(1.05); filter: blur(10px); pointer-events: none; }
        }
        @keyframes splashFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes splashSweep { 0%{transform:translateX(-150%)} 100%{transform:translateX(320%)} }
      `}</style>
    </div>
  );
};

export default MobileSplash;
