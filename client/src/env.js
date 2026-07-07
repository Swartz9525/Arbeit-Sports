const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const BACKEND_URL = isLocal ? 'http://localhost:5000' : 'https://arbeit-sports-tutt.vercel.app';
export const API_URL = `${BACKEND_URL}/api`;