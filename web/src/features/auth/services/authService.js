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
            // Handle validation error array from backend
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
            // Handle validation error array from backend
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                const firstError = error.response.data.errors[0]?.msg;
                throw new Error(firstError || 'Registration failed');
            }
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
            throw new Error(errorMessage);
        }
    },

// FORGOT PASSWORD
forgotPassword: async (email) => {
  try {
    const sanitizedEmail = email.trim().toLowerCase();
    const response = await api.post(
      '/auth/forgotPassword',
      { email: sanitizedEmail }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to send reset link'
    );
  }
},

// RESET PASSWORD
resetPassword: async (token, password) => {
  try {
    const response = await api.put(
      `/auth/resetPassword/${token}`,
      { password }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Password reset failed'
    );
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