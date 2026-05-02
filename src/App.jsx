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
        
        {/* The "Bait" path that you give to scammers */}
        <Route path="/verify-reward" element={<TrapPage />} />
        <Route path="/confirm-identity" element={<TrapPage />} />
        
        {/* Default to dashboard for the user, but you should use the secret path */}
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
