import React, { useState, useEffect } from 'react';
import { Shield, MapPin, Smartphone, Globe, Trash2, RefreshCcw, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(isSupabaseConfigured());
  const [currentBaitLink, setCurrentBaitLink] = useState('');

  const generateRandomLink = () => {
    const randomStr = Math.random().toString(36).substring(2, 15);
    const prefixes = ['v', 't', 'secure', 'verify', 'reward'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return `${window.location.origin}/${prefix}/${randomStr}`;
  };

  useEffect(() => {
    setCurrentBaitLink(generateRandomLink());
  }, []);

  // Load dari Supabase kalau sudah dikonfigurasi, fallback ke localStorage
  const loadLogs = async () => {
    setIsRefreshing(true);

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('scam_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(200);

      if (!error && data) {
        setLogs(data);
        setIsOnline(true);
      } else {
        console.error('Supabase error:', error);
        setIsOnline(false);
        // Fallback ke localStorage
        const local = JSON.parse(localStorage.getItem('scam_logs') || '[]');
        setLogs(local);
      }
    } else {
      setIsOnline(false);
      const local = JSON.parse(localStorage.getItem('scam_logs') || '[]');
      setLogs(local);
    }

    setTimeout(() => setIsRefreshing(false), 600);
  };

  useEffect(() => {
    loadLogs();

    // Real-time subscription — data baru langsung muncul tanpa refresh
    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('scam_logs_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'scam_logs' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setLogs((prev) => [payload.new, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setLogs((prev) =>
                prev.map((log) => (log.id === payload.new.id ? payload.new : log))
              );
            } else if (payload.eventType === 'DELETE') {
              setLogs((prev) => prev.filter((log) => log.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      return () => supabase.removeChannel(channel);
    }
  }, []);

  const clearLogs = async () => {
    if (!window.confirm('Hapus semua data pancingan?')) return;

    if (isSupabaseConfigured()) {
      await supabase.from('scam_logs').delete().neq('id', 'placeholder');
    }
    localStorage.removeItem('scam_logs');
    setLogs([]);
  };

  const getMapsUrl = (log) => {
    if (log.precise_lat && log.precise_lng) {
      return `https://www.google.com/maps?q=${log.precise_lat},${log.precise_lng}`;
    }
    return `https://www.google.com/maps?q=${log.latitude},${log.longitude}`;
  };

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={36} color="#3b82f6" />
            SCAM <span style={{ color: '#3b82f6' }}>SENTINEL</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isOnline
              ? <><Wifi size={14} color="#10b981" /> <span style={{ color: '#10b981' }}>Live — Supabase Connected</span></>
              : <><WifiOff size={14} color="#ef4444" /> <span style={{ color: '#ef4444' }}>Offline Mode (localStorage only)</span></>
            }
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={loadLogs} disabled={isRefreshing}>
            <RefreshCcw size={18} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <button className="btn-secondary" onClick={clearLogs} style={{ color: '#ef4444' }}>
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>TOTAL TERTANGKAP</h3>
          <div style={{ fontSize: '36px', fontWeight: '800' }}>{logs.length}</div>
        </div>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>GPS AKURAT</h3>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#10b981' }}>
            {logs.filter((l) => l.precise_lat).length}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>LOKASI TERAKHIR</h3>
          <div style={{ fontSize: '20px', fontWeight: '700' }}>
            {logs[0]?.city || 'N/A'}, {logs[0]?.country_code || '--'}
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px' }}>Penipu Tertangkap</h2>
          <span className="status-badge status-online">
            {isOnline ? '🟢 Real-time' : '🔴 Offline'}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)' }}>WAKTU</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)' }}>IP ADDRESS</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)' }}>LOKASI</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)' }}>ISP</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)' }}>DEVICE</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)' }}>MAPS</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {isOnline
                        ? 'Belum ada penipu yang terpancing. Bagikan link jebakanmu!'
                        : '⚠️ Supabase belum dikonfigurasi. Isi URL & KEY di src/utils/supabase.js'}
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ borderBottom: '1px solid var(--border-color)' }}
                    >
                      <td style={{ padding: '16px 24px', fontSize: '13px' }}>
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '16px 24px', fontWeight: '600', color: '#3b82f6' }}>{log.ip}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={14} color="#ef4444" />
                          {log.city}, {log.region}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px' }}>{log.org}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                          <span style={{ color: '#3b82f6' }}>CPU: {log.cores} Cores</span>
                          <span style={{ color: '#10b981' }}>
                            GPU: {typeof log.gpu === 'string' ? log.gpu.split(' ').slice(-2).join(' ') : 'N/A'}
                          </span>
                          <span style={{ color: log.charging === 'Charging' ? '#10b981' : '#f59e0b' }}>
                            🔋 {log.battery} ({log.charging === 'Charging' ? '🔌' : '🔋'})
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <a
                          href={getMapsUrl(log)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            border: log.precise_lat ? '1px solid #10b981' : '1px solid #ef4444',
                            color: log.precise_lat ? '#10b981' : '#ef4444',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px',
                            textDecoration: 'none',
                            borderRadius: '6px',
                          }}
                        >
                          <MapPin size={14} />
                          {log.precise_lat ? 'GPS AKURAT' : 'IP LOCATION'}
                          {log.precise_lat && (
                            <span style={{ fontSize: '9px' }}>Acc: {log.gps_accuracy}</span>
                          )}
                        </a>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Link Generator */}
      <div style={{ marginTop: '40px', padding: '32px' }} className="glass-card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Globe size={20} color="#3b82f6" /> Link Jebakan (Randomized)
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
          Bagikan link ini ke penipu. Setiap klik akan langsung tercatat di dashboard ini secara real-time.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            readOnly
            value={currentBaitLink}
            style={{
              flex: 1,
              minWidth: '200px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px',
              color: 'white',
              fontFamily: 'monospace',
            }}
          />
          <button className="btn-secondary" onClick={() => setCurrentBaitLink(generateRandomLink())}>
            Generate Baru
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              navigator.clipboard.writeText(currentBaitLink);
              alert('Link jebakan berhasil dicopy!');
            }}
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
