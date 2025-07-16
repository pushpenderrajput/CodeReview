const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/sendOTP');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.requestOTP = async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    let user = await User.findOne({ email });
    if (!user) user = new User({ email });

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    try {
        await sendOTPEmail(email, otp);
        res.json({ message: 'OTP sent successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to send OTP.' });
    }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

  const user = await User.findOne({ email });
  if (!user || !user.otp || !user.otpExpiry) {
    return res.status(400).json({ message: 'OTP not requested.' });
  }

  const now = Date.now();
  if (user.otp !== otp || now > user.otpExpiry) {
    return res.status(401).json({ message: 'Invalid or expired OTP.' });
  }

  // OTP is valid — clear it
  user.otp = null;
  user.otpExpiry = null;

  // Optional: set default name if new
  if (!user.name) user.name = email.split('@')[0];

  await user.save();

  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    message: 'OTP verified successfully',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || null
    }
  });
};
