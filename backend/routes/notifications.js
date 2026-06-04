import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../supabaseClient.js';

const router = express.Router();
router.use(requireAuth);

// ── Register / Update FCM Token ───────────────────────────────────────────────
// Called by the app on startup / login to register this device
router.post('/register-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    await supabase
      .from('users')
      .update({ fcm_token: token })
      .eq('id', req.user.id);

    res.json({ message: 'FCM token registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Remove FCM Token on Logout ────────────────────────────────────────────────
router.delete('/remove-token', async (req, res) => {
  try {
    await supabase
      .from('users')
      .update({ fcm_token: null })
      .eq('id', req.user.id);

    res.json({ message: 'FCM token removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get All Notifications for Current User ────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      // If the table doesn't exist yet, return empty array
      if (error.code === '42P01') return res.json([]);
      throw error;
    }
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Mark a Single Notification as Read ───────────────────────────────────────
router.put('/:id/read', async (req, res) => {
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Mark ALL Notifications as Read ───────────────────────────────────────────
router.put('/read-all', async (req, res) => {
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Unread Count ──────────────────────────────────────────────────────────────
router.get('/unread-count', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    if (error && error.code === '42P01') return res.json({ count: 0 });
    res.json({ count: count || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
