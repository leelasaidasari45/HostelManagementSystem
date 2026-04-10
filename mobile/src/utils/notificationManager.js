import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import apiClient from '../api/apiClient';

// Configure how notifications are handled when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366f1',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    // Get the token specifically for Expo Push Service
    try {
        token = (await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig.extra.eas.projectId,
        })).data;
        console.log('Push Token:', token);
    } catch (e) {
        console.log('Error getting push token', e);
    }

  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
};

export const syncTokenWithBackend = async (token) => {
  if (!token) return;
  try {
    await apiClient.post('/auth/save-fcm-token', {
      token: token,
      deviceType: Platform.OS
    });
    console.log('Notification token synced with backend');
  } catch (err) {
    console.error('Error syncing token with backend:', err);
  }
};
