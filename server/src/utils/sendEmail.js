const { Resend } = require('resend');

// Initialize Resend with the API key from your Render environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  try {
    const data = await resend.emails.send({
      from: 'CivicFix <onboarding@resend.dev>', 
      to: options.email,
      subject: options.subject,
      text: options.message, 
      html: options.html,    
    });

    console.log("Password reset email sent successfully!", data);
    return data;

  } catch (error) {
    console.error("Resend API Error (Password Reset):", error);
    throw error;
  }
};

module.exports = sendEmail;