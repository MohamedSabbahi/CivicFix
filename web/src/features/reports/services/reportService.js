// Report Service - Centralized API calls for reports feature
import api from "../../../services/api";

const reportService = {
  // Get all reports with optional filters
  getReports(params = {}) {
    return api.get("/reports", { params });
  },
  
  // Get a single report by ID
  getReportById(id) {
    return api.get(`/reports/${id}`);
  },
  
  // Get all categories
  getCategories() {
    return api.get("/reports/categories");
  },
  
  // Get reports near a location (for map)
  getNearbyReports(latitude, longitude, radius = 5, categoryId = null) {
    return api.get("/reports/nearby", {
      params: { latitude, longitude, radius, category_id: categoryId }
    });
  },
  
  // Get reports with distance from user location
  getReportsWithDistance(userLat, userLng, params = {}) {
    return api.get("/reports", {
      params: { user_lat: userLat, user_lng: userLng, ...params }
    });
  },
  
  // Create a new report
  createReport(formData) {
    return api.post("/reports", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  
  // Delete a report
  deleteReport(id) {
    return api.delete(`/reports/${id}`);
  },
  
  // Update a report
  updateReport(id, data) {
    return api.put(`/reports/${id}`, data);
  },
};

export default reportService;

