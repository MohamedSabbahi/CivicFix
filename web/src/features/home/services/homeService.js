import api from "../../../services/api";



export const getRecentReports = () =>
    api.get("/reports?limit=6&sort=date&order=desc");

export const getAllReports = () =>
    api.get("/reports?limit=20");

export const getMyReports = () =>
    api.get("/reports/my-reports");

