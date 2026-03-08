const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Authentication
      pass: process.env.EMAIL_PASS, // Authentication
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, 
    to: options.email,
    subject: options.subject,
    html: options.html, // Injects the CSS/HTML template
    text: options.message, // Fallback for basic email clients
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;