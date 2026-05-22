import dotenv from 'dotenv';
dotenv.config();

const CF_VERSION = '2023-08-01';

async function testOrder() {
  const body = {
    order_id: `test_easypg_${Date.now()}`,
    order_amount: 40000,
    order_currency: 'INR',
    customer_details: {
      customer_id: 'test_user_123',
      customer_name: 'Test User',
      customer_email: 'test@easypg.com',
      customer_phone: '9999999999',
    },
    order_meta: {
      return_url: `https://easypg-zeta.vercel.app/owner/billing?payment=success&order_id={order_id}`,
      notify_url: `https://easypg-zeta.vercel.app/api/webhook`,
    },
  };

  console.log("Creating order...");
  const response = await fetch('https://api.cashfree.com/pg/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': CF_VERSION,
      'x-client-id': process.env.CASHFREE_APP_ID,
      'x-client-secret': process.env.CASHFREE_SECRET_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  console.log("Status:", response.status);
  console.log("Data:", JSON.stringify(data, null, 2));
}

testOrder();
