
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { System } from './components/System';
import { LandingPage } from './components/LandingPage';
import { LanguageProvider } from './contexts/LanguageContext';
import { UserProvider } from './contexts/UserContext';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem('odaa_theme_v3');
    return (stored as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('odaa_theme_v3', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <LanguageProvider>
      <UserProvider>
        <HashRouter>
        <Routes>
            <Route path="/" element={<LandingPage theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/app/*" element={<System theme={theme} toggleTheme={toggleTheme} />} />
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </HashRouter>
      </UserProvider>
    </LanguageProvider>
  );
};

export default App;
