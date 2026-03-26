const sendEmail = require('./sendEmail');

const sendStatusEmail = async (deptEmail, report, links) => {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border: 1px solid #e9ecef;">
    <h2 style="color: #2c3e50; margin-bottom: 20px;">New CivicFix Report: ${report.title}</h2>
    <p style="background: white; padding: 20px; border-left: 4px solid #007bff; margin-bottom: 30px;">
      <strong>Description:</strong><br>${report.description}
    </p>
    <div style="text-align: center;">
      <a href="${links.inProgress}" style="background: #28a745; color: white; padding: 12px 24px; margin: 0 10px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Start Work</a>
      <a href="${links.resolved}" style="background: #ffc107; color: #212529; padding: 12px 24px; margin: 0 10px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Mark as Resolved</a>
      <a href="${links.assign}" style="background: #17a2b8; color: white; padding: 12px 24px; margin: 0 10px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Add Department</a>
    </div>
  </div>
</body>
</html>
  `.trim();

  await sendEmail({
    email: deptEmail,
    subject: `CivicFix: New Report - ${report.title}`,

    html: htmlContent
  });
};

module.exports = sendStatusEmail;

