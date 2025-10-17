const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationCode = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #111827; text-align: center;">Verify Your Email</h2>
        <p style="color: #4B5563; font-size: 16px;">Thank you for registering! Please use the verification code below to complete your registration:</p>
        <div style="background-color: #F3F4F6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${code}</span>
        </div>
        <p style="color: #6B7280; font-size: 14px;">This code will expire in 5 minutes.</p>
        <p style="color: #6B7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendVerificationCode };
