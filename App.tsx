
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { System } from './components/System';
import { LandingPage } from './components/LandingPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app/*" element={<System />} />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
