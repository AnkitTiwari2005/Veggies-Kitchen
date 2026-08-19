import { App } from '@capacitor/app';
import { isNative } from '../hooks/useCapacitor';

export const initDeepLinks = (navigate) => {
  if (!isNative) return;

  App.addListener('appUrlOpen', (event) => {
    const { url } = event;
    // url like veggieskitchen://order/123 or https://veggieskitchen.in/order/123
    try {
      const urlObj = new URL(url);
      let path = urlObj.pathname;
      
      if (url.startsWith('veggieskitchen://')) {
        path = url.replace('veggieskitchen:/', '');
      }
      
      if (path && path !== '/') {
        navigate(path);
      } else if (urlObj.hostname && url.startsWith('veggieskitchen://')) {
        // e.g., veggieskitchen://home
        navigate('/' + urlObj.hostname);
      }
    } catch (e) {
      console.error('Deep link parsing error', e);
    }
  });
};

export const removeDeepLinkListeners = () => {
  if (!isNative) return;
  App.removeAllListeners();
};
