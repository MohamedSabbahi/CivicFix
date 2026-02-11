const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
service: 'gmail', 
auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
},
});

const sendStatusEmail = async (deptEmail, report, links) => {
const mailOptions = {
    from: '"CivicFix" <no-reply@civicfix.com>',
    to: deptEmail,
      subject: `CivicFix: New Report - ${report.title}`, // Subject translated
    html: `
<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #333;">New Report: ${report.title}</h2>
        <p style="color: #555;">${report.description}</p>
        <hr style="border: 0; border-top: 1px solid #eee;">
        <p style="font-weight: bold;">Quick actions for the department:</p>
        <div style="margin-top: 20px;">
        <a href="${links.inProgress}" style="background: #2563eb; color: white; padding: 12px 18px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Start Work</a>
        <a href="${links.resolved}" style="background: #059669; color: white; padding: 12px 18px; text-decoration: none; border-radius: 5px; margin-left: 10px; font-weight: bold; display: inline-block;">Mark as Resolved</a>
        </div>
        <p style="font-size: 12px; color: #888; margin-top: 25px;">
        * Clicking these buttons will automatically update the status in the system.
        </p>
</div>
`,};

return transporter.sendMail(mailOptions);
};

module.exports = { sendStatusEmail };
