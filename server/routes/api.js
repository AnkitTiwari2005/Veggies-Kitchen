const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const MenuCategory = require('../models/Menu');
const Blog = require('../models/Blog');
const SiteSettings = require('../models/SiteSettings');
const Order = require('../models/Order');
const ActivityLog = require('../models/ActivityLog');
const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const sendOrderEmail = async (toEmail, toName, subject, htmlPart) => {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: `Veggies Kitchen <${process.env.RESEND_SENDER_EMAIL || 'onboarding@resend.dev'}>`,
      to: [toEmail],
      subject: subject,
      html: htmlPart,
    });
  } catch (err) {
    console.error('Resend error:', err);
  }
};

// --- Middleware ---
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { isAuthenticated, isAdmin: isAdminJWT, optionalAuth } = require('../middleware/auth');
const razorpayService = require('../services/razorpay');
const pushService = require('../services/pushNotifications');
const User = require('../models/User');
const admin = require('firebase-admin'); // for verifyIdToken

const isAdmin = isAdminJWT; // override local isAdmin

const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 10, message: { error: 'Too many attempts' } });

// --- Auth ---
router.get('/auth/me', optionalAuth, (req, res) => {
  if (req.user) {
    res.json({ user: req.user.toSafeObject ? req.user.toSafeObject() : req.user });
  } else {
    res.json({ user: null });
  }
});

router.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- Activity Logs ---
router.get('/activity', isAdmin, async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 }).populate('user', 'name email').limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Orders ---
router.get('/orders', isAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders/me', isAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const orderData = { ...req.body };
    if (req.isAuthenticated()) {
      orderData.user = req.user._id;
      orderData.isGuest = false;
      
      if (orderData.deliveryAddress) {
        const User = require('../models/User');
        const user = await User.findById(req.user._id);
        if (user) {
          const isUnique = !user.addresses.some(a => 
            a.street === orderData.deliveryAddress.street && 
            a.city === orderData.deliveryAddress.city && 
            a.pincode === orderData.deliveryAddress.pincode
          );
          if (isUnique) {
            user.addresses.push({
              street: orderData.deliveryAddress.street,
              city: orderData.deliveryAddress.city,
              state: orderData.deliveryAddress.state,
              pincode: orderData.deliveryAddress.pincode
            });
            await user.save();
          }
        }
      }
    }
    const order = new Order(orderData);
    await order.save();
    
    // Log Activity
    await ActivityLog.create({ 
      action: 'Order Placed', 
      user: req.user ? req.user._id : null,
      details: { orderId: order._id, total: order.total, customer: order.customerName } 
    });

    if (order.customerEmail) {
      const emailHtml = `
        <h2>Order Confirmation</h2>
        <p>Hi ${order.customerName},</p>
        <p>Thank you for your order! Your order #${order._id.toString().slice(-6).toUpperCase()} is now <strong>Pending</strong>.</p>
        <h3>Order Summary</h3>
        <ul>
          ${order.items.map(item => `<li>${item.quantity}x ${item.name} - ₹${item.price}</li>`).join('')}
        </ul>
        <p><strong>Subtotal:</strong> ₹${order.subtotal}</p>
        <p><strong>Delivery Fee:</strong> ₹${order.deliveryFee}</p>
        <p><strong>Total:</strong> ₹${order.total}</p>
      `;
      await sendOrderEmail(order.customerEmail, order.customerName, `Order Confirmation - #${order._id.toString().slice(-6).toUpperCase()}`, emailHtml);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/orders/:id/status', isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    // Log Activity
    await ActivityLog.create({ 
      action: `Order Status Updated to ${status}`, 
      user: req.user ? req.user._id : null,
      details: { orderId: order._id } 
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/orders/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Only allow cancelling if pending or preparing
    if (order.status !== 'Pending' && order.status !== 'Preparing') {
      return res.status(400).json({ error: 'Cannot cancel order at this stage' });
    }
    
    // Check if order is older than 10 minutes (600000 ms)
    if (Date.now() - new Date(order.createdAt).getTime() > 10 * 60 * 1000) {
      return res.status(400).json({ error: 'Orders older than 10 minutes can only be cancelled by contacting support.' });
    }

    order.status = 'Cancelled';
    await order.save();
    
    await ActivityLog.create({ 
      action: 'Order Cancelled', 
      user: req.user ? req.user._id : null,
      details: { orderId: order._id } 
    });

    if (order.customerEmail) {
      const emailHtml = `
        <h2>Order Cancelled</h2>
        <p>Hi ${order.customerName},</p>
        <p>Your order #${order._id.toString().slice(-6).toUpperCase()} has been cancelled successfully.</p>
        <p>If you have any questions, please contact our support.</p>
      `;
      await sendOrderEmail(order.customerEmail, order.customerName, `Order Cancelled - #${order._id.toString().slice(-6).toUpperCase()}`, emailHtml);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Site Settings ---
router.get('/settings', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const settings = await SiteSettings.find();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings/:key', isAdmin, async (req, res) => {
  try {
    const { value } = req.body;
    const setting = await SiteSettings.findOneAndUpdate(
      { key: req.params.key },
      { value },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Menu ---
router.get('/menu', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const menu = await MenuCategory.find();
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/menu', isAdmin, async (req, res) => {
  try {
    const category = new MenuCategory(req.body);
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/menu/:id', isAdmin, async (req, res) => {
  try {
    const category = await MenuCategory.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/menu/:id', isAdmin, async (req, res) => {
  try {
    await MenuCategory.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Blogs ---
router.get('/blogs', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/blogs', isAdmin, async (req, res) => {
  try {
    const blog = new Blog(req.body);
    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/blogs/:id', isAdmin, async (req, res) => {
  try {
    await Blog.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Initial Seed Route (for convenience) ---
router.post('/seed', isAdmin, async (req, res) => {
  try {
    const { menuData, blogsData, heroBackdrop, menuBackdrop } = req.body;
    
    if (menuData) {
      await MenuCategory.deleteMany({});
      await MenuCategory.insertMany(menuData);
    }
    
    if (blogsData) {
      await Blog.deleteMany({});
      await Blog.insertMany(blogsData);
    }
    
    if (heroBackdrop) {
      await SiteSettings.findOneAndUpdate({ key: 'heroBackdrop' }, { value: heroBackdrop }, { upsert: true });
    }
    
    if (menuBackdrop) {
      await SiteSettings.findOneAndUpdate({ key: 'menuBackdrop' }, { value: menuBackdrop }, { upsert: true });
    }
    
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (err) {
    console.error('SEED ERROR:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// --- Mobile Auth ---
router.post('/auth/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = crypto.randomBytes(40).toString('hex');
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.json({ token, refreshToken, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.deletedAt) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.password) return res.status(401).json({ error: 'Please login with Google' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = require('crypto').randomBytes(40).toString('hex');
    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) user.refreshTokens.shift();
    await user.save();

    res.json({ token, refreshToken, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/verify-otp', authLimiter, async (req, res) => {
  try {
    const { firebaseToken } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const phone = decodedToken.phone_number;
    
    let isNewUser = false;
    let user = await User.findOne({ phone });
    if (!user) {
      isNewUser = true;
      user = new User({ name: 'User', email: `${phone}@placeholder.com`, phone, phoneVerified: true });
    } else {
      user.phoneVerified = true;
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = require('crypto').randomBytes(40).toString('hex');
    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) user.refreshTokens.shift();
    await user.save();

    res.json({ token, refreshToken, user: user.toSafeObject(), isNewUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = await User.findOne({ refreshTokens: refreshToken });
    if (!user || user.deletedAt) return res.status(401).json({ error: 'Invalid refresh token' });

    // Rotate
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    const newRefreshToken = require('crypto').randomBytes(40).toString('hex');
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/fcm-token', isAuthenticated, async (req, res) => {
  try {
    const { token, platform } = req.body;
    if (!req.user.fcmTokens) req.user.fcmTokens = [];
    const exists = req.user.fcmTokens.find(t => t.token === token);
    if (!exists) {
      req.user.fcmTokens.push({ token, platform, updatedAt: new Date() });
      if (req.user.fcmTokens.length > 5) req.user.fcmTokens.shift();
      await req.user.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/auth/fcm-token', isAuthenticated, async (req, res) => {
  try {
    const { token } = req.body;
    req.user.fcmTokens = req.user.fcmTokens.filter(t => t.token !== token);
    await req.user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Users ---
router.get('/users/me', isAuthenticated, (req, res) => {
  res.json(req.user.toSafeObject());
});

router.patch('/users/me', isAuthenticated, async (req, res) => {
  try {
    const { name, phone, profilePhoto } = req.body;
    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;
    if (profilePhoto) req.user.profilePhoto = profilePhoto;
    await req.user.save();
    res.json(req.user.toSafeObject());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/me/addresses', isAuthenticated, async (req, res) => {
  try {
    req.user.addresses.push(req.body);
    await req.user.save();
    res.json(req.user.toSafeObject());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/me/addresses/:idx', isAuthenticated, async (req, res) => {
  try {
    req.user.addresses.splice(req.params.idx, 1);
    await req.user.save();
    res.json(req.user.toSafeObject());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/me', isAuthenticated, async (req, res) => {
  try {
    req.user.deletedAt = new Date();
    req.user.fcmTokens = [];
    req.user.refreshTokens = [];
    await req.user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Payments ---
router.post('/payments/create-order', optionalAuth, async (req, res) => {
  try {
    const { amount, currency, orderId } = req.body;
    const order = await razorpayService.createOrder(amount, currency, orderId);
    res.json({ 
      razorpayOrderId: order.id, 
      amount: order.amount, 
      currency: order.currency, 
      key: process.env.RAZORPAY_KEY_ID 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/payments/verify', optionalAuth, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, internalOrderId } = req.body;
    const isValid = razorpayService.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    
    if (!isValid) return res.status(400).json({ error: 'Invalid signature' });
    
    const order = await Order.findById(internalOrderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.paymentStatus = 'paid';
    order.razorpayOrderId = razorpayOrderId;
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    await order.save();
    
    await pushService.sendOrderUpdate(order._id, 'Confirmed');

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/payments/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const isValid = razorpayService.verifyWebhookSignature(req.rawBody || JSON.stringify(req.body), signature);
    if (!isValid) return res.status(400).json({ error: 'Invalid signature' });
    
    if (req.body.event === 'payment.captured') {
      const paymentId = req.body.payload.payment.entity.id;
      const orderId = req.body.payload.payment.entity.order_id;
      const order = await Order.findOne({ razorpayOrderId: orderId });
      if (order) {
        order.paymentStatus = 'paid';
        await order.save();
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Enhanced Orders ---
router.get('/orders/:id', optionalAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ error: 'Not found' });
    
    if (order.user && (!req.user || (req.user._id.toString() !== order.user._id.toString() && req.user.role !== 'admin'))) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/orders/:id/reorder', isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Not found' });
    if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Unauthorized' });
    
    // clone items
    const items = order.items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity, image: i.image }));
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Notifications (Admin) ---
router.post('/notifications/send', isAdmin, async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;
    if (userId) {
      await pushService.sendToUser(userId, title, body, data);
    } else {
      await pushService.sendBroadcast(title, body, data);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
