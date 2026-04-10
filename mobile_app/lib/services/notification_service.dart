import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../services/api_service.dart';

class NotificationService {
  static final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();

  static Future<void> initialize() async {
    // 1. Request Permissions
    NotificationSettings settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.granted) {
      print('User granted notification permissions');
      
      // 2. Get Token & Sync to Backend
      String? token = await _fcm.getToken();
      if (token != null) {
        await _syncTokenToBackend(token);
      }

      // 3. Handle Token Refresh
      _fcm.onTokenRefresh.listen(_syncTokenToBackend);

      // 4. Handle Foreground Messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        _showLocalNotification(message);
      });
    }
  }

  static Future<void> _syncTokenToBackend(String token) async {
    try {
      await ApiService.post('/api/auth/save-fcm-token', {
        'token': token,
        'deviceType': 'android', // Or use a platform check
      });
      print('FCM Token synced successfully');
    } catch (e) {
      print('Failed to sync FCM token: $e');
    }
  }

  static void _showLocalNotification(RemoteMessage message) {
    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'high_importance_channel',
      'High Importance Notifications',
      importance: Importance.max,
      priority: Priority.high,
    );

    _localNotifications.show(
      message.hashCode,
      message.notification?.title,
      message.notification?.body,
      const NotificationDetails(android: androidDetails),
    );
  }
}
