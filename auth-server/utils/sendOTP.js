const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendOTPEmail = async (to, otp) => {
  const mailOptions = {
    from: `"CodeReview Auth" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your OTP for CodeReview Login',
    html: `
      <div>
        <h3>Login OTP</h3>
        <p>Your One-Time Password is:</p>
        <h2>${otp}</h2>
        <p>It will expire in 5 minutes.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
