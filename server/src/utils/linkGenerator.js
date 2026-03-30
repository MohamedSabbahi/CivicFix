const generateMagicLinks = (report , departmentId) => {
    const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 5001}`;
    const params = `id=${report.id}&secret=${report.accessSecret}&departmentId=${departmentId}`;

    return {
    startWork: `${baseUrl}/api/reports/status-update?${params}&status=IN_PROGRESS`,
    resolve: `${baseUrl}/api/reports/status-update?${params}&status=RESOLVED`,
    assign: `${baseUrl}/api/reports/${report.id}/assign-department?departmentId=${departmentId}&secret=${report.accessSecret}`

};
};

module.exports = { generateMagicLinks };
