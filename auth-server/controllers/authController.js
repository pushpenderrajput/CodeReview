const User = require('../models/User');
const { sendOTPEmail } = require('../utils/sendOTP');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.requestOTP = async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required.' });
    console.log("Email received:", email);

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
