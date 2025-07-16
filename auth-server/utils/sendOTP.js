const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendOTPEmail = async (to, otp) => {
    const username = to.split('@')[0];

    const mailOptions = {
        from: `"CodeReview" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Your OTP for CodeReview Login',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome back, ${username}!</h2>
        <h3 style="color: #444;">Login OTP</h3>
        <p>Your One-Time Password is:</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <div style="
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            text-align: center;
            margin-bottom: 10px;
            user-select: all;
          ">${otp}</div>
          
          <p style="text-align: center; color: #666; font-size: 14px;">
           
          </p>
        </div>
        
        <p style="color: #777; font-size: 14px;">It will expire in 5 minutes.</p>
      </div>
    `
    };

    await transporter.sendMail(mailOptions);
};