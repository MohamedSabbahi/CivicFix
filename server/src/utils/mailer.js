const axios = require('axios');

const buildEmailHtml = (report, links) => {
    const lat = report.latitude;
    const lng = report.longitude;
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

    const locationBlock = (lat && lng) ? `
        <div style="margin: 24px 0;">
            <h3 style="color:#1e293b; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin:0 0 10px;">
                📍 Location
            </h3>
            <p style="color:#475569; margin:0 0 8px; font-size:14px;">
                Coordinates: <strong>${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}</strong>
            </p>
            <a href="${mapsUrl}" style="display:inline-block; background:#0f172a; color:#60a5fa; padding:8px 16px; border-radius:6px; font-size:13px; text-decoration:none; font-weight:600; border:1px solid #1e3a5f;">
                🗺️ Open in Google Maps
            </a>
        </div>
    ` : '';

    const photoBlock = report.photoUrl ? `
        <div style="margin: 24px 0;">
            <h3 style="color:#1e293b; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin:0 0 10px;">
                📸 Photo Evidence
            </h3>
            <img src="${report.photoUrl}" alt="Issue photo" style="width:100%; max-height:300px; object-fit:cover; border-radius:8px; border:1px solid #e2e8f0;" />
        </div>
    ` : '';

    return `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#f1f5f9; font-family:'Segoe UI', Arial, sans-serif;">
  <div style="max-width:600px; margin:32px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.08);">

    <div style="background:#0f172a; padding:28px 32px;">
      <p style="margin:0; color:#60a5fa; font-size:13px; font-weight:700; letter-spacing:2px; text-transform:uppercase;">CivicFix Platform</p>
      <h1 style="margin:6px 0 0; color:#ffffff; font-size:22px; font-weight:700;">New Issue Assigned to Your Department</h1>
    </div>

    <div style="padding:32px;">
      <h2 style="color:#1e293b; font-size:18px; margin:0 0 8px;">${report.title}</h2>
      <p style="color:#64748b; font-size:14px; line-height:1.6; margin:0 0 4px;">
        <strong>Category:</strong> ${report.category?.name || 'N/A'}
      </p>
      <p style="color:#475569; font-size:15px; line-height:1.7; margin:16px 0 0; padding:16px; background:#f8fafc; border-left:4px solid #3b82f6; border-radius:0 8px 8px 0;">
        ${report.description || 'No description provided.'}
      </p>

      <hr style="border:0; border-top:1px solid #e2e8f0; margin:28px 0;" />

      ${locationBlock}
      ${photoBlock}

      <hr style="border:0; border-top:1px solid #e2e8f0; margin:28px 0;" />

      <h3 style="color:#1e293b; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin:0 0 16px;">
        ⚡ Quick Actions
      </h3>
      <div>
        <a href="${links.inProgress}" style="background:#2563eb; color:white; padding:12px 20px; text-decoration:none; border-radius:8px; font-weight:700; font-size:14px; display:inline-block;">
          🔧 Start Work
        </a>
        <a href="${links.resolved}" style="background:#059669; color:white; padding:12px 20px; text-decoration:none; border-radius:8px; font-weight:700; font-size:14px; display:inline-block; margin-left:8px;">
          ✅ Mark as Resolved
        </a>
        ${links.assign ? `
        <a href="${links.assign}" style="background:#7c3aed; color:white; padding:12px 20px; text-decoration:none; border-radius:8px; font-weight:700; font-size:14px; display:inline-block; margin-left:8px;">
          ➕ Add Department
        </a>` : ''}
      </div>
      <p style="font-size:12px; color:#94a3b8; margin-top:16px;">
        Clicking these buttons updates the report status in real time. Use "Add Department" to request support from another department.
      </p>
    </div>

    <div style="background:#f8fafc; padding:20px 32px; border-top:1px solid #e2e8f0;">
      <p style="margin:0; color:#94a3b8; font-size:12px; text-align:center;">
        CivicFix — Tétouan Municipal Platform &nbsp;|&nbsp; Report ID #${report.id}
      </p>
    </div>

  </div>
</body>
</html>`;
};

const sendStatusEmail = async (deptEmail, report, links) => {
    if (!process.env.BREVO_API_KEY) {
        throw new Error('Email service not configured (BREVO_API_KEY missing)');
    }

    const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
            sender: { name: 'CivicFix', email: process.env.BREVO_SENDER },
            to: [{ email: deptEmail }],
            subject: `[CivicFix] New Report Assigned: ${report.title}`,
            htmlContent: buildEmailHtml(report, links),
        },
        {
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json',
            },
            timeout: 15000,
        }
    );

    console.log('✅ Dept email sent via Brevo API →', deptEmail, response.data);
    return response.data;
};

module.exports = { sendStatusEmail };
