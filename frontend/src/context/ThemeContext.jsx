import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // Default to light mode if no preference saved
    return savedTheme === 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (!isDarkMode) {
      root.classList.add('light-mode');
      root.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.add('dark-mode');
      root.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
