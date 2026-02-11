const generateMagicLinks = (report) => {

const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 5001}`;

const params = `id=${report.id}&secret=${report.accessSecret}`;

return {
    inProgress: `${baseUrl}/api/reports/status-update?${params}&status=IN_PROGRESS`,
    resolved: `${baseUrl}/api/reports/status-update?${params}&status=RESOLVED`
};
};

module.exports = { generateMagicLinks };