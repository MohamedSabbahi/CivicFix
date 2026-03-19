import api from '../../../services/api';

const profileService = {
  getMyReportsCount: async () => {
    const response = await api.get('/reports/my-reports');
    return response.data.results;
  }
  ,

  updateProfile: async (data) => {
    const response = await api.put('/auth/profileUpdate', data);
    return response.data;
  }
};

export default profileService;

