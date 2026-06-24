import jwt from 'jsonwebtoken';
import { supabase } from '../supabaseClient.js';

// ─── In-memory user cache ────────────────────────────────────────────────────
// Avoids a DB round-trip on EVERY authenticated request.
// Each entry: { user, expiresAt }  — TTL: 60 seconds
const userCache = new Map();
const USER_CACHE_TTL_MS = 60_000; // 60 s

function getCachedUser(id) {
  const entry = userCache.get(id);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    userCache.delete(id);
    return null;
  }
  return entry.user;
}

function setCachedUser(id, user) {
  userCache.set(id, { user, expiresAt: Date.now() + USER_CACHE_TTL_MS });
}

// Evict stale entries every 5 minutes to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of userCache.entries()) {
    if (now > entry.expiresAt) userCache.delete(id);
  }
}, 5 * 60_000);

// ─── Middleware ───────────────────────────────────────────────────────────────
export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.access_token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 1. Try cache first — skip DB entirely
    let user = getCachedUser(decoded.id);

    if (!user) {
      // 2. Cache miss → fetch from DB (only id, role, hostel_id, name, phone, email needed)
      const { data, error } = await supabase
        .from('users')
        .select('id, role, hostel_id, name, phone, email, subscription_status, trial_end_date, vendor_id')
        .eq('id', decoded.id)
        .maybeSingle();

      if (error || !data) {
        return res.status(401).json({ error: 'User not found or session invalid' });
      }

      user = data;
      setCachedUser(decoded.id, user);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Server authentication error' });
  }
};

// Call this after any write that changes user data (role, hostel_id, etc.)
export function invalidateUserCache(userId) {
  userCache.delete(userId);
}

export const requireOwner = (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: `Owner access restricted (Found role: ${req.user.role || 'none'})` });
  }
  next();
};

export const requireTenant = (req, res, next) => {
  if (req.user.role !== 'tenant') {
    return res.status(403).json({ error: `Tenant access restricted (Found role: ${req.user.role || 'none'})` });
  }
  next();
};
