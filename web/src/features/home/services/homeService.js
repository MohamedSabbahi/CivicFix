import api from "../../../services/api";

export const getPublicStats = () =>
    api.get("/api/admin/stats");

export const getRecentReports = () =>
    api.get("/api/reports?limit=6&sort=date&order=desc");
