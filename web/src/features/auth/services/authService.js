import api from '../../../services/api';
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const authService = {
    login: async (credentials) => {
        try {
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
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                const firstError = error.response.data.errors[0]?.msg;
                throw new Error(firstError || 'Login failed');
            }
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            throw new Error(errorMessage);
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
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                const firstError = error.response.data.errors[0]?.msg;
                throw new Error(firstError || 'Registration failed');
            }
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
            throw new Error(errorMessage);
        }
    },






    forgotPassword: async (email) => {
        try {
            const response = await api.post('/auth/forgotPassword', { email: email.trim().toLowerCase() });
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || 
                       (error.response?.data?.errors && Array.isArray(error.response.data.errors) ? error.response.data.errors[0]?.msg : null) || 
                       error.message || 'Forgot password failed';
            throw new Error(msg);
        }
    },

    verifyResetCode: async (code) => {
        try {
            const response = await api.post('/auth/verifyResetCode', { code });
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Code verification failed';
            throw new Error(msg);
        }
    },

    resetPassword: async (code, password) => {
        try {
            const response = await api.put(`/auth/resetPassword/${code}`, { password });
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || 
                       (error.response?.data?.errors && Array.isArray(error.response.data.errors) ? error.response.data.errors[0]?.msg : null) || 
                       error.message || 'Reset password failed';
            throw new Error(msg);
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

