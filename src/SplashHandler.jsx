import { useEffect } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
import { isNative } from './hooks/useCapacitor';

export default function SplashHandler() {
  useEffect(() => {
    if (!isNative) return;

    const hideSplash = async () => {
      setTimeout(async () => {
        try {
          await SplashScreen.hide();
        } catch (e) {
          console.error('Splash screen hide error', e);
        }
      }, 500);
    };

    hideSplash();
  }, []);

  return null;
}
