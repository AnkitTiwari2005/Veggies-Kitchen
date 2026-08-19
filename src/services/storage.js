import { Preferences } from '@capacitor/preferences';
import { isNative } from '../hooks/useCapacitor';

const storage = {
  async set(key, value) {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    if (isNative) {
      await Preferences.set({ key, value: stringValue });
    } else {
      localStorage.setItem(key, stringValue);
    }
  },
  async get(key) {
    let result = null;
    if (isNative) {
      const { value } = await Preferences.get({ key });
      result = value;
    } else {
      result = localStorage.getItem(key);
    }
    
    if (result === null) return null;
    
    try {
      return JSON.parse(result);
    } catch {
      return result;
    }
  },
  async remove(key) {
    if (isNative) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  },
  async clear() {
    if (isNative) {
      await Preferences.clear();
    } else {
      localStorage.clear();
    }
  }
};

export const saveToken = (token) => storage.set('access_token', token);
export const getToken = () => storage.get('access_token');
export const removeToken = () => storage.remove('access_token');

export const saveRefreshToken = (token) => storage.set('refresh_token', token);
export const getRefreshToken = () => storage.get('refresh_token');
export const removeRefreshToken = () => storage.remove('refresh_token');

export const saveUser = (userObj) => storage.set('user', userObj);
export const getUser = () => storage.get('user');
export const removeUser = () => storage.remove('user');

export const saveCart = (items) => storage.set('cart', items);
export const getCart = async () => (await storage.get('cart')) || [];

export const saveRecentSearches = (arr) => storage.set('recent_searches', arr);
export const getRecentSearches = async () => (await storage.get('recent_searches')) || [];

export const saveOnboardingSeen = () => storage.set('onboarding_seen', true);
export const hasSeenOnboarding = async () => (await storage.get('onboarding_seen')) === true;

export const clearAll = () => storage.clear();
