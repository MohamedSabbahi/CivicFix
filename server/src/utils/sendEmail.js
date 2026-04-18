// server/src/utils/sendEmail.js
const { Resend } = require('resend');

// Make sure RESEND_API_KEY is in your Render Environment Variables
const resend = new Resend(process.env.RESEND_API_KEY); 

const sendEmail = async (options) => {
  try {
    const data = await resend.emails.send({
      from: 'CivicFix <onboarding@resend.dev>', // Update this if you have a verified domain
      to: options.email,
      subject: options.subject,
      html: options.html,
    });
    
    console.log("Email sent successfully via Resend:", data);
    return data;
  } catch (error) {
    console.error("Resend Error:", error);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;