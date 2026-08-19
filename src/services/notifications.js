import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { isNative } from '../hooks/useCapacitor';
import { getToken } from './storage';
import { config } from '../config';

export const requestPermission = async () => {
  if (!isNative) return false;
  
  try {
    const result = await PushNotifications.requestPermissions();
    return result.receive === 'granted';
  } catch (error) {
    console.error('Push permission error', error);
    return false;
  }
};

export const initNotifications = async () => {
  if (!isNative) return;
  
  const granted = await requestPermission();
  if (!granted) return;

  PushNotifications.addListener('registration', async (token) => {
    try {
      const userToken = await getToken();
      if (!userToken) return;
      
      await fetch(`${config.apiUrl}/api/auth/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({ fcmToken: token.value }),
      });
    } catch (e) {
      console.error('Error saving FCM token', e);
    }
  });

  PushNotifications.addListener('registrationError', (error) => {
    console.error('Push registration error', error);
  });

  try {
    await PushNotifications.register();
  } catch (e) {
    console.error('Error registering push', e);
  }
};

export const addListeners = (onForeground, onTap) => {
  if (!isNative) return;
  
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    if (onForeground) onForeground(notification);
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    if (onTap) onTap(notification);
  });
};

export const removeListeners = () => {
  if (!isNative) return;
  
  PushNotifications.removeAllListeners();
};

export const scheduleLocalNotification = async ({ title, body, id, scheduleAt }) => {
  if (!isNative) return;
  
  try {
    const permissions = await LocalNotifications.requestPermissions();
    if (permissions.display !== 'granted') return;
    
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: id || new Date().getTime(),
          schedule: scheduleAt ? { at: scheduleAt } : undefined,
        },
      ],
    });
  } catch (e) {
    console.error('Local notification error', e);
  }
};
