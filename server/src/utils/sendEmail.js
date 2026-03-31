const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (options) => {
  try {
    const message = {
      from: `"CivicFix" <${process.env.EMAIL_USER}>`, 
      to: options.email,
      subject: options.subject,
      html: options.html,
      text: options.message || '',
    };

    const info = await transporter.sendMail(message);

    console.log("📧 Email sent:", info.response);

  } catch (error) {
    console.error("❌ Email failed:", error);
    throw error;
  }
};

module.exports = sendEmail;