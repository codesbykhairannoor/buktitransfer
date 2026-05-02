import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';

// Ganti password ini sebelum deploy
const ADMIN_PASSWORD = 'Kh@iranaja09!sentinel';

const AdminLogin = ({ onSuccess }) => {
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      // Simpan sesi di sessionStorage — hilang saat browser ditutup
      sessionStorage.setItem('admin_auth', 'true');
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setPw('');
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
    }}>
      <div
        className="glass-card"
        style={{
          padding: '48px 40px',
          width: '100%',
          maxWidth: '380px',
          animation: shake ? 'shake 0.4s ease' : 'none',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Shield size={48} color="#3b82f6" style={{ marginBottom: '12px' }} />
          <h1 style={{ fontSize: '22px', fontWeight: '900' }}>
            SCAM <span style={{ color: '#3b82f6' }}>SENTINEL</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Akses terbatas — masukkan password
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type={show ? 'text' : 'password'}
              value={pw}
              onChange={(e) => { setPw(e.target.value); setError(false); }}
              placeholder="Password"
              autoFocus
              style={{
                width: '100%',
                padding: '14px 44px 14px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${error ? '#ef4444' : 'var(--border-color)'}`,
                borderRadius: '10px',
                color: 'white',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              style={{
                position: 'absolute', right: '14px', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 0,
              }}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p style={{ color: '#ef4444', fontSize: '13px', margin: 0, textAlign: 'center' }}>
              Password salah. Coba lagi.
            </p>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '14px', fontSize: '15px', fontWeight: '700' }}
          >
            <Lock size={16} /> Masuk
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
