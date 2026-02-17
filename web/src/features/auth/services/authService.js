import api from '../../../services/api';
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const authService = {
    login: async (credentials) => {
        try {
            // Sanitize email to prevent matching errors
            const sanitizedData = {
                ...credentials,
                email: credentials.email.trim().toLowerCase()
            };

            const response = await api.post('/auth/login', sanitizedData);
            const { token, user } = response.data;
            
            if (token) {
                localStorage.setItem(TOKEN_KEY, token);
                localStorage.setItem(USER_KEY, JSON.stringify(user));
                localStorage.setItem('lastActivity', Date.now());
            }
            return response.data;
        } catch (error) {
            // Throw the exact message from the backend
            throw error.response?.data || { message: 'Login failed' };
        }
    },

    register: async (userData) => {
        try {
            const sanitizedData = {
                ...userData,
                email: userData.email.trim().toLowerCase()
            };
            const response = await api.post('/auth/register', sanitizedData);
            const { token, user } = response.data;
            if (token) {
                localStorage.setItem(TOKEN_KEY, token);
                localStorage.setItem(USER_KEY, JSON.stringify(user));
                localStorage.setItem('lastActivity', Date.now());
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Registration failed' };
        }
    },

    logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    getCurrentUser: () => {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY)
};

export default authService;