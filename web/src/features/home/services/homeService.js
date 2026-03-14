import api from "../../../services/api";

export const getPublicStats = () =>
    api.get("/admin/stats");

export const getRecentReports = () =>
    api.get("/reports?limit=6&sort=date&order=desc");

export const getMyReports = () =>
    api.get("/reports/my-reports");
