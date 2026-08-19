const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., 'Order Placed', 'User Login', 'Menu Updated'
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, if done by a logged-in user
  details: { type: mongoose.Schema.Types.Mixed }, // Any additional context (e.g., order ID, changed items)
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
