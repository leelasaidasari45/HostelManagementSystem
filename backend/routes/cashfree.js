import express from 'express';
import { Cashfree } from 'cashfree-pg';
import { requireAuth, requireTenant } from '../middleware/auth.js';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// ─── Init Cashfree SDK ────────────────────────────────────────
Cashfree.XClientId     = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment  =
  process.env.CASHFREE_ENV === 'production'
    ? 'PRODUCTION'
    : 'SANDBOX';

const CF_API_VERSION = '2023-08-01';

// ─── POST /api/cashfree/create-order ─────────────────────────
// Creates a Cashfree payment order and returns payment_session_id
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

    const orderRequest = {
      order_id:       orderId,
      order_amount:   parseFloat(amount),
      order_currency: 'INR',
      customer_details: {
        customer_id:    userId,
        customer_name:  user?.name  || 'Tenant',
        customer_email: user?.email || 'tenant@easypg.com',
        customer_phone: user?.phone || '9999999999',
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/tenant/dashboard?payment=success&order_id=${orderId}`,
        notify_url: `${process.env.BACKEND_URL}/api/cashfree/webhook`,
      },
      order_note: `EasyPG ${type} payment - ${month} ${year}`,
    };

    const response = await Cashfree.PGCreateOrder(CF_API_VERSION, orderRequest);
    const orderData = response.data;

    res.json({
      order_id:           orderData.order_id,
      payment_session_id: orderData.payment_session_id,
      order_status:       orderData.order_status,
      environment:        process.env.CASHFREE_ENV || 'sandbox',
    });
  } catch (err) {
    console.error('Cashfree create-order error:', err?.response?.data || err.message);
    res.status(500).json({ error: err?.response?.data?.message || 'Failed to create order' });
  }
});

// ─── POST /api/cashfree/verify ────────────────────────────────
// Verifies payment after checkout and records it in DB
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const userId  = req.user.id;
    const { order_id, amount, month, year } = req.body;

    if (!order_id) return res.status(400).json({ error: 'order_id required' });

    // Verify with Cashfree
    const response = await Cashfree.PGOrderFetchPayments(CF_API_VERSION, order_id);
    const payments  = response.data;

    // Find the successful payment
    const success = Array.isArray(payments)
      ? payments.find(p => p.payment_status === 'SUCCESS')
      : payments?.payment_status === 'SUCCESS' ? payments : null;

    if (!success) {
      return res.status(400).json({ error: 'Payment not successful', payments });
    }

    // Record payment in DB
    const { error: dbErr } = await supabase.from('payments').insert([{
      tenant_id: userId,
      amount:    parseFloat(amount || success.order_amount),
      month:     month  || new Date().toLocaleString('default', { month: 'long' }),
      year:      year   || new Date().getFullYear(),
      status:    'completed',
      paid_at:   new Date().toISOString(),
      utr_id:    success.cf_payment_id || order_id,
    }]);

    if (dbErr) throw dbErr;

    res.json({ success: true, message: 'Payment verified and recorded!' });
  } catch (err) {
    console.error('Cashfree verify error:', err?.response?.data || err.message);
    res.status(500).json({ error: err?.response?.data?.message || 'Verification failed' });
  }
});

// ─── POST /api/cashfree/webhook ───────────────────────────────
// Cashfree server-to-server notification (backup verification)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    console.log('Cashfree webhook received:', webhookData?.data?.order?.order_id);

    if (webhookData?.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const order   = webhookData.data?.order;
      const payment = webhookData.data?.payment;

      if (order && payment) {
        // Extract tenant_id from order_id: easypg_rent_<timestamp> — use customer_id
        const customerId = webhookData.data?.customer_details?.customer_id;

        // Avoid duplicate records
        const { data: existing } = await supabase
          .from('payments')
          .select('id')
          .eq('utr_id', String(payment.cf_payment_id))
          .maybeSingle();

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
    res.status(200).json({ status: 'ok' }); // Always 200 for webhooks
  }
});

export default router;
