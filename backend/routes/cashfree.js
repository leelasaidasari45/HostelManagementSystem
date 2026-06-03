import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

const CF_VERSION = '2023-08-01';

// ─── Build Cashfree REST API base URL ─────────────────────────
const getCFBase = () =>
  process.env.CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

// ─── Helper: Cashfree headers ─────────────────────────────────
const cfHeaders = () => ({
  'Content-Type':    'application/json',
  'x-api-version':   CF_VERSION,
  'x-client-id':     process.env.CASHFREE_APP_ID,
  'x-client-secret': process.env.CASHFREE_SECRET_KEY,
});

// ─── POST /api/cashfree/create-order ──────────────────────────
router.post('/create-order', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, month, year, type = 'rent' } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Fetch user details for customer info
    const { data: user } = await supabase
      .from('users')
      .select('name, email, phone')
      .eq('id', userId)
      .single();

    const orderId = `easypg_${type}_${Date.now()}`;

    const FRONTEND = process.env.FRONTEND_URL || 'https://easypg-zeta.vercel.app';
    const returnPath = type === 'subscription' ? '/owner/dashboard' : '/tenant/dashboard';
    const finalReturnUrl = req.body.return_url || `${FRONTEND}${returnPath}?payment=success&order_id={order_id}`;

    const body = {
      order_id:       orderId,
      order_amount:   parseFloat(amount),
      order_currency: 'INR',
      customer_details: {
        customer_id:    String(userId).slice(0, 50),
        customer_name:  (user?.name  || 'User').slice(0, 100),
        customer_email: user?.email || 'user@easypg.com',
        customer_phone: (user?.phone || '9999999999').replace(/\D/g, '').slice(0, 10) || '9999999999',
      },
      order_meta: {
        return_url: finalReturnUrl,
        notify_url: `${process.env.BACKEND_URL || 'https://pg-backend-499c.onrender.com'}/api/cashfree/webhook`,
      },
    };

    // EasySplit Vendor Routing for Rent Payments
    if (type === 'rent') {
      const { data: tenantData } = await supabase.from('users').select('hostel_id').eq('id', userId).single();
      if (tenantData?.hostel_id) {
        const { data: hostelData } = await supabase.from('hostels').select('owner_id').eq('id', tenantData.hostel_id).single();
        if (hostelData?.owner_id) {
          // Use the primary bank account's vendor_id
          const { data: primaryAccount } = await supabase
            .from('bank_accounts')
            .select('vendor_id')
            .eq('owner_id', hostelData.owner_id)
            .eq('is_primary', true)
            .maybeSingle();
          if (primaryAccount?.vendor_id) {
            body.order_splits = [{ vendor_id: primaryAccount.vendor_id, percentage: 100 }];
          }
        }
      }
    }

    const response = await fetch(`${getCFBase()}/orders`, {
      method:  'POST',
      headers: cfHeaders(),
      body:    JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree create-order error:', data);
      return res.status(400).json({ error: data.message || 'Failed to create order' });
    }

    res.json({
      order_id:           data.order_id,
      payment_session_id: data.payment_session_id,
      order_status:       data.order_status,
      environment:        process.env.CASHFREE_ENV || 'sandbox',
    });
  } catch (err) {
    console.error('Cashfree create-order exception:', err.message);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// ─── POST /api/cashfree/verify ────────────────────────────────
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { order_id, amount, month, year } = req.body;

    if (!order_id) return res.status(400).json({ error: 'order_id required' });

    // Fetch payments for the order
    const response = await fetch(`${getCFBase()}/orders/${order_id}/payments`, {
      headers: cfHeaders(),
    });

    const payments = await response.json();

    if (!response.ok) {
      console.error('Cashfree verify error:', payments);
      return res.status(400).json({ error: payments.message || 'Failed to verify' });
    }

    const successPayment = Array.isArray(payments)
      ? payments.find(p => p.payment_status === 'SUCCESS')
      : null;

    if (!successPayment) {
      return res.status(400).json({ error: 'Payment not successful yet' });
    }

    // Record in payments table
    const { error: dbErr } = await supabase.from('payments').insert([{
      tenant_id: userId,
      amount:    parseFloat(amount || successPayment.order_amount),
      month:     month || new Date().toLocaleString('default', { month: 'long' }),
      year:      year  || new Date().getFullYear(),
      status:    'completed',
      paid_at:   new Date().toISOString(),
      utr_id:    String(successPayment.cf_payment_id || order_id),
    }]);

    if (dbErr) throw dbErr;

    res.json({ success: true, message: 'Payment verified and recorded!' });
  } catch (err) {
    console.error('Cashfree verify exception:', err.message);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ─── GET /api/cashfree/order/:orderId — check order status ───
router.get('/order/:orderId', requireAuth, async (req, res) => {
  try {
    const response = await fetch(`${getCFBase()}/orders/${req.params.orderId}`, {
      headers: cfHeaders(),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// ─── POST /api/cashfree/webhook ───────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (webhookData?.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const order      = webhookData.data?.order;
      const payment    = webhookData.data?.payment;
      const customerId = webhookData.data?.customer_details?.customer_id;

      if (order && payment && customerId) {
        const { data: existing } = await supabase
          .from('payments').select('id')
          .eq('utr_id', String(payment.cf_payment_id)).maybeSingle();

        if (!existing) {
          await supabase.from('payments').insert([{
            tenant_id: customerId,
            amount:    parseFloat(order.order_amount),
            status:    'completed',
            paid_at:   payment.payment_completion_time || new Date().toISOString(),
            utr_id:    String(payment.cf_payment_id),
          }]);
        }
      }
    }
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(200).json({ status: 'ok' });
  }
});

export default router;
