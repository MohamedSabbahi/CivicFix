import axios from "axios";

const API = axios.create({
    // ✅ FIX: Utilise variable d'environnement au lieu de localhost
    baseURL: import.meta.env.VITE_API_URL || 'https://civicfix-api-l5i5.onrender.com/api',
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Stats
export const getOverviewStats    = ()           => API.get("/admin/stats/overview");
export const getDepartmentStats  = ()           => API.get("/admin/stats/department");

// Reports
export const getAllReports        = ()           => API.get("/reports");
export const getReportById        = (id)         => API.get(`/reports/${id}`);
export const deleteReport         = (id)         => API.delete(`/reports/${id}`);

// ✅ FIX: Route correcte /reports/:id/status au lieu de /admin/reports/:id/status
export const updateReportStatus   = (id, status) => API.put(`/reports/${id}/status`, { status });

// Edit report
export const editReport           = (id, data)   => API.put(`/reports/${id}`, data);

// Comments
export const getComments          = (id)         => API.get(`/reports/${id}/comments`);
// ✅ FIX: Champ "text" au lieu de "content"
export const addComment           = (id, text)   => API.post(`/reports/${id}/comments`, { text });
export const deleteComment        = (id, commentId) => API.delete(`/reports/${id}/comments/${commentId}`);

// Departments
export const getDepartments       = ()           => API.get("/admin/departments");
export const addDepartment        = (data)       => API.post("/admin/departments", data);
export const deleteDepartment     = (id)         => API.delete(`/admin/departments/${id}`);
export const updateDepartment     = (id, data)   => API.put(`/admin/departments/${id}`, data);
export const getDepartmentStats_  = ()           => API.get("/admin/stats/department");

// ✅ FIX: Route correcte /admin/civic-issues/period
export const getReportsByPeriod   = (period)     => API.get(`/admin/civic-issues/period?period=${period}`);