import express from 'express';
import https from 'https';
import { requireAuth, requireOwner } from '../middleware/auth.js';
import { supabase } from '../supabaseClient.js';
import PaytmChecksum from 'paytmchecksum';

const router = express.Router();

const {
  PAYTM_MID,
  PAYTM_MERCHANT_KEY,
  PAYTM_WEBSITE,
  PAYTM_BASE_URL,
  FRONTEND_URL,
  BACKEND_URL,
} = process.env;

// ─────────────────────────────────────────────────────────
// 0. Start Free Trial — 7 days, no payment needed
// ─────────────────────────────────────────────────────────
router.post('/start-trial', requireAuth, requireOwner, async (req, res) => {
  try {
    const userId = req.user.id;
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    // Activate trial on user record
    const { error } = await supabase.from('users').update({
      subscription_status: 'trial',
      payment_setup_complete: true,
      trial_end_date: trialEndDate.toISOString(),
    }).eq('id', userId);

    if (error) throw error;

    // Log a trial record in platform_subscriptions
    await supabase.from('platform_subscriptions').insert([{
      owner_id: userId,
      plan_name: 'Free Trial',
      amount: 0,
      status: 'trial',
      start_date: new Date().toISOString(),
      end_date: trialEndDate.toISOString(),
      order_id: `TRIAL_${userId.slice(0, 8)}_${Date.now()}`,
    }]);

    res.json({
      message: 'Free trial activated',
      trial_end_date: trialEndDate.toISOString(),
      payment_setup_complete: true,
    });
  } catch (err) {
    console.error('Start trial error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// 1b. Verify Cashfree Subscription Payment
// ─────────────────────────────────────────────────────────
router.post('/verify-cashfree', requireAuth, requireOwner, async (req, res) => {
  try {
    const userId = req.user.id;
    const { order_id, amount, plan_name } = req.body;

    if (!order_id) return res.status(400).json({ error: 'order_id required' });

    // Verify with Cashfree
    const { Cashfree } = await import('cashfree-pg');
    Cashfree.XClientId     = process.env.CASHFREE_APP_ID;
    Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
    Cashfree.XEnvironment  = process.env.CASHFREE_ENV === 'production' ? 'PRODUCTION' : 'SANDBOX';

    const response = await Cashfree.PGOrderFetchPayments('2023-08-01', order_id);
    const payments = response.data;
    const success  = Array.isArray(payments)
      ? payments.find(p => p.payment_status === 'SUCCESS')
      : payments?.payment_status === 'SUCCESS' ? payments : null;

    if (!success) {
      return res.status(400).json({ error: 'Payment not confirmed yet' });
    }

    // Calculate subscription end date (1 year from now)
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    // Record in platform_subscriptions
    await supabase.from('platform_subscriptions').insert([{
      owner_id:   userId,
      plan_name:  plan_name || 'Annual Pro',
      amount:     parseFloat(amount || 40000),
      status:     'active',
      order_id:   order_id,
      txn_id:     String(success.cf_payment_id),
      start_date: new Date().toISOString(),
      end_date:   endDate.toISOString(),
    }]);

    // Activate owner subscription
    await supabase.from('users').update({
      subscription_status:    'active',
      payment_setup_complete: true,
      trial_end_date:         endDate.toISOString(),
    }).eq('id', userId);

    res.json({ success: true, message: 'Subscription activated!', end_date: endDate });
  } catch (err) {
    console.error('verify-cashfree error:', err?.response?.data || err.message);
    res.status(500).json({ error: err?.response?.data?.message || 'Verification failed' });
  }
});

// ─────────────────────────────────────────────────────────
// 1. Create Subscription — ₹40,000/year via Paytm (legacy)
// ─────────────────────────────────────────────────────────
router.post('/create-subscription', requireAuth, requireOwner, async (req, res) => {
  try {
    const userId = req.user.id;
    const { planName, amount } = req.body;
    const finalAmount = String(parseFloat(amount || 999).toFixed(2));
    const orderId = `SUB_${userId.slice(0, 8)}_${Date.now()}`;

    // Trial end date: 3 months from now
    const trialEndDate = new Date();
    trialEndDate.setMonth(trialEndDate.getMonth() + 3);

    // Record the pending subscription
    const { error: dbErr } = await supabase.from('platform_subscriptions').insert([{
      owner_id: userId,
      plan_name: planName || 'Pro Plan',
      amount: parseFloat(finalAmount),
      status: 'pending',
      order_id: orderId,
      end_date: trialEndDate.toISOString(),
    }]);
    if (dbErr) throw dbErr;

    // Build Paytm subscription params
    const paytmParams = {
      body: {
        requestType: 'NATIVE_SUBSCRIPTION',
        mid: PAYTM_MID,
        websiteName: PAYTM_WEBSITE || 'WEBSTAGING',
        orderId,
        callbackUrl: `${BACKEND_URL || 'https://pg-backend-499c.onrender.com'}/api/subscription/callback`,
        subscriptionAmountType: 'FIXED',
        subscriptionFrequency: '1',
        subscriptionFrequencyUnit: 'MONTH',
        subscriptionExpiryDate: '2030-12-31',
        subscriptionEnableRetry: '1',
        subscriptionPaymentMode: 'ALL',
        txnAmount: { value: finalAmount, currency: 'INR' },
        userInfo: {
          custId: userId,
          email: req.user.email,
          mobile: req.user.phone || '9999999999',
        },
      },
    };

    // Generate checksum
    const checksum = await PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams.body),
      PAYTM_MERCHANT_KEY
    );
    paytmParams.head = { signature: checksum };

    const postData = JSON.stringify(paytmParams);
    const hostname = (PAYTM_BASE_URL || 'https://securegw-stage.paytm.in').replace('https://', '');

    // Call Paytm to get txnToken
    const txnToken = await new Promise((resolve, reject) => {
      const paytmReq = https.request(
        {
          hostname,
          port: 443,
          path: `/theia/api/v1/initiateTransaction?mid=${PAYTM_MID}&orderId=${orderId}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
          },
        },
        (paytmRes) => {
          let data = '';
          paytmRes.on('data', (chunk) => (data += chunk));
          paytmRes.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (parsed.body?.txnToken) resolve(parsed.body.txnToken);
              else reject(new Error(parsed.body?.resultInfo?.resultMsg || 'Failed to get txnToken'));
            } catch (e) { reject(e); }
          });
        }
      );
      paytmReq.on('error', reject);
      paytmReq.write(postData);
      paytmReq.end();
    });

    res.json({
      txnToken,
      orderId,
      mid: PAYTM_MID,
      amount: finalAmount,
      trialEnd: trialEndDate.toISOString(),
    });
  } catch (err) {
    console.error('Subscription create error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// 2. Paytm Callback — Paytm POSTs here after payment/setup
// ─────────────────────────────────────────────────────────
router.post('/callback', async (req, res) => {
  try {
    const receivedData = req.body;
    const { CHECKSUMHASH, ...paytmParams } = receivedData;

    // Verify checksum
    const isVerified = await PaytmChecksum.verifySignature(
      paytmParams,
      PAYTM_MERCHANT_KEY,
      CHECKSUMHASH
    );

    if (!isVerified) {
      console.error('Subscription callback: checksum verification FAILED');
      return res.redirect(`${FRONTEND_URL}/select-plan?status=error`);
    }

    const { ORDERID, TXNID, STATUS, TXNAMOUNT, SUBSCRIPTIONID } = paytmParams;
    const isSuccess = STATUS === 'TXN_SUCCESS';
    const finalStatus = isSuccess ? 'active' : 'failed';

    // Compute trial end date
    const trialEndDate = new Date();
    trialEndDate.setMonth(trialEndDate.getMonth() + 3);

    // Update subscription record
    await supabase
      .from('platform_subscriptions')
      .update({
        status: finalStatus,
        transaction_id: TXNID,
        paytm_subscription_id: SUBSCRIPTIONID || null,
        start_date: isSuccess ? new Date().toISOString() : null,
        end_date: isSuccess ? trialEndDate.toISOString() : null,
      })
      .eq('order_id', ORDERID);

    if (isSuccess) {
      // Fetch owner_id for this order
      const { data: subRecord } = await supabase
        .from('platform_subscriptions')
        .select('owner_id')
        .eq('order_id', ORDERID)
        .single();

      if (subRecord?.owner_id) {
        // Activate the owner's account
        await supabase.from('users').update({
          subscription_status: 'trial',
          payment_setup_complete: true,
          trial_end_date: trialEndDate.toISOString(),
          paytm_subscription_id: SUBSCRIPTIONID || null,
        }).eq('id', subRecord.owner_id);
      }

      return res.redirect(`${FRONTEND_URL}/owner/dashboard?payment=success`);
    } else {
      return res.redirect(`${FRONTEND_URL}/select-plan?status=failed`);
    }
  } catch (err) {
    console.error('Subscription callback error:', err.message);
    res.redirect(`${FRONTEND_URL}/select-plan?status=error`);
  }
});

// ─────────────────────────────────────────────────────────
// 3. Get Subscription Status
// ─────────────────────────────────────────────────────────
router.get('/status', requireAuth, requireOwner, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('subscription_status, trial_end_date, payment_setup_complete, paytm_subscription_id')
      .eq('id', req.user.id)
      .single();

    const { data: sub } = await supabase
      .from('platform_subscriptions')
      .select('*')
      .eq('owner_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: allSubs } = await supabase
      .from('platform_subscriptions')
      .select('*')
      .eq('owner_id', req.user.id)
      .order('created_at', { ascending: false });

    res.json({
      user_status: user?.subscription_status || 'none',
      payment_setup_complete: user?.payment_setup_complete || false,
      trial_end_date: user?.trial_end_date,
      paytm_subscription_id: user?.paytm_subscription_id,
      latest: sub || null,
      history: allSubs || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// 4. Cancel Subscription (manual)
// ─────────────────────────────────────────────────────────
router.post('/cancel', requireAuth, requireOwner, async (req, res) => {
  try {
    await supabase.from('users').update({
      subscription_status: 'cancelled',
    }).eq('id', req.user.id);

    await supabase.from('platform_subscriptions')
      .update({ status: 'cancelled' })
      .eq('owner_id', req.user.id)
      .eq('status', 'active');

    res.json({ message: 'Subscription cancelled successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
