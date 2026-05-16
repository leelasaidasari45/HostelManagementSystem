import express from 'express';
import { requireAuth, requireTenant } from '../middleware/auth.js';
import multer from 'multer';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireTenant);

const upload = multer({ dest: 'uploads/' });

router.get('/dashboard', async (req, res) => {
  try {
    const tenantId = req.user.id;

    // ⚡ Optimized: Only fetch columns required for the frontend
    const { data: userData } = await supabase.from('users')
      .select('id, name, email, phone, role, hostel_id, father_name, address, vehicle_number, join_date')
      .eq('id', tenantId)
      .single();

    const tenant = userData || { ...req.user };

    // Find active allocation via Supabase
    // Note: bed_id may be null if room wasn't found during join — handle gracefully
    const { data: allocations } = await supabase
       .from('allocations')
       .select('*, beds(*, rooms(*, floors(*)))')
       .eq('tenant_id', tenantId)
       .order('created_at', { ascending: false });

    const activeAlloc = (allocations || []).find(a => a.status === 'active' || a.status === 'vacating' || a.status === 'pending') || (allocations && allocations[0]);

    if (activeAlloc) {
      tenant.status = activeAlloc.status;
      tenant.rent_amount = activeAlloc.rent_amount || 0;
      tenant.billing_day = activeAlloc.billing_day || 1;

      // If bed_id is null, try to get room number directly from the allocation's room_number stored on user
      if (activeAlloc.beds?.rooms?.room_number) {
        tenant.roomNumber = activeAlloc.beds.rooms.rooms?.room_number || activeAlloc.beds.rooms.room_number || 'Assigned';
      } else {
        // bed_id null: try fetching room from users table join_date or just show pending
        tenant.roomNumber = 'Assigned';
      }
    } else {
      if (allocations && allocations.length > 0) {
        tenant.status = 'vacated';
      } else {
        tenant.status = 'new';
      }
    }

    let notices = [];
    let menu = null;
    let hostelName = "";

    // 🏆 Fallback: If user profile doesn't have hostel_id, get it from allocation's nested floors
    let hostelId = tenant.hostel_id;
    if (!hostelId && activeAlloc?.beds?.rooms?.floors?.hostel_id) {
        hostelId = activeAlloc.beds.rooms.floors.hostel_id;
    }
    
    // Only fetch hostel data if they are actively connected to one
    if (hostelId && tenant.status !== 'new') {
        const { data: hostelData } = await supabase.from('hostels').select('name').eq('id', hostelId).maybeSingle();
        hostelName = hostelData?.name || "";

        const { data: noticesData } = await supabase.from('notices').select('*').eq('hostel_id', hostelId).order('created_at', { ascending: false });
        notices = noticesData || [];
        
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const { data: menuData } = await supabase.from('menus').select('*').eq('hostel_id', hostelId).eq('day', today).maybeSingle();
        menu = menuData;
    }

    res.json({ tenant, notices, menu, hostelName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/verify-hostel/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { data: hostel } = await supabase.from('hostels').select('id, name').eq('pg_code', code).maybeSingle();

    if (!hostel) return res.status(404).json({ message: 'Invalid Hostel Code' });
    res.json({ id: hostel.id, name: hostel.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get rent amount for a specific room
router.get('/room-rent/:hostelCode/:roomNumber', async (req, res) => {
  try {
    const { hostelCode, roomNumber } = req.params;
    const { data: hostel } = await supabase.from('hostels').select('id').eq('pg_code', hostelCode).maybeSingle();
    if (!hostel) return res.status(404).json({ message: 'Hostel not found' });

    const { data: room } = await supabase
      .from('rooms')
      .select('id, room_number, rent_amount, capacity, floors!inner(hostel_id)')
      .eq('floors.hostel_id', hostel.id)
      .eq('room_number', roomNumber)
      .maybeSingle();

    if (!room) return res.status(404).json({ message: 'Room not found in this hostel' });
    res.json({ room_number: room.room_number, rent_amount: room.rent_amount || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/join', upload.single('aadhaar'), async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { hostelCode, tenantName, mobile, admissionDate, roomNumber, fatherName, address, vehicleNumber } = req.body;

    const { data: hostel } = await supabase.from('hostels').select('id').eq('pg_code', hostelCode).maybeSingle();
    if (!hostel) return res.status(404).json({ message: 'Hostel not found' });

    // Update user
    await supabase.from('users').update({
      hostel_id: hostel.id,
      phone: mobile,
      name: tenantName || req.user.name,
      join_date: admissionDate,
      father_name: fatherName,
      address: address,
      vehicle_number: vehicleNumber,
      aadhaar_url: req.file ? req.file.path : null
    }).eq('id', tenantId);

    let targetBedId = null;
    let rentAmount = 0;
    // billing_day = day of month from admissionDate (e.g. joined 15th → due on 15th every month)
    const billingDay = admissionDate ? new Date(admissionDate).getDate() : new Date().getDate();

    if (roomNumber) {
      const { data: roomData } = await supabase
        .from('rooms')
        .select('id, rent_amount, beds(id), floors!inner(hostel_id)')
        .eq('floors.hostel_id', hostel.id)
        .eq('room_number', roomNumber)
        .maybeSingle();

      if (roomData) {
        rentAmount = roomData.rent_amount || 0;
        // Pick the first available bed in this room
        if (roomData.beds && roomData.beds.length > 0) {
          targetBedId = roomData.beds[0].id;
        }
      }
    }

    await supabase.from('allocations').insert([{
      tenant_id: tenantId,
      bed_id: targetBedId,
      status: 'pending',
      start_date: admissionDate,
      rent_amount: rentAmount,
      billing_day: billingDay,
    }]);

    res.json({ message: 'Application submitted successfully! Awaiting owner approval.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create application.' });
  }
});

// Payments — includes current due amount from allocation
router.get('/payments', async (req, res) => {
  try {
    const tenantId = req.user.id;

    // Fetch active allocation to get rent_amount and billing_day
    const { data: activeAlloc } = await supabase
      .from('allocations')
      .select('rent_amount, billing_day, start_date, status')
      .eq('tenant_id', tenantId)
      .in('status', ['active', 'vacating'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('paid_at', { ascending: false });

    if (error) throw error;

    // Build "current due" info
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentYear = now.getFullYear();
    const rentAmount = activeAlloc?.rent_amount || 0;
    const billingDay = activeAlloc?.billing_day || 1;

    // Check if already paid this month
    const paidThisMonth = (payments || []).some(p =>
      p.month === currentMonth &&
      String(p.year) === String(currentYear) &&
      p.status === 'completed'
    );

    res.json({
      payments: payments || [],
      due: {
        amount: rentAmount,
        month: currentMonth,
        year: currentYear,
        billing_day: billingDay,
        is_paid: paidThisMonth,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/pay', async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { amount, month, year, utr_id } = req.body;
    
    await supabase.from('payments').insert([{
      tenant_id: tenantId,
      amount,
      month,
      year,
      utr_id,
      status: 'completed',
      paid_at: new Date().toISOString()
    }]);
    
    res.json({ message: 'Payment recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complaints
router.post('/complaints', async (req, res) => {
  try {
    const tenantId = req.user.id;
    let hostelId = req.user.hostel_id;
    const { issue, tenantName, roomNumber } = req.body;
    
    // Fallback: lookup active allocation to find hostel_id
    if (!hostelId) {
      const { data: allocations } = await supabase
        .from('allocations')
        .select('beds(rooms(floors(hostel_id)))')
        .eq('tenant_id', tenantId)
        .in('status', ['active', 'pending', 'vacating'])
        .maybeSingle();
      
      if (allocations?.beds?.rooms?.floors?.hostel_id) {
        hostelId = allocations.beds.rooms.floors.hostel_id;
      }
    }

    if (!hostelId) {
       return res.status(400).json({ message: 'Hostel association not found' });
    }
    
    const { error: insertError } = await supabase.from('complaints').insert([{
      tenant_id: tenantId,
      hostel_id: hostelId,
      title: 'Complaint',
      description: issue,
      status: 'open'
    }]);

    if (insertError) {
      console.error("Complaint Insert Error:", insertError);
      throw new Error(insertError.message || 'Failed to insert complaint');
    }
    
    res.json({ message: 'Complaint submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vacate
router.post('/vacate', async (req, res) => {
  try {
    const tenantId = req.user.id;
    const hostelId = req.user.hostel_id;
    const { vacateDate, vacateReason } = req.body;
    
    await supabase.from('vacate_requests').insert([{
      tenant_id: tenantId,
      hostel_id: hostelId,
      requested_date: vacateDate,
      reason: vacateReason,
      status: 'pending'
    }]);

    await supabase.from('allocations').update({ status: 'vacating', end_date: vacateDate })
      .eq('tenant_id', tenantId)
      .eq('status', 'active');

    res.json({ message: 'Vacate request submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
