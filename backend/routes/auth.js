import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../supabaseClient.js';
import { requireAuth } from '../middleware/auth.js';
import { sendResetOtpEmail } from '../utils/mailer.js';

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
    const { email, password, name, phone } = req.body;
    let { role } = req.body;

    if (!role) role = 'unassigned';

    const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already registered with this email address.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let subscriptionStatus = 'none';
    let paymentSetupComplete = false;
    let trialEndDate = null;

    if (role === 'owner') {
      subscriptionStatus = 'trial';
      trialEndDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
      paymentSetupComplete = false;
    } else if (role === 'tenant') {
      subscriptionStatus = 'none';
      paymentSetupComplete = true;
    }

    const { data: user, error } = await supabase.from('users').insert([{
      email,
      password: hashedPassword,
      name,
      role,
      phone: phone || '',
      trial_end_date: trialEndDate,
      subscription_status: subscriptionStatus,
      payment_setup_complete: paymentSetupComplete
    }]).select().single();

    if (error) throw error;

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.cookie('access_token', token, COOKIE_OPTIONS);

    res.status(201).json({ 
      message: 'Registration successful', 
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      payment_setup_complete: user.payment_setup_complete,
      subscription_status: user.subscription_status,
      trial_end_date: user.trial_end_date,
      created_at: user.created_at,
      token: token
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      error: 'Server error during registration',
      details: err.message || err.error_description || err
    });
  }
});

// Social Sync Route (for Google Auth)
router.post('/social-sync', async (req, res) => {
  try {
    const { supabaseId, email, name, role = 'unassigned' } = req.body;

    // Check if user exists by email or supabaseId
    let { data: user } = await supabase.from('users').select('*').eq('email', email).maybeSingle();

    if (!user) {
      // Create new user for social login
      let subscriptionStatus = 'none';
      let paymentSetupComplete = false;
      let trialEndDate = null;

      if (role === 'owner') {
        subscriptionStatus = 'trial';
        trialEndDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
        paymentSetupComplete = false;
      } else if (role === 'tenant') {
        subscriptionStatus = 'none';
        paymentSetupComplete = true;
      }

      const { data: newUser, error } = await supabase.from('users').insert([{
        id: supabaseId,
        email,
        name,
        role: 'unassigned',
        trial_end_date: trialEndDate,
        subscription_status: subscriptionStatus,
        payment_setup_complete: paymentSetupComplete
      }]).select().single();

      if (error) throw error;
      user = newUser;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.cookie('access_token', token, COOKIE_OPTIONS);

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      payment_setup_complete: user.payment_setup_complete,
      subscription_status: user.subscription_status,
      trial_end_date: user.trial_end_date,
      created_at: user.created_at,
      token: token
    });
  } catch (err) {
    console.error('Social sync error:', err);
    res.status(500).json({ error: 'Failed to sync social account' });
  }
});

// Update Role Route
router.put('/update-role', requireAuth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['owner', 'tenant'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role selection' });
    }

    const userId = req.user.id;
    // For owner: automatically give 2 days free trial. For tenant: bypass billing.
    const paymentSetupComplete = role === 'tenant' ? true : false;
    const subscriptionStatus = role === 'tenant' ? 'none' : 'trial';
    const trialEndDate = role === 'owner' 
      ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { data: user, error } = await supabase.from('users').update({ 
      role,
      payment_setup_complete: paymentSetupComplete,
      subscription_status: subscriptionStatus,
      trial_end_date: trialEndDate
    }).eq('id', userId).select().single();

    if (error) throw error;

    // Issue updated token with new role
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.cookie('access_token', token, COOKIE_OPTIONS);

    res.json({
      message: 'Role updated successfully',
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      payment_setup_complete: user.payment_setup_complete,
      subscription_status: user.subscription_status,
      trial_end_date: user.trial_end_date,
      created_at: user.created_at,
      token: token
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const loginId = (identifier || email || '').trim();
    
    // First check if user exists by email
    let { data: user, error } = await supabase.from('users')
      .select('*')
      .eq('email', loginId)
      .maybeSingle();

    // If not found by email, check by phone
    if (!user) {
      const { data: userByPhone } = await supabase.from('users')
        .select('*')
        .eq('phone', loginId)
        .maybeSingle();
      
      if (userByPhone) {
        user = userByPhone;
        error = null;
      }
    }
    
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
      payment_setup_complete: user.payment_setup_complete,
      subscription_status: user.subscription_status,
      trial_end_date: user.trial_end_date,
      created_at: user.created_at,
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
  // Always fetch fresh from DB so payment_setup_complete is up-to-date
  try {
    const { data: user } = await supabase.from('users')
      .select('id, email, name, role, phone, hostel_id, join_date, aadhaar_url, payment_setup_complete, subscription_status, trial_end_date, created_at')
      .eq('id', req.user.id)
      .single();
    
    res.json(user || req.user);
  } catch {
    res.json(req.user);
  }
});

// Forgot Password - Generates a 6-digit OTP and returns a signed token
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const { data: user } = await supabase.from('users').select('id, email, name').eq('email', email).maybeSingle();
    
    if (!user) {
      // Security: Don't reveal if user exists or not, but for this SaaS we'll be helpful
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    // Create a reset token valid for 15 minutes containing the OTP hash
    const resetToken = jwt.sign({ id: user.id, reset: true, otpHash }, process.env.JWT_SECRET, {
      expiresIn: '15m'
    });

    // SEND REAL EMAIL (wrap in try catch so it doesn't crash the server if SMTP fails)
    try {
      await sendResetOtpEmail(user.email, user.name, otp);
    } catch (mailErr) {
      console.warn("Failed to send OTP email. SMTP might not be configured.", mailErr);
    }

    res.json({ 
      message: 'If an account exists for this email, an OTP has been sent.',
      resetToken,
      // For development/debugging we can still provide the OTP if requested, but for security in prod we remove it
      devOtp: process.env.NODE_ENV === 'production' ? undefined : otp
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during forgot-password' });
  }
});

// Verify OTP - Checks if OTP matches without resetting password
router.post('/verify-otp', async (req, res) => {
  try {
    const { token, otp } = req.body;
    
    if (!token || !otp) {
      return res.status(400).json({ error: 'Missing token or OTP' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.reset || !decoded.otpHash) {
      return res.status(401).json({ error: 'Invalid reset token' });
    }

    // Verify OTP
    const isValidOtp = await bcrypt.compare(otp.toString(), decoded.otpHash);
    if (!isValidOtp) {
      return res.status(401).json({ error: 'Incorrect OTP' });
    }

    res.json({ message: 'OTP Verified successfully.' });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(401).json({ error: 'Invalid or expired OTP token' });
  }
});

// Reset Password - Verifies OTP and updates password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, otp, newPassword } = req.body;
    
    if (!token || !otp || !newPassword) {
      return res.status(400).json({ error: 'Missing token, OTP, or new password' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.reset || !decoded.otpHash) {
      return res.status(401).json({ error: 'Invalid reset token' });
    }

    // Verify OTP
    const isValidOtp = await bcrypt.compare(otp.toString(), decoded.otpHash);
    if (!isValidOtp) {
      return res.status(401).json({ error: 'Incorrect OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { error } = await supabase.from('users').update({ password: hashedPassword }).eq('id', decoded.id);

    if (error) throw error;

    res.json({ message: 'Password updated successfully. You can now login with your new password.' });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(401).json({ error: 'Invalid or expired OTP token' });
  }
});

// Delete Account
router.delete('/delete-account', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Delete user from database (cascade handles related data if set up, or it just deletes the user)
    const { error } = await supabase.from('users').delete().eq('id', userId);
    
    if (error) throw error;

    // Clear the cookie
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
