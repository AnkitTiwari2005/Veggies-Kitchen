const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  image: String
});

const statusHistorySchema = new mongoose.Schema({
  status: String,
  timestamp: { type: Date, default: Date.now },
  note: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isGuest: { type: Boolean, default: true },
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  items: [orderItemSchema],
  subtotal: Number,
  taxes: Number,
  deliveryFee: Number,
  total: Number,
  status: {
    type: String,
    enum: ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  deliveryTime: { type: String, default: 'now' },
  instructions: String,
  paymentMethod: { type: String, enum: ['razorpay', 'cod'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  statusHistory: [statusHistorySchema],
  estimatedDelivery: Date,
  couponCode: String,
  discount: { type: Number, default: 0 }
}, { timestamps: true });

orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
