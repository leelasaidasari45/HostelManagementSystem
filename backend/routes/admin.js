import express from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../supabaseClient.js';
import { sendLeadNotificationEmail } from '../utils/mailer.js';

const router = express.Router();
const ADMIN_PASSWORD = "Chinnu@4525";
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret1234';

// Middleware to verify admin JWT token
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// 1. Admin Login
router.post('/login', (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    // Generate admin token valid for 7 days
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success: true, token });
  }

  return res.status(401).json({ error: 'Incorrect admin password' });
});

// 2. Log Page Visit (App Analytics)
router.post('/visit', async (req, res) => {
  try {
    const { page } = req.body;
    if (!page) return res.status(400).json({ error: 'page is required' });

    const userAgent = req.headers['user-agent'] || 'N/A';
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'N/A';

    const { data, error } = await supabase.from('page_visits').insert([{
      page,
      ip_address: ipAddress,
      user_agent: userAgent
    }]);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Visit log error:', err.message);
    // Silent fail so we don't disrupt user app usage
    res.json({ success: false, error: err.message });
  }
});

// 3. Capture Lead Form Submission
router.post('/lead', async (req, res) => {
  try {
    const { name, phone, hostelCapacity } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and Phone number are required' });
    }

    const { data, error } = await supabase.from('leads').insert([{
      name,
      phone,
      hostel_capacity: hostelCapacity ? parseInt(hostelCapacity) : null
    }]);

    if (error) throw error;

    // Send automated email notification to site owner
    await sendLeadNotificationEmail(name, phone, hostelCapacity);

    res.json({ success: true, message: 'Lead captured successfully' });
  } catch (err) {
    console.error('Lead capture error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 4. Fetch Admin Dashboard Metrics (Protected)
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    // A. Fetch Leads
    const { data: leads, error: leadsErr } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (leadsErr) console.error('Leads fetch error:', leadsErr.message);

    // B. Fetch Users list
    const { data: users, error: usersErr } = await supabase
      .from('users')
      .select('id, name, email, role, phone, created_at')
      .order('created_at', { ascending: false });

    if (usersErr) throw usersErr;

    // C. Fetch Page Visits count
    const { count: visitsCount, error: visitsErr } = await supabase
      .from('page_visits')
      .select('*', { count: 'exact', head: true });

    if (visitsErr) console.error('Visits count error:', visitsErr.message);

    // D. Fetch subscription transactions (Revenue)
    const { data: platformSubs, error: subsErr } = await supabase
      .from('platform_subscriptions')
      .select('amount, status, created_at, plan_name, owner_id')
      .order('created_at', { ascending: false });

    if (subsErr) throw subsErr;

    // E. Fetch Tenant rent payments (Transactional Volume)
    const { data: tenantPayments, error: payErr } = await supabase
      .from('payments')
      .select('amount, status, created_at')
      .order('created_at', { ascending: false });

    if (payErr) throw payErr;

    // Aggregates
    const activePlatformSubs = platformSubs.filter(s => s.status === 'active' || s.status === 'trial');
    const totalPlatformRevenue = activePlatformSubs.reduce((sum, s) => sum + Number(s.amount), 0);

    const completedTenantRentPayments = tenantPayments.filter(p => p.status === 'completed');
    const totalTenantRentVolume = completedTenantRentPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Group page views by browser user agent types
    const { data: rawVisits, error: rawVisitsErr } = await supabase
       .from('page_visits')
       .select('page, created_at')
       .order('created_at', { ascending: false })
       .limit(100);

    if (rawVisitsErr) console.error('Raw visits error:', rawVisitsErr.message);

    res.json({
      leads: leads || [],
      users: users || [],
      totalVisits: visitsCount || 0,
      recentVisits: rawVisits || [],
      revenue: {
        totalPlatformRevenue,
        activeSubscriptionsCount: activePlatformSubs.length,
        totalTenantRentVolume,
        completedRentPaymentsCount: completedTenantRentPayments.length,
        platformSubsHistory: platformSubs || []
      }
    });

  } catch (err) {
    console.error('Admin dashboard error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
