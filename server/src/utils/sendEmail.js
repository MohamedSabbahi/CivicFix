const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,        // Required by Render to bypass outbound port blocking
    secure: true,     // Must be true when using port 465
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, 
    to: options.email,
    subject: options.subject,
    text: options.message, 
    html: options.html,    
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;