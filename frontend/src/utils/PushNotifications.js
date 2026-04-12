import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import toast from 'react-hot-toast';
import api from '../api';

export const setupPushNotifications = async () => {
  // 1. Check if we are running on a Native Device (Android/iOS)
  if (Capacitor.getPlatform() === 'web') {
    console.log('Push notifications are not supported on web. Skipping setup.');
    return;
  }

  // 2. Request Permissions
  let permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    console.warn('User denied push notification permissions');
    return;
  }

  // 3. Register with Apple / Google (FCM)
  await PushNotifications.register();

  // 4. Listeners
  PushNotifications.addListener('registration', async (token) => {
    console.log('Push registration success, token: ' + token.value);
    
    // 🏆 Sync token to backend database
    try {
      await api.post('/api/auth/save-fcm-token', { 
        token: token.value,
        deviceType: Capacitor.getPlatform()
      });
      console.log('Token successfully synced to backend');
    } catch (err) {
      console.error('Failed to sync push token to server', err);
    }
  });

  PushNotifications.addListener('registrationError', (error) => {
    console.error('Error on registration: ' + JSON.stringify(error));
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received: ' + JSON.stringify(notification));
    toast.success(`${notification.title}: ${notification.body}`, {
      duration: 5000,
      position: 'top-center'
    });
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push action performed: ' + JSON.stringify(notification));
    // Handle redirection logic here
  });
};
