const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // MUST be Gmail App Password
  },
});

// Send email function
const sendStatusEmail = async (deptEmail, report, links) => {
  try {
    console.log("📧 Sending email to:", deptEmail);
    console.log("🔐 Sender:", process.env.EMAIL_USER);

    const mailOptions = {
      // ✅ FIX: use your real Gmail (important)
      from: `"CivicFix" <${process.env.EMAIL_USER}>`,

      to: deptEmail,

      subject: `CivicFix: New Report - ${report.title}`,

      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          
          <h2 style="color: #333;">New Report: ${report.title}</h2>
          
          <p style="color: #555;">
            ${report.description || "No description provided"}
          </p>

          <hr style="border: 0; border-top: 1px solid #eee;">

          <p style="font-weight: bold;">Quick actions for the department:</p>

          <div style="margin-top: 20px;">
            
            <a href="${links.inProgress}" 
               style="background: #2563eb; color: white; padding: 12px 18px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
               Start Work
            </a>

            <a href="${links.resolved}" 
               style="background: #059669; color: white; padding: 12px 18px; text-decoration: none; border-radius: 5px; margin-left: 10px; font-weight: bold; display: inline-block;">
               Mark as Resolved
            </a>

            <a href="${links.assign}" 
               style="background: #17a2b8; color: white; padding: 12px 18px; text-decoration: none; border-radius: 5px; margin-left: 10px; font-weight: bold; display: inline-block;">
               + Add Department
            </a>

          </div>

          <p style="font-size: 12px; color: #888; margin-top: 25px;">
            * Clicking these buttons will automatically update the status in the system.
          </p>

        </div>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully:", info.response);

    return info;

  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error; // important so controller can catch it
  }
};

module.exports = { sendStatusEmail };