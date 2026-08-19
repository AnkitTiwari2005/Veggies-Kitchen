const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn('WARNING: Razorpay credentials missing. Running with mock Razorpay service.');
}

const createOrder = async (amount, currency = 'INR', receipt) => {
  if (!razorpay) {
    return {
      id: `order_mock_${Date.now()}`,
      amount: amount,
      currency: currency,
      receipt: receipt,
      status: 'created'
    };
  }

  try {
    const options = {
      amount: amount, // amount in the smallest currency unit
      currency,
      receipt,
    };
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Razorpay createOrder error:', error);
    throw error;
  }
};

const verifyPayment = (orderId, paymentId, signature) => {
  if (!razorpay) {
    return true; // Mock success
  }

  const text = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');
    
  return expectedSignature === signature;
};

const verifyWebhookSignature = (body, signature) => {
  if (!razorpay) {
    return true; // Mock success
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};

module.exports = {
  createOrder,
  verifyPayment,
  verifyWebhookSignature
};
