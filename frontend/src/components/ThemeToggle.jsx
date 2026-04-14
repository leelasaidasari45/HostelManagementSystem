import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`btn theme-toggle-btn ${isDarkMode ? 'dark' : 'light'}`}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '1.5rem',
        zIndex: 10000,
        width: '48px',
        height: '48px',
        borderRadius: '16px',
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: '2px solid var(--accent-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
    >
      <div className="icon-wrapper" style={{ 
        transform: isDarkMode ? 'rotate(360deg)' : 'rotate(0deg)',
        transition: 'transform 0.5s ease'
      }}>
        {isDarkMode ? (
          <Sun size={20} className="text-yellow-400" fill="currentColor" />
        ) : (
          <Moon size={20} className="text-indigo-600" fill="currentColor" />
        )}
      </div>
      
      <style>{`
        .theme-toggle-btn:hover {
          background: var(--accent-light) !important;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .theme-toggle-btn:active {
          transform: scale(0.95);
        }
      `}</style>
    </button>
  );
};

export default ThemeToggle;
