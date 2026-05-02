import axios from 'axios';

export const captureVisitorData = async () => {
  try {
    // Get IP and Location data
    const response = await axios.get('https://ipapi.co/json/');
    const ipData = response.data;

    // Deep Fingerprinting (Educational/Diagnostic)
    let batteryInfo = {};
    if ('getBattery' in navigator) {
      const battery = await navigator.getBattery();
      batteryInfo = {
        level: `${(battery.level * 100).toFixed(0)}%`,
        charging: battery.charging ? 'Charging' : 'Not Charging'
      };
    }

    const getCanvasFingerprint = () => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      if (!gl) return 'N/A';
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_ID) : 'Generic GPU';
    };

    // High-Accuracy Geolocation (Requires User Permission)
    const getPreciseLocation = () => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve(null);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: `${position.coords.accuracy.toFixed(1)} meters`,
            });
          },
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 5000 }
        );
      });
    };

    const preciseLoc = await getPreciseLocation();

    const deviceData = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      cores: navigator.hardwareConcurrency || 'Unknown',
      gpu: getCanvasFingerprint(),
      battery: batteryInfo.level || 'Unknown',
      charging: batteryInfo.charging || 'Unknown',
      preciseLoc: preciseLoc,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString(),
      referrer: document.referrer || 'Direct',
    };

    // Combine data
    const fullLog = {
      id: Math.random().toString(36).substr(2, 9),
      ...ipData,
      ...deviceData,
      status: 'Captured'
    };

    // Save to local storage for the dashboard to see
    const existingLogs = JSON.parse(localStorage.getItem('scam_logs') || '[]');
    localStorage.setItem('scam_logs', JSON.stringify([fullLog, ...existingLogs]));

    return fullLog;
  } catch (error) {
    console.error('Failed to capture data:', error);
    return null;
  }
};
