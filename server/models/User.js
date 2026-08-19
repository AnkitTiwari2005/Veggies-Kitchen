const mongoose = require('mongoose');

const fcmTokenSchema = new mongoose.Schema({
  token: String,
  platform: String,
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  password: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: { type: String, sparse: true },
  phoneVerified: { type: Boolean, default: false },
  addresses: [{
    street: String,
    city: String,
    state: String,
    pincode: String
  }],
  fcmTokens: [fcmTokenSchema],
  refreshTokens: [{ type: String }],
  profilePhoto: { type: String },
  loyaltyPoints: { type: Number, default: 0 },
  deletedAt: { type: Date }
}, { timestamps: true });

userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
