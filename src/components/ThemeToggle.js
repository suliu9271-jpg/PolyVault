/**
 * Theme toggle component (dark/light mode)
 */
import React, { useState, useEffect } from 'react';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <button className="theme-toggle" onClick={toggleTheme} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;

