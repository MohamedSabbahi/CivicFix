import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://civicfix-api-l5i5.onrender.com/api',
})
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
export const addComment = (id, text) => API.post(`/reports/${id}/comments`, { text });
export const deleteComment       = (id, commentId) => API.delete(`/reports/${id}/comments/${commentId}`);
//  départements
export const getDepartmentStats = () => API.get("/admin/stats/department");
export const getDepartments   = ()           => API.get("/admin/departments");
export const addDepartment    = (data)        => API.post("/admin/departments", data);
export const deleteDepartment = (id)          => API.delete(`/admin/departments/${id}`);
export const updateDepartment = (id, data)   => API.put(`/admin/departments/${id}`, data);
export const getReportsByPeriod = (period) => API.get(`/admin/reports/period?period=${period}`);
