const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  mobile: { type: String, unique: true, sparse: true },
  name: String,
  avatarUrl: String,
  otp: String,
  otpExpiry: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
