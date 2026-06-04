import admin from 'firebase-admin';
import { supabase } from '../supabaseClient.js';

// ── Initialize Firebase Admin SDK (once) ──────────────────────────────────────
let firebaseApp;

function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin SDK initialized');
  } catch (err) {
    console.error('❌ Firebase Admin SDK init failed:', err.message);
  }
  return firebaseApp;
}

// ── Send push notification to a single user ───────────────────────────────────
export async function sendPushToUser(userId, title, body, data = {}) {
  try {
    getFirebaseApp();

    // Lookup user's FCM token from DB
    const { data: user } = await supabase
      .from('users')
      .select('fcm_token, name')
      .eq('id', userId)
      .maybeSingle();

    if (!user?.fcm_token) return; // User hasn't registered device yet

    const message = {
      token: user.fcm_token,
      notification: { title, body },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'easypg_alerts',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
      },
      data: { ...data, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
    };

    await admin.messaging().send(message);
    console.log(`📲 Push sent to ${user.name}: "${title}"`);

    // Also store in DB for in-app notification history
    await supabase.from('notifications').insert([{
      user_id: userId,
      title,
      message: body,
      type: data.type || 'general',
      is_read: false,
    }]);

  } catch (err) {
    console.error(`❌ Push notification failed for user ${userId}:`, err.message);
  }
}

// ── Send push notification to ALL tenants of a hostel ────────────────────────
export async function sendPushToHostelTenants(hostelId, title, body, data = {}) {
  try {
    getFirebaseApp();

    // Get all tenants of this hostel who have FCM tokens
    const { data: tenants } = await supabase
      .from('users')
      .select('id, fcm_token, name')
      .eq('hostel_id', hostelId)
      .eq('role', 'tenant')
      .not('fcm_token', 'is', null);

    if (!tenants || tenants.length === 0) return;

    const tokens = tenants.map(t => t.fcm_token).filter(Boolean);

    if (tokens.length === 0) return;

    // Send multicast to all tokens
    const multicastMessage = {
      tokens,
      notification: { title, body },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'easypg_alerts',
        },
      },
      data: { ...data, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
    };

    const response = await admin.messaging().sendEachForMulticast(multicastMessage);
    console.log(`📲 Multicast: ${response.successCount}/${tokens.length} sent for hostel ${hostelId}`);

    // Store notification record for each tenant
    const notificationRecords = tenants.map(t => ({
      user_id: t.id,
      title,
      message: body,
      type: data.type || 'general',
      is_read: false,
    }));

    await supabase.from('notifications').insert(notificationRecords);

  } catch (err) {
    console.error(`❌ Multicast push failed for hostel ${hostelId}:`, err.message);
  }
}

// ── Get owner ID for a hostel ─────────────────────────────────────────────────
export async function getHostelOwnerId(hostelId) {
  const { data } = await supabase
    .from('hostels')
    .select('owner_id')
    .eq('id', hostelId)
    .maybeSingle();
  return data?.owner_id || null;
}
