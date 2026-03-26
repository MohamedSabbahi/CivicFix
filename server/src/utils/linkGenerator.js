const generateMagicLinks = (report) => {
    const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 5001}`;
    const params = `id=${report.id}&secret=${report.accessSecret}`;

    return {
        inProgress: `${baseUrl}/api/reports/status-update?${params}&status=IN_PROGRESS`,
        resolved:   `${baseUrl}/api/reports/status-update?${params}&status=RESOLVED`,
        assign:     `${baseUrl}/api/reports/${report.id}/assign-department?secret=${report.accessSecret}` // ✅ ADD THIS
    };
};

module.exports = { generateMagicLinks };