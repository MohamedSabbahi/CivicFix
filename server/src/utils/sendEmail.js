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
    text: options.message,
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;