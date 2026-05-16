import express from 'express';
import https from 'https';
import PaytmChecksum from 'paytmchecksum';
import { requireAuth, requireTenant } from '../middleware/auth.js';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

const {
  PAYTM_MID,
  PAYTM_MERCHANT_KEY,
  PAYTM_WEBSITE,
  PAYTM_CHANNEL_ID,
  PAYTM_INDUSTRY_TYPE,
  PAYTM_BASE_URL,
  FRONTEND_URL,
} = process.env;

// Step 1: Tenant calls this to start a payment - returns txnToken for JS checkout
router.post('/initiate', requireAuth, requireTenant, async (req, res) => {
  try {
    const { amount, month, year } = req.body;
    const tenantId = req.user.id;

    // orderId must be unique per transaction
    const orderId = `ORD_${tenantId.slice(0, 8)}_${Date.now()}`;
    const callbackUrl = `${process.env.BACKEND_URL || 'https://your-render-url.onrender.com'}/api/paytm/callback`;

    const paytmParams = {
      body: {
        requestType: 'Payment',
        mid: PAYTM_MID,
        websiteName: PAYTM_WEBSITE,
        orderId,
        callbackUrl,
        txnAmount: {
          value: String(Number(amount).toFixed(2)),
          currency: 'INR',
        },
        userInfo: {
          custId: tenantId,
        },
        industryTypeId: PAYTM_INDUSTRY_TYPE,
        channelId: PAYTM_CHANNEL_ID,
      },
    };

    // Step 0: Create a pending payment record in Supabase
    const { error: dbError } = await supabase.from('payments').insert([{
      tenant_id: tenantId,
      hostel_id: req.user.hostel_id,
      amount: parseFloat(amount),
      month: month || new Date().toLocaleString('default', { month: 'long' }),
      year: year || new Date().getFullYear(),
      order_id: orderId,
      status: 'pending'
    }]);

    if (dbError) throw dbError;

    // Generate signature
    const checksum = await PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams.body),
      PAYTM_MERCHANT_KEY
    );

    paytmParams.head = {
      signature: checksum,
    };

    const postData = JSON.stringify(paytmParams);

    const options = {
      hostname: PAYTM_BASE_URL.replace('https://', ''),
      port: 443,
      path: `/theia/api/v1/initiateTransaction?mid=${PAYTM_MID}&orderId=${orderId}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const txnToken = await new Promise((resolve, reject) => {
      const paytmReq = https.request(options, (paytmRes) => {
        let responseData = '';
        paytmRes.on('data', (chunk) => { responseData += chunk; });
        paytmRes.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            if (parsed.body?.txnToken) {
              resolve(parsed.body.txnToken);
            } else {
              reject(new Error(parsed.body?.resultInfo?.resultMsg || 'Failed to get txnToken'));
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      paytmReq.on('error', reject);
      paytmReq.write(postData);
      paytmReq.end();
    });

    res.json({ txnToken, orderId, mid: PAYTM_MID, amount });
  } catch (err) {
    console.error('Paytm initiate error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Step 2: Paytm posts here after the customer completes payment
// This is the server-side callback URL - Paytm hits this directly
router.post('/callback', async (req, res) => {
  try {
    const receivedData = req.body;
    const { CHECKSUMHASH, ...paytmParams } = receivedData;

    // Verify checksum to ensure the response wasn't tampered with
    const isVerified = await PaytmChecksum.verifySignature(
      paytmParams,
      PAYTM_MERCHANT_KEY,
      CHECKSUMHASH
    );

    if (!isVerified) {
      console.error('Paytm checksum verification FAILED');
      return res.status(400).send('Invalid checksum - potential tampering detected');
    }

    const { ORDERID, TXNID, STATUS, TXNAMOUNT, RESPMSG } = paytmParams;
    const finalStatus = STATUS === 'TXN_SUCCESS' ? 'completed' : 'failed';
    
    // Update existing payment record in Supabase
    await supabase
      .from('payments')
      .update({
        status: finalStatus,
        utr_id: TXNID,
        paid_at: STATUS === 'TXN_SUCCESS' ? new Date().toISOString() : null,
      })
      .eq('order_id', ORDERID);

    if (STATUS === 'TXN_SUCCESS') {
      // Redirect back to tenant dashboard with success flag
      return res.redirect(`${FRONTEND_URL}/tenant/dashboard?payment=success&txn=${TXNID}`);
    } else {
      // Payment failed - redirect with error info
      return res.redirect(`${FRONTEND_URL}/tenant/dashboard?payment=failed&msg=${encodeURIComponent(RESPMSG)}`);
    }
  } catch (err) {
    console.error('Paytm callback error:', err.message);
    res.redirect(`${FRONTEND_URL}/tenant/dashboard?payment=error`);
  }
});

export default router;
