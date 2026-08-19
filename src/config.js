import { Capacitor } from '@capacitor/core';

// Smart API base URL:
// - In Capacitor native app: use the full Render backend URL
// - In web browser (prod): use relative URL '' (Vercel rewrites handle it)
// - In local dev: use localhost:5000

const getApiBase = () => {
  if (Capacitor.isNativePlatform()) {
    return 'https://veggies-kitchen-backend.onrender.com'; // Replace with actual backend
  }
  
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:5000';
  }
  
  return '';
};

export const API_BASE = getApiBase();

export const config = {
  apiUrl: API_BASE,
  appName: 'Veggies Kitchen',
  version: '1.0.0'
};
