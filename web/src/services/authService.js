import api from './api';

const authService = {
    // 1. Login function
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user)); 
        }
        return response.data;
    },

    //Logout function
    logout: () => {
        localStorage.removeItem('token'); // Clear token from localStorage
        localStorage.removeItem('user'); // Clear user info from localStorage
        window.location.href = '/login'; // Redirect to login page
    },

    // Helper to check if user is logged in 
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null; // Return user info or null
    },
};

export default authService;