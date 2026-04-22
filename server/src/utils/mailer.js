const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendStatusEmail = async (deptEmail, report, links) => {
    try {
        const googleMapsUrl = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;

        const data = await resend.emails.send({
            from: 'CivicFix <onboarding@resend.dev>',
            to: deptEmail,
            subject: `CivicFix: New Report - ${report.title}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 600px; margin: 0 auto;">
                    
                    <div style="text-align: center; margin-bottom: 25px;">
                        <h1 style="color: #2563eb; font-size: 24px; margin: 0;">CivicFix</h1>
                        <p style="color: #888; font-size: 13px; margin-top: 4px;">Citizen Report Notification</p>
                    </div>

                    <h2 style="color: #333; font-size: 18px;">New Report: ${report.title}</h2>
                    <p style="color: #555; margin-bottom: 0;">${report.description || 'No description provided.'}</p>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">

                    ${report.photoUrl ? `
                    <div style="margin-bottom: 20px;">
                        <p style="font-weight: bold; color: #333; margin-bottom: 8px;">📷 Report Photo:</p>
                        <a 
                            href="${report.photoUrl}" 
                            target="_blank"
                            style="color: #2563eb; font-size: 14px; text-decoration: none;"
                        >
                            🔗 View full photo
                        </a>
                    </div>
                    ` : ''}

                    <div style="margin-bottom: 20px;">
                        <p style="font-weight: bold; color: #333; margin-bottom: 8px;">📍 Location:</p>
                        <a 
                            href="${googleMapsUrl}" 
                            target="_blank"
                            style="color: #2563eb; font-size: 14px; text-decoration: none;"
                        >
                            🗺️ Open in Google Maps (${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)})
                        </a>
                    </div>

                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">

                    <p style="font-weight: bold; color: #333;">Quick actions for the department:</p>
                    <div style="margin-top: 15px;">
                        <a href="${links.inProgress}" style="background: #2563eb; color: white; padding: 12px 18px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Start Work</a>
                        <a href="${links.resolved}" style="background: #059669; color: white; padding: 12px 18px; text-decoration: none; border-radius: 5px; margin-left: 10px; font-weight: bold; display: inline-block;">Mark as Resolved</a>
                        ${links.assign ? `
                        <a href="${links.assign}" style="background: #17a2b8; color: white; padding: 12px 18px; text-decoration: none; border-radius: 5px; margin-left: 10px; font-weight: bold; display: inline-block;">+ Add Department</a>
                        ` : ''}
                    </div>
                    <p style="font-size: 12px; color: #888; margin-top: 25px;">
                        * Clicking these buttons will automatically update the status in the system.
                    </p>

                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 11px; color: #aaa; text-align: center;">
                        This email was sent automatically by CivicFix. Please do not reply.
                    </p>

                </div>
            `,
        });

        console.log("✅ Email sent successfully via Resend!", data);
        return data;

    } catch (error) {
        console.error("❌ Resend API Error:", error);
        throw error;
    }
};

module.exports = { sendStatusEmail };