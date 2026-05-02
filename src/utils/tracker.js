import axios from 'axios';

export const captureVisitorData = async () => {
  try {
    // Get IP and Location data
    const response = await axios.get('https://ipapi.co/json/');
    const ipData = response.data;

    // Get browser/device data
    const deviceData = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
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
