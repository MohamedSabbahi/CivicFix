import api from "../../../services/api";

const reportService = {
  getReports(params = {}) {
    return api.get("/reports", { params });
  },

  getMyReports() {
    return api.get("/reports/my-reports");
  },

  getReportDepartments(id) {
    return api.get(`/reports/${id}/departments`);
  },
  
  getReportById(id) {
    return api.get(`/reports/${id}`);
  },  
  getCategories() {
    return api.get("/reports/categories");
  },
  
  getNearbyReports(latitude, longitude, radius = 5, categoryId = null) {
    return api.get("/reports/nearby", {
      params: { latitude, longitude, radius, category_id: categoryId }
    });
  },
  
  getReportsWithDistance(userLat, userLng, params = {}) {
    return api.get("/reports", {
      params: { user_lat: userLat, user_lng: userLng, ...params }
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
  },
  
  getReportComments(reportId) {
    return api.get(`/reports/${reportId}/comments`);
  },
  
  addComment(reportId, data) {
    return api.post(`/reports/${reportId}/comments`, data);
  },
  
  deleteComment(commentId) {
    return api.delete(`/comments/${commentId}`);
  },
};

export default reportService;

