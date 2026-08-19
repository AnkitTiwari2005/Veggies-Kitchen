import { Capacitor } from '@capacitor/core';

// Smart API base URL:
// - Capacitor native app  → full Vercel backend URL
// - Web browser (prod)    → '' (relative, Vercel rewrites proxy /api/* to backend)
// - Local dev             → localhost:5000

const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://veggies-kitchen.vercel.app';

const getApiBase = () => {
  if (Capacitor.isNativePlatform()) {
    return BACKEND_URL;
  }
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:5000';
  }
  // Production web: use relative URLs — Vercel rewrites forward /api/* to backend
  return '';
};

export const API_BASE = getApiBase();

export const config = {
  apiUrl:   API_BASE,
  backendUrl: BACKEND_URL,
  appName:  'Veggies Kitchen',
  version:  '1.0.0',
};
