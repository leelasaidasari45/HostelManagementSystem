import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../supabaseClient.js';
import { requireAuth } from '../middleware/auth.js';
import { sendResetEmail } from '../utils/mailer.js';

const router = express.Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true, // Must be true when sameSite is 'none'
  sameSite: 'none', // Required for cross-domain cookie sending (Vercel -> Render)
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, phone } = req.body;

    const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already registered with this email address.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const trialEndDate = new Date();
    trialEndDate.setMonth(trialEndDate.getMonth() + 3);

    const { data: user, error } = await supabase.from('users').insert([{
      email,
      password: hashedPassword,
      name,
      role,
      phone: phone || '',
      trial_end_date: trialEndDate.toISOString(),
      subscription_status: 'trial',
      payment_setup_complete: role === 'tenant' ? true : false // Tenants are free, owners need setup
    }]).select().single();

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    if (error) throw error;

    // Set auth cookies for fallback
    res.cookie('access_token', token, COOKIE_OPTIONS);

    res.status(201).json({ 
      message: 'Registration successful', 
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token: token // Passing token for localStorage persistence
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // Set auth cookies
    res.cookie('access_token', token, COOKIE_OPTIONS);

    res.json({ 
      message: 'Login successful', 
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token: token
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
  res.json({ message: 'Logged out successfully' });
});

// Get Current User Profile
router.get('/me', requireAuth, async (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role,
    phone: req.user.phone,
    hostel_id: req.user.hostel_id,
    join_date: req.user.join_date,
    aadhaar_url: req.user.aadhaar_url
  });
});

// Forgot Password - Generates a reset token and returns a link (MOCK email)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const { data: user } = await supabase.from('users').select('id, email, name').eq('email', email).maybeSingle();
    
    if (!user) {
      // Security: Don't reveal if user exists or not, but for this SaaS we'll be helpful
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    // Create a reset token valid for 1 hour
    const resetToken = jwt.sign({ id: user.id, reset: true }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    // SEND REAL EMAIL
    await sendResetEmail(user.email, user.name, resetUrl);

    res.json({ 
      message: 'Password reset link has been sent to your email address.',
      // For development/debugging we can still provide the link if requested, but for security in prod we remove it
      resetUrl: process.env.NODE_ENV === 'production' ? undefined : resetUrl
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during forgot-password' });
  }
});

// Reset Password - Verifies token and updates password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Missing token or new password' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.reset) {
      return res.status(401).json({ error: 'Invalid reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { error } = await supabase.from('users').update({ password: hashedPassword }).eq('id', decoded.id);

    if (error) throw error;

    res.json({ message: 'Password updated successfully. You can now login with your new password.' });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(401).json({ error: 'Invalid or expired reset token' });
  }
});

export default router;
