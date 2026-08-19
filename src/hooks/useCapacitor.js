import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'web', 'ios', 'android'
export const isAndroid = platform === 'android';
export const isIOS = platform === 'ios';

export const useCapacitor = () => {
  return {
    isNative,
    isAndroid,
    isIOS,
    platform,
  };
};

export const addBodyClass = () => {
  if (isNative) {
    document.body.classList.add('is-native');
  }
  if (isAndroid) {
    document.body.classList.add('is-android');
  }
  if (isIOS) {
    document.body.classList.add('is-ios');
  }
};
