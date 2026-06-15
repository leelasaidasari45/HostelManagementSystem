import express from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// ─── PhonePe Config ────────────────────────────────────────────
const MERCHANT_ID  = process.env.PHONEPE_MERCHANT_ID  || 'PGTESTPAYUAT86';
const SALT_KEY     = process.env.PHONEPE_SALT_KEY      || '96434309-7796-489d-8924-ab56988a6076';
const SALT_INDEX   = process.env.PHONEPE_SALT_INDEX    || '1';
const PHONEPE_ENV  = process.env.PHONEPE_ENV           || 'sandbox';

const BASE_URL = PHONEPE_ENV === 'production'
  ? 'https://api.phonepe.com/apis/hermes'
  : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://easypg-zeta.vercel.app';
const BACKEND_URL  = process.env.BACKEND_URL  || 'https://pg-backend-499c.onrender.com';

// ─── Helper: Generate SHA256 checksum ─────────────────────────
const generateChecksum = (payload, endpoint) => {
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const hashString    = base64Payload + endpoint + SALT_KEY;
  const sha256        = crypto.createHash('sha256').update(hashString).digest('hex');
  return `${sha256}###${SALT_INDEX}`;
};

// ─── Helper: Verify checksum from PhonePe callback ─────────────
const verifyChecksum = (responseBase64, receivedChecksum) => {
  try {
    const [hash] = receivedChecksum.split('###');
    const expectedHash = crypto
      .createHash('sha256')
      .update(responseBase64 + '/pg/v1/status' + SALT_KEY)
      .digest('hex');
    return hash === expectedHash;
  } catch {
    return false;
  }
};

// ─── POST /api/phonepe/create-order ───────────────────────────
// Initiates a PhonePe payment. Returns redirectUrl or paymentInstrument.
router.post('/create-order', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, month, year, type = 'rent' } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Fetch tenant details
    const { data: user } = await supabase
      .from('users')
      .select('name, email, phone')
      .eq('id', userId)
      .single();

    const merchantTransactionId = `easypg_${type}_${Date.now()}`;
    const amountInPaise = Math.round(parseFloat(amount) * 100); // PhonePe uses paise

    const returnPath = type === 'subscription' ? '/owner/dashboard' : '/tenant/dashboard';
    const redirectUrl = `${BACKEND_URL}/api/phonepe/callback?merchantTransactionId=${merchantTransactionId}&userId=${userId}&amount=${amount}&month=${encodeURIComponent(month || '')}&year=${year || ''}&type=${type}`;

    const payload = {
      merchantId:            MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId:        `MUID_${String(userId).slice(0, 36)}`,
      amount:                amountInPaise,
      redirectUrl:           redirectUrl,
      redirectMode:          'POST',
      callbackUrl:           `${BACKEND_URL}/api/phonepe/webhook`,
      mobileNumber:          (user?.phone || '9999999999').replace(/\D/g, '').slice(0, 10) || '9999999999',
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    const checksum  = generateChecksum(payload, '/pg/v1/pay');
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

    const response = await fetch(`${BASE_URL}/pg/v1/pay`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY':     checksum,
        'X-MERCHANT-ID': MERCHANT_ID,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const data = await response.json();

    if (!data.success) {
      console.error('PhonePe create-order error:', data);
      return res.status(400).json({ error: data.message || 'Failed to initiate payment' });
    }

    const payPageUrl = data.data?.instrumentResponse?.redirectInfo?.url;

    res.json({
      success:               true,
      merchantTransactionId: merchantTransactionId,
      payPageUrl:            payPageUrl,
      environment:           PHONEPE_ENV,
    });
  } catch (err) {
    console.error('PhonePe create-order exception:', err.message);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// ─── GET /api/phonepe/status/:merchantTransactionId ───────────
// Check payment status manually (polling / verification)
router.get('/status/:merchantTransactionId', requireAuth, async (req, res) => {
  try {
    const { merchantTransactionId } = req.params;
    const endpoint = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;
    const hashString = endpoint + SALT_KEY;
    const sha256     = crypto.createHash('sha256').update(hashString).digest('hex');
    const checksum   = `${sha256}###${SALT_INDEX}`;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method:  'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY':      checksum,
        'X-MERCHANT-ID': MERCHANT_ID,
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('PhonePe status error:', err.message);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// ─── POST /api/phonepe/verify ─────────────────────────────────
// Called from the frontend after user returns from PhonePe page.
// Checks status and records the payment in DB.
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { merchantTransactionId, amount, month, year } = req.body;

    if (!merchantTransactionId) {
      return res.status(400).json({ error: 'merchantTransactionId is required' });
    }

    // Verify status with PhonePe
    const endpoint   = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;
    const hashString = endpoint + SALT_KEY;
    const sha256     = crypto.createHash('sha256').update(hashString).digest('hex');
    const checksum   = `${sha256}###${SALT_INDEX}`;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method:  'GET',
      headers: {
        'Content-Type':  'application/json',
        'X-VERIFY':      checksum,
        'X-MERCHANT-ID': MERCHANT_ID,
      },
    });

    const data = await response.json();

    if (!data.success || data.code !== 'PAYMENT_SUCCESS') {
      console.error('PhonePe verify - not successful:', data);
      return res.status(400).json({ error: 'Payment not successful', code: data.code });
    }

    // Check for duplicate payment
    const { data: existing } = await supabase
      .from('payments')
      .select('id')
      .eq('utr_id', merchantTransactionId)
      .maybeSingle();

    if (existing) {
      return res.json({ success: true, message: 'Payment already recorded!' });
    }

    // Record in DB
    const { error: dbErr } = await supabase.from('payments').insert([{
      tenant_id: userId,
      amount:    parseFloat(amount || (data.data?.amount / 100)),
      month:     month || new Date().toLocaleString('default', { month: 'long' }),
      year:      year  || new Date().getFullYear(),
      status:    'completed',
      paid_at:   new Date().toISOString(),
      utr_id:    merchantTransactionId,
    }]);

    if (dbErr) throw dbErr;

    res.json({ success: true, message: 'Payment verified and recorded!' });
  } catch (err) {
    console.error('PhonePe verify exception:', err.message);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ─── POST /api/phonepe/callback ───────────────────────────────
// PhonePe redirects here after payment (server-side redirect).
// Records payment and redirects user back to frontend.
router.post('/callback', async (req, res) => {
  try {
    const { merchantTransactionId, userId, amount, month, year, type } = req.query;
    const { response: responseBase64 } = req.body;

    if (responseBase64) {
      const decoded    = JSON.parse(Buffer.from(responseBase64, 'base64').toString('utf8'));
      const isSuccess  = decoded.code === 'PAYMENT_SUCCESS';

      if (isSuccess && merchantTransactionId && userId) {
        // Prevent duplicate inserts
        const { data: existing } = await supabase
          .from('payments')
          .select('id')
          .eq('utr_id', merchantTransactionId)
          .maybeSingle();

        if (!existing) {
          await supabase.from('payments').insert([{
            tenant_id: userId,
            amount:    parseFloat(amount || (decoded.data?.amount / 100)),
            month:     decodeURIComponent(month || new Date().toLocaleString('default', { month: 'long' })),
            year:      parseInt(year)  || new Date().getFullYear(),
            status:    'completed',
            paid_at:   new Date().toISOString(),
            utr_id:    merchantTransactionId,
          }]);
        }

        const redirectPath = type === 'subscription' ? '/owner/dashboard' : '/tenant/dashboard';
        return res.redirect(`${FRONTEND_URL}${redirectPath}?payment=success&txnId=${merchantTransactionId}`);
      }
    }

    // Payment failed / cancelled
    const redirectPath = type === 'subscription' ? '/owner/dashboard' : '/tenant/dashboard';
    res.redirect(`${FRONTEND_URL}${redirectPath}?payment=failed`);
  } catch (err) {
    console.error('PhonePe callback error:', err.message);
    res.redirect(`${FRONTEND_URL}/tenant/dashboard?payment=error`);
  }
});

// ─── POST /api/phonepe/webhook ────────────────────────────────
// Server-to-server webhook from PhonePe (async notification).
router.post('/webhook', async (req, res) => {
  try {
    const { response: responseBase64, checksum: receivedChecksum } = req.body;

    if (!responseBase64 || !receivedChecksum) {
      return res.status(200).json({ status: 'ok' }); // Always 200 to PhonePe
    }

    // Verify checksum
    const [receivedHash] = receivedChecksum.split('###');
    const expectedHash   = crypto
      .createHash('sha256')
      .update(responseBase64 + '/pg/v1/pay' + SALT_KEY)
      .digest('hex');

    if (receivedHash !== expectedHash) {
      console.warn('PhonePe webhook: invalid checksum');
      return res.status(200).json({ status: 'ok' });
    }

    const decoded   = JSON.parse(Buffer.from(responseBase64, 'base64').toString('utf8'));
    const isSuccess = decoded.code === 'PAYMENT_SUCCESS';

    if (isSuccess) {
      const txnId   = decoded.data?.merchantTransactionId;
      const amtRaw  = decoded.data?.amount; // in paise
      const userId  = decoded.data?.merchantUserId?.replace('MUID_', '');

      if (txnId && userId) {
        const { data: existing } = await supabase
          .from('payments')
          .select('id')
          .eq('utr_id', txnId)
          .maybeSingle();

        if (!existing) {
          await supabase.from('payments').insert([{
            tenant_id: userId,
            amount:    amtRaw ? amtRaw / 100 : 0,
            status:    'completed',
            paid_at:   new Date().toISOString(),
            utr_id:    txnId,
          }]);
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('PhonePe webhook error:', err.message);
    res.status(200).json({ status: 'ok' }); // Always 200
  }
});

export default router;
