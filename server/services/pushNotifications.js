const admin = require('firebase-admin');

let isFirebaseInitialized = false;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    isFirebaseInitialized = true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn('WARNING: Firebase credentials missing. Push notifications will not be sent.');
}

const sendToUser = async (userId, title, body, data = {}) => {
  if (!isFirebaseInitialized) return;

  try {
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      return;
    }

    const tokens = user.fcmTokens.map(t => t.token);
    
    const message = {
      notification: { title, body },
      data,
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    
    // Remove invalid tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      
      if (failedTokens.length > 0) {
        user.fcmTokens = user.fcmTokens.filter(t => !failedTokens.includes(t.token));
        await user.save();
      }
    }
    
    return response;
  } catch (error) {
    console.error('Error sending push to user:', error);
  }
};

const sendOrderUpdate = async (orderId, status) => {
  if (!isFirebaseInitialized) return;

  try {
    const Order = require('../models/Order');
    const order = await Order.findById(orderId);
    
    if (!order || !order.user) return; // Only send to authenticated users
    
    const title = 'Order Update';
    const body = `Your order #${order._id.toString().slice(-6).toUpperCase()} is now ${status}.`;
    
    await sendToUser(order.user, title, body, { orderId: order._id.toString(), type: 'order_update' });
  } catch (error) {
    console.error('Error sending order update push:', error);
  }
};

const sendBroadcast = async (title, body, data = {}, topic = 'all') => {
  if (!isFirebaseInitialized) return;

  try {
    const message = {
      notification: { title, body },
      data,
      topic,
    };

    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    console.error('Error sending broadcast push:', error);
  }
};

module.exports = {
  sendToUser,
  sendOrderUpdate,
  sendBroadcast
};
