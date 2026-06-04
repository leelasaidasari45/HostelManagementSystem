import { useEffect, useRef } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import api from '../api';

import { Capacitor } from '@capacitor/core';
const isNative = Capacitor.isNativePlatform();

export function usePushNotifications(user) {
  const registered = useRef(false);

  useEffect(() => {
    if (!isNative || !user?.id || registered.current) return;
    registered.current = true;

    const initPush = async () => {
      try {
        // 1. Request permission
        const permResult = await PushNotifications.requestPermissions();
        if (permResult.receive !== 'granted') {
          console.log('Push notification permission denied');
          return;
        }

        // 2. Register with FCM
        await PushNotifications.register();

        // 3. On registration success — send token to our backend
        PushNotifications.addListener('registration', async (token) => {
          console.log('📲 FCM Token received:', token.value);
          try {
            await api.post('/api/notifications/register-token', { token: token.value });
          } catch (err) {
            console.error('Failed to register FCM token:', err);
          }
        });

        // 4. Handle registration errors
        PushNotifications.addListener('registrationError', (err) => {
          console.error('FCM Registration Error:', err);
        });

        // 5. Handle foreground notifications (app is open)
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('📬 Push received (foreground):', notification);
          // Could trigger a toast/in-app alert here
        });

        // 6. Handle notification tap (app opened from notification)
        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('📲 Notification tapped:', action.notification);
        });

      } catch (err) {
        console.error('Push notification init error:', err);
      }
    };

    initPush();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [user?.id]);
}

// Call this on logout to deregister the device token
export async function deregisterPushToken() {
  if (!isNative) return;
  try {
    await api.delete('/api/notifications/remove-token');
    await PushNotifications.removeAllListeners();
  } catch (err) {
    console.error('Failed to deregister push token:', err);
  }
}
