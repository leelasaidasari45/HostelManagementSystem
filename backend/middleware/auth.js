import jwt from 'jsonwebtoken';
import { supabase } from '../supabaseClient.js';

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.access_token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: user, error } = await supabase.from('users').select('*').eq('id', decoded.id).maybeSingle();

    if (error || !user) {
      return res.status(401).json({ error: 'User not found or session invalid' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Server authentication error' });
  }
};

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
