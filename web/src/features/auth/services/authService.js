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
// Mock success for demo - replace with real API
        console.log(`📧 Forgot password request for: ${email}`);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network
        return { message: 'Reset code sent to your email! Check your inbox.' };
    },

    resetPassword: async (email, code, password) => {
        console.log(`🔐 Reset password: ${email}, code: ${code}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { message: 'Password reset successfully' };
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

