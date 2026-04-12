import React from 'react';

const MobileSplash = () => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.logoWrapper}>
          <img 
            src="https://i.pinimg.com/736x/1d/31/58/1d315807fbdbf074612825fcdaa7c9b8.jpg" 
            alt="easyPG Logo" 
            style={styles.logo}
          />
        </div>
        <h1 style={styles.title}>easyPG</h1>
        <p style={styles.subtitle}>Modern Hostel Management</p>
      </div>
      
      <div style={styles.footer}>
        <div style={styles.loader}></div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0f172a',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    fontFamily: "'Outfit', sans-serif",
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'fadeInScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  },
  logoWrapper: {
    width: '100px',
    height: '100px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
  },
  logo: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-1px',
    margin: 0,
  },
  subtitle: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: '0.5rem',
    fontWeight: '400',
  },
  footer: {
    position: 'absolute',
    bottom: '4rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards',
    opacity: 0,
  },
  loader: {
    width: '24px',
    height: '24px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }
};

export default MobileSplash;
