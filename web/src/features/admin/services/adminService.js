import axios from "axios";

const API = axios.create({
baseURL: "http://localhost:5001/api",
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const getOverviewStats    = ()              => API.get("/admin/stats/overview");
export const getAllReports        = ()              => API.get("/reports");
export const getReportById       = (id)            => API.get(`/reports/${id}`);
export const deleteReport        = (id)            => API.delete(`/reports/${id}`);
export const updateReportStatus  = (id, status)    => API.put(`/admin/reports/${id}/status`, { status });

//  Edit report
export const editReport          = (id, data)      => API.put(`/reports/${id}`, data);

//  Comments
export const getComments         = (id)            => API.get(`/reports/${id}/comments`);
export const addComment          = (id, text)      => API.post(`/reports/${id}/comments`, { content: text });
export const deleteComment       = (id, commentId) => API.delete(`/reports/${id}/comments/${commentId}`);

export const getDepartmentStats = () => API.get("/admin/stats/department");