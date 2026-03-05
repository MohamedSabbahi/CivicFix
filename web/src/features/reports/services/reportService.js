import api from "../../../services/api";

const reportService = {
    getReports(params = {}) {
        return api.get("/reports", { params });
    },
    
    getReportById(id) {
        return api.get(`/reports/${id}`);
    },
    
    getCategories() {
        return api.get("/reports/categories");
    },
    
    // Get reports near a location (for map)
    getNearbyReports(latitude, longitude, radius = 5, category_id = null) {
        return api.get("/reports/nearby", {
            params: { latitude, longitude, radius, category_id }
        });
    },
    
    // Get all reports with geolocation data
    getReportsWithDistance(user_lat, user_lng, params = {}) {
        return api.get("/reports", {
            params: { user_lat, user_lng, ...params }
        });
    },
    
    createReport(formData) {
        return api.post("/reports", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
    
    deleteReport(id) {
        return api.delete(`/reports/${id}`);
    },
    
    updateReport(id, data) {
        return api.put(`/reports/${id}`, data);
    }
};

export default reportService;
