import express from 'express';
import { requireAuth, requireOwner } from '../middleware/auth.js';
import { supabase } from '../supabaseClient.js';
import { sendPushToHostelTenants, sendPushToUser } from '../utils/notificationService.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireOwner);

// Get valid property/hostel list for the owner
router.get('/hostels', async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { data: hostels, error } = await supabase.from('hostels')
      .select('*, floors(rooms(capacity))')
      .eq('owner_id', ownerId);
    if (error) throw error;
    
    // Map id to _id and pg_code to code for React frontend
    const mappedHostels = hostels.map(h => {
      let totalCapacity = 0;
      if (h.floors) {
        h.floors.forEach(f => {
          if (f.rooms) {
            f.rooms.forEach(r => {
              totalCapacity += (r.capacity || 0);
            });
          }
        });
      }
      return { 
        ...h, 
        _id: h.id, 
        code: h.pg_code,
        capacity: totalCapacity
      };
    });
    
    res.json(mappedHostels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

// Create Hostel
router.post('/hostels', upload.single('photo'), async (req, res) => {
  try {
    console.log("Create Hostel Request Body:", req.body);
    console.log("Create Hostel Uploaded File:", req.file);
    const ownerId = req.user.id;
    const { name, address, location, pg_code, bankAccount, bankIfsc, accountHolderName } = req.body;
    let floorsConfig = [];
    try {
      floorsConfig = req.body.floorsConfig ? JSON.parse(req.body.floorsConfig) : [];
    } catch(e) {
      console.error("Failed to parse floorsConfig", e);
    }
    
    // --- Create Cashfree Vendor (EasySplit) ---
    if (bankAccount && bankIfsc && accountHolderName) {
      const { data: user } = await supabase.from('users').select('email, phone').eq('id', ownerId).single();
      const vendorId = `vendor_${ownerId.replace(/-/g, '').substring(0, 20)}`;
      
      const cfBase = process.env.CASHFREE_ENV === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
      const cfHeaders = {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
      };
      
      try {
        const vendorRes = await fetch(`${cfBase}/vendors`, {
          method: 'POST',
          headers: cfHeaders,
          body: JSON.stringify({
            vendor_id: vendorId,
            name: accountHolderName,
            email: user?.email || 'vendor@easypg.com',
            phone: (user?.phone || '9999999999').replace(/\D/g, '').slice(0, 10),
            verify_account: false,
            bank: [
              {
                account_number: bankAccount,
                account_holder: accountHolderName,
                ifsc: bankIfsc
              }
            ]
          })
        });
        const vendorData = await vendorRes.json();
        if (!vendorRes.ok && vendorData.code !== 'vendor_already_exists') {
          console.error("Cashfree Vendor Creation Failed:", vendorData);
          // Non-fatal, we will just proceed, but you could choose to throw
        } else {
          // Update user table with vendor details
          await supabase.from('users').update({
            vendor_id: vendorId,
            bank_account: bankAccount,
            bank_ifsc: bankIfsc,
            account_holder_name: accountHolderName
          }).eq('id', ownerId);
        }
      } catch (err) {
        console.error("Cashfree vendor API exception:", err.message);
      }
    }
    // ------------------------------------------

    const photo_url = req.file ? req.file.path : null;

    // Check if PG code already exists
    const codeToCheck = pg_code || `PG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const { data: existingHostel } = await supabase.from('hostels').select('id').eq('pg_code', codeToCheck).maybeSingle();
    
    if (existingHostel) {
      return res.status(400).json({ error: 'PG Code already exists. Please try another.' });
    }

    // Insert Hostel
    const { data: newHostel, error: hError } = await supabase.from('hostels').insert([{
       owner_id: ownerId, 
       name: name, 
       address: address || '', 
       location: location || '',
       photo_url: photo_url,
       pg_code: codeToCheck
    }]).select().single();
    if (hError) throw hError;

    if (floorsConfig && Array.isArray(floorsConfig)) {
        for (const fConf of floorsConfig) {
            // Insert Floor
            const { data: floor, error: fError } = await supabase.from('floors').insert([{
                hostel_id: newHostel.id,
                floor_number: Number(fConf.floor)
            }]).select().single();
            if (fError) throw fError;
            
            // Insert Rooms — now includes rent_amount
            const roomsParams = fConf.rooms.map(r => ({
                floor_id: floor.id,
                room_number: String(r.number),
                capacity: Number(r.capacity),
                rent_amount: Number(r.rent_amount || 0),
            }));
            
            const { data: rooms, error: rError } = await supabase.from('rooms').insert(roomsParams).select();
            if (rError) throw rError;
            
            let bedsToInsert = [];
            for (const room of rooms) {
                for (let i = 1; i <= room.capacity; i++) {
                   bedsToInsert.push({
                       room_id: room.id,
                       bed_label: `${room.room_number}-B${i}`
                   });
                }
            }
            if (bedsToInsert.length > 0) {
                const { error: bError } = await supabase.from('beds').insert(bedsToInsert);
                if (bError) throw bError;
            }
        }
    }

    res.json({ 
      message: 'Hostel layout fully generated!', 
      ...newHostel, 
      code: newHostel.pg_code 
    });
  } catch (err) {
    console.error("Hostel Create Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get Tenants for a hostel
router.get('/tenants', async (req, res) => {
  try {
    const { hostelId } = req.query;
    
    // Supabase Relational Fetch
    const { data: users, error } = await supabase
       .from('users')
       .select('*, allocations(*, beds(*, rooms(*)))')
       .eq('role', 'tenant')
       .eq('hostel_id', hostelId);

    if (error) throw error;
    if (!users || !users.length) return res.json([]);

    const tenantIds = users.map(u => u.id);
    const { data: payments, error: pError } = await supabase
       .from('payments')
       .select('tenant_id, amount, status, month, year')
       .in('tenant_id', tenantIds)
       .eq('status', 'completed');

    if (pError) throw pError;

    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentYear = String(now.getFullYear());

    const tenantPaidMap = {};
    (payments || []).forEach(p => {
      if (p.month === currentMonth && String(p.year) === currentYear) {
        tenantPaidMap[p.tenant_id] = (tenantPaidMap[p.tenant_id] || 0) + Number(p.amount);
      }
    });

    const mapped = users.map(t => {
      // Find the most active allocation out of the array
      const allocs = t.allocations || [];
      // Sort to get newest
      allocs.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
      
      const actAlloc = allocs.find(a => a.status === 'active' || a.status === 'pending' || a.status === 'vacating') || allocs[0];
      const roomNumber = actAlloc?.beds?.rooms?.room_number || 'N/A';
      
      const rentAmount = actAlloc?.rent_amount || 0;
      const paidAmount = tenantPaidMap[t.id] || 0;
      const dueAmount = Math.max(0, rentAmount - paidAmount);
      
      let paymentStatus = 'unpaid';
      if (rentAmount === 0) {
        paymentStatus = 'paid';
      } else if (paidAmount >= rentAmount) {
        paymentStatus = 'paid';
      } else if (paidAmount > 0) {
        paymentStatus = 'partial';
      }

      return {
        ...t,
        _id: actAlloc?.id || t.id, // Supabase id
        tenant_id: t.id,
        user: { name: t.name },
        mobile: t.phone,
        fatherName: t.father_name,
        address: t.address,
        vehicleNumber: t.vehicle_number,
        aadhaarFile: t.aadhaar_url,
        admissionDate: actAlloc?.start_date || t.join_date,
        status: actAlloc?.status || 'pending',
        roomNumber: roomNumber,
        rent_amount: rentAmount,
        paid_amount: paidAmount,
        due_amount: dueAmount,
        payment_status: paymentStatus
      };
    });
    
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Archived Tenants for a hostel
router.get('/tenants/archived', async (req, res) => {
  try {
    const { hostelId } = req.query;
    
    // In Supabase we can query allocations with deep relationships
    const { data: vacatedAllocations, error } = await supabase
       .from('allocations')
       .select(`
          *,
          users!inner(*),
          beds!inner(
             *,
             rooms!inner(
                *,
                floors!inner(*)
             )
          )
       `)
       .eq('status', 'vacated')
       .eq('beds.rooms.floors.hostel_id', hostelId);

    if (error) throw error;
       
    const mapped = vacatedAllocations.map(actAlloc => {
       const t = actAlloc.users;
       if (!t) return null;
       const roomNumber = actAlloc.beds?.rooms?.room_number || 'N/A';
       
       return {
          ...t,
          _id: actAlloc.id,
          tenant_id: t.id,
          user: { name: t.name },
          mobile: t.phone,
          fatherName: t.father_name,
          address: t.address,
          vehicleNumber: t.vehicle_number,
          aadhaarFile: t.aadhaar_url,
          admissionDate: actAlloc.start_date || t.join_date,
          vacateDate: actAlloc.end_date || new Date().toISOString(),
          status: 'vacated',
          roomNumber: roomNumber
       };
    }).filter(x => x !== null);
    
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve Tenant (Approve Allocation)
router.put('/tenants/:id/approve', async (req, res) => {
  try {
    const { id } = req.params; // allocation id
    const { data: alloc } = await supabase.from('allocations').select('tenant_id').eq('id', id).single();
    
    const { error } = await supabase.from('allocations').update({ status: 'active' }).eq('id', id);
    if (error) throw error;

    res.json({ message: 'Approved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/tenants/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: alloc } = await supabase.from('allocations').select('tenant_id').eq('id', id).single();

    const { error } = await supabase.from('allocations').update({ status: 'rejected' }).eq('id', id);
    if (error) throw error;

    // 🛑 Clear hostel_id from user table so they can join elsewhere / are "un-joined"
    if (alloc && alloc.tenant_id) {
       await supabase.from('users').update({ hostel_id: null }).eq('id', alloc.tenant_id);
    }

    res.json({ message: 'Rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/tenants/:id/vacate_complete', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get tenant_id to clear their hostel association
    const { data: alloc } = await supabase.from('allocations').select('tenant_id').eq('id', id).single();

    const { error } = await supabase.from('allocations').update({ status: 'vacated', end_date: new Date().toISOString() }).eq('id', id);
    if (error) throw error;

    // 🛑 Clear hostel_id so they can join a different hostel in the future
    if (alloc && alloc.tenant_id) {
       await supabase.from('users').update({ hostel_id: null }).eq('id', alloc.tenant_id);
    }

    res.json({ message: 'Vacated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rooms Page mapping
router.get('/rooms', async (req, res) => {
  try {
    const { hostelId } = req.query;
    
    // Deep relational fetch in Supabase
    const { data: floors, error } = await supabase
       .from('floors')
       .select(`
         *,
         rooms (
           *,
           beds (
             *,
             allocations (
               *,
               users (*)
             )
           )
         )
       `)
       .eq('hostel_id', hostelId);

    if (error) throw error;

    const mappedRooms = [];
    floors.forEach(floor => {
       (floor.rooms || []).forEach(room => {
          
          let occupants = [];
          (room.beds || []).forEach(bed => {
             const activeAlloc = (bed.allocations || []).find(a => a.status === 'active' || a.status === 'pending' || a.status === 'vacating');
             if (activeAlloc && activeAlloc.users) {
                occupants.push({
                   _id: activeAlloc.users.id, // match frontend _id
                   user: { name: activeAlloc.users.name || 'Unnamed Tenant' },
                   phone: activeAlloc.users.phone || 'N/A',
                   admissionDate: activeAlloc.start_date || activeAlloc.users.join_date || 'N/A',
                   status: activeAlloc.status || 'pending'
                });
             }
          });

          mappedRooms.push({
             _id: room.id,
             number: room.room_number,
             floor: String(floor.floor_number),
             capacity: room.capacity,
             rent_amount: room.rent_amount || 0,
             occupants: occupants
          });
       });
    });
    
    res.json(mappedRooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Payment history for a specific tenant (owner view)
router.get('/tenant-payments/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('paid_at', { ascending: false });
    if (error) throw error;
    res.json(payments || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complaints
router.get('/complaints', async (req, res) => {
  try {
    const { hostelId } = req.query;
    const { data: complaints, error } = await supabase
       .from('complaints')
       .select('*, users!tenant_id(name, allocations(status, beds(rooms(room_number))))')
       .eq('hostel_id', hostelId)
       .order('created_at', { ascending: false });

    if (error) throw error;
    
    res.json((complaints || []).map(c => {
      let roomNumber = 'N/A';
      if (c.users?.allocations && c.users.allocations.length > 0) {
        const activeAlloc = c.users.allocations.find(a => a.status === 'active' || a.status === 'pending' || a.status === 'vacating') || c.users.allocations[0];
        if (activeAlloc?.beds?.rooms?.room_number) {
          roomNumber = activeAlloc.beds.rooms.room_number;
        }
      }

      return {
        ...c,
        _id: c.id,
        tenantName: c.users?.name || 'Unknown',
        roomNumber: roomNumber,
        createdAt: c.created_at,
      };
    }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resolve Complaint
router.put('/complaints/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Get complaint info before updating
    const { data: complaint } = await supabase.from('complaints').select('tenant_id, title').eq('id', id).single();
    
    // 2. Update status
    const { error } = await supabase.from('complaints').update({ status: 'resolved' }).eq('id', id);
    if (error) throw error;

    res.json({ message: 'Complaint resolved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics
router.get('/analytics', async (req, res) => {
  try {
    const { hostelId } = req.query;
    
    const { data: hostel } = await supabase.from('hostels').select('name, pg_code').eq('id', hostelId).maybeSingle();
    
    // Total Rooms and Capacity
    const { data: rooms } = await supabase.from('rooms')
       .select('capacity, floors!inner(hostel_id)')
       .eq('floors.hostel_id', hostelId);
       
    let totalCapacity = 0;
    (rooms || []).forEach(r => totalCapacity += r.capacity);

    // Active allocations
    const { data: allocations, count } = await supabase.from('allocations')
       .select('id, tenant_id, beds!inner(rooms!inner(floors!inner(hostel_id)))', { count: 'exact' })
       .in('status', ['active', 'vacating', 'pending'])
       .eq('beds.rooms.floors.hostel_id', hostelId);
       
    const totalTenants = count || 0;
    const occupancyRate = totalCapacity > 0 ? Math.round((totalTenants / totalCapacity) * 100) : 0;
    
    // Efficient head query for count only
    const { count: pendingComplaints } = await supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('hostel_id', hostelId).eq('status', 'open');

    // --- Fix: Calculate real monthly collection from payments table ---
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

    const tenantIds = (allocations || []).map(a => a.tenant_id).filter(Boolean);

    let totalCollection = 0;
    let lastMonthCollection = 0;
    let totalDues = 0;

    if (tenantIds.length > 0) {
      const { data: thisMonthPayments } = await supabase
        .from('payments')
        .select('amount')
        .in('tenant_id', tenantIds)
        .gte('paid_at', thisMonthStart)
        .eq('status', 'completed');
      
      const { data: lastMonthPayments } = await supabase
        .from('payments')
        .select('amount')
        .in('tenant_id', tenantIds)
        .gte('paid_at', lastMonthStart)
        .lte('paid_at', lastMonthEnd)
        .eq('status', 'completed');

      totalCollection = (thisMonthPayments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      lastMonthCollection = (lastMonthPayments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      // Calculate dues for active tenants in the current month
      const { data: activeAllocations } = await supabase
        .from('allocations')
        .select('rent_amount, tenant_id, beds!inner(rooms!inner(floors!inner(hostel_id)))')
        .in('status', ['active', 'vacating'])
        .eq('beds.rooms.floors.hostel_id', hostelId);

      if (activeAllocations && activeAllocations.length > 0) {
        const activeTenantIds = activeAllocations.map(a => a.tenant_id).filter(Boolean);
        if (activeTenantIds.length > 0) {
          // Fetch payments made by active tenants this month
          const { data: activeTenantsPayments } = await supabase
            .from('payments')
            .select('tenant_id, amount')
            .in('tenant_id', activeTenantIds)
            .gte('paid_at', thisMonthStart)
            .eq('status', 'completed');

          // Group payments by tenant
          const tenantPaidMap = {};
          (activeTenantsPayments || []).forEach(p => {
            tenantPaidMap[p.tenant_id] = (tenantPaidMap[p.tenant_id] || 0) + (Number(p.amount) || 0);
          });

          // Dues for each tenant is their rent_amount minus their payment this month (min 0)
          activeAllocations.forEach(a => {
            const paid = tenantPaidMap[a.tenant_id] || 0;
            const due = (Number(a.rent_amount) || 0) - paid;
            if (due > 0) {
              totalDues += due;
            }
          });
        }
      }
    }

    const collectionTrend = lastMonthCollection > 0
      ? Math.round(((totalCollection - lastMonthCollection) / lastMonthCollection) * 100)
      : totalCollection > 0 ? 100 : 0;

    // Optimized payment feed (select only 3 specific columns)
    const { data: recentPayments } = await supabase
      .from('payments')
      .select('amount, paid_at, status, users(name)')
      .in('tenant_id', tenantIds.length > 0 ? tenantIds : ['none'])
      .order('paid_at', { ascending: false })
      .limit(5);

    res.json({
       hostel: hostel ? { name: hostel.name, code: hostel.pg_code } : null,
       metrics: {
         occupancyRate,
         totalCollection,
         lastMonthCollection,
         totalDues,
         collectionTrend,
         totalTenants,
         availableRooms: totalCapacity - totalTenants
       },
       pendingComplaints: pendingComplaints || 0,
       recentPayments: recentPayments || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post Notice
router.post('/notices', async (req, res) => {
  try {
    const { hostelId } = req.query;
    const { title, message } = req.body;
    
    // 1. Save Notice to DB
    const { data: notice, error: nError } = await supabase.from('notices').insert([{ hostel_id: hostelId, title, message }]).select().single();
    if (nError) throw nError;

    // 2. Send push notification to all tenants
    sendPushToHostelTenants(
      hostelId,
      `📢 New Notice: ${title}`,
      message,
      { type: 'notice' }
    ).catch(console.error);

    res.json({ message: 'Notice posted!' });
  } catch (err) {
    console.error('Notice error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update Menu
router.put('/menu', async (req, res) => {
  try {
    const { hostelId } = req.query;
    const { day, breakfast, lunch, snacks, dinner } = req.body;
    
    await supabase.from('menus').upsert([{
       hostel_id: hostelId, day, breakfast, lunch, snacks, dinner
    }], { onConflict: 'hostel_id,day' });

    // Send push notification to all tenants
    sendPushToHostelTenants(
      hostelId,
      `🍽️ Menu Updated for ${day}`,
      `Check today's menu — ${[breakfast, lunch, snacks, dinner].filter(Boolean).join(', ')}`,
      { type: 'menu' }
    ).catch(console.error);
    
    res.json({ message: 'Menu updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── BANK ACCOUNTS ────────────────────────────────────────────────────────────

const CF_BASE = () => process.env.CASHFREE_ENV === 'production'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

const CF_HEADERS = () => ({
  'Content-Type': 'application/json',
  'x-api-version': '2023-08-01',
  'x-client-id': process.env.CASHFREE_APP_ID,
  'x-client-secret': process.env.CASHFREE_SECRET_KEY,
});

// GET all bank accounts for this owner
router.get('/bank-accounts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('owner_id', req.user.id)
      .order('created_at', { ascending: false });

    // If table doesn't exist yet, return empty array instead of crashing
    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return res.json([]);
      }
      throw error;
    }
    res.json(data || []);
  } catch (err) {
    // Gracefully return empty array for any DB schema issues
    console.error('bank-accounts GET error:', err.message);
    res.json([]);
  }
});

// POST add a new bank account
router.post('/bank-accounts', async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { account_holder_name, bank_name, account_number, ifsc } = req.body;

    if (!account_holder_name || !account_number || !ifsc) {
      return res.status(400).json({ error: 'Account holder name, account number, and IFSC are required.' });
    }

    // Check if this is the first account — if so, make it primary automatically
    const { data: existing } = await supabase
      .from('bank_accounts')
      .select('id')
      .eq('owner_id', ownerId);
    const isPrimary = !existing || existing.length === 0;

    // Register as Cashfree Vendor
    const { data: ownerUser } = await supabase.from('users').select('email, phone').eq('id', ownerId).single();
    const vendorId = `vendor_${ownerId.replace(/-/g, '').substring(0, 20)}_${Date.now()}`;

    let cfVendorId = null;
    try {
      const vendorRes = await fetch(`${CF_BASE()}/vendors`, {
        method: 'POST',
        headers: CF_HEADERS(),
        body: JSON.stringify({
          vendor_id: vendorId,
          name: account_holder_name,
          email: ownerUser?.email || 'vendor@easypg.com',
          phone: (ownerUser?.phone || '9999999999').replace(/\D/g, '').slice(0, 10),
          verify_account: false,
          bank: [{ account_number, account_holder: account_holder_name, ifsc }]
        })
      });
      const vendorData = await vendorRes.json();
      if (vendorRes.ok || vendorData.code === 'vendor_already_exists') {
        cfVendorId = vendorId;
      } else {
        console.error('Cashfree vendor error:', vendorData);
      }
    } catch (err) {
      console.error('Cashfree vendor API exception:', err.message);
    }

    // Insert into bank_accounts table
    const { data: newAccount, error } = await supabase
      .from('bank_accounts')
      .insert([{
        owner_id: ownerId,
        account_holder_name,
        bank_name: bank_name || '',
        account_number,
        ifsc: ifsc.toUpperCase(),
        vendor_id: cfVendorId,
        is_primary: isPrimary,
      }])
      .select()
      .single();
    if (error) throw error;

    res.json(newAccount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT set an account as primary (receive payments)
router.put('/bank-accounts/:id/set-primary', async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;

    // Unset all primary first
    await supabase.from('bank_accounts').update({ is_primary: false }).eq('owner_id', ownerId);
    // Set this one as primary
    const { error } = await supabase.from('bank_accounts').update({ is_primary: true }).eq('id', id).eq('owner_id', ownerId);
    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a bank account
router.delete('/bank-accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('bank_accounts').delete().eq('id', id).eq('owner_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
