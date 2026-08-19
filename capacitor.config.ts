import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.veggieskitchen.app',
  appName: 'Veggies Kitchen',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: false,
      launchFadeOutDuration: 500,
      backgroundColor: '#0d1117',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#0d1117',
      overlaysWebView: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_veggie',
      iconColor: '#4CAF50',
      sound: 'notification.wav',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    Camera: {
      // permissions handled at runtime
    },
    Geolocation: {
      // permissions handled at runtime
    },
  },
  android: {
    minWebViewVersion: 60,
    buildOptions: {
      signingType: 'apksigner',
    },
    // Allow HTTP for local dev only – production uses HTTPS via Vercel/Render
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false, // set true only during development
  },
};

export default config;
