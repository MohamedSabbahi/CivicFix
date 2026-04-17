const { Resend } = require('resend');

// Initialize Resend with the API key from Render
const resend = new Resend(process.env.RESEND_API_KEY);

const sendStatusEmail = async (deptEmail, report, links) => {
    try {
        const data = await resend.emails.send({
            from: 'CivicFix <onboarding@resend.dev>', // Resend's free testing email address
            to: deptEmail,
            subject: `CivicFix: New Report - ${report.title}`,
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
            `,
        });
        
        console.log("Email sent successfully via Resend!", data);
        return data;
        
    } catch (error) {
        console.error("Resend API Error:", error);
        throw error;
    }
};

module.exports = { sendStatusEmail };