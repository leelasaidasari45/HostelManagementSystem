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
        padding: '0.6rem',
        borderRadius: '12px',
        background: 'var(--bg-tertiary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
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
