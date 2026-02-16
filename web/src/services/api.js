import axios from 'axios';

// 1.Create the instance with a Base URL
const baseURL = import.meta.env.VITE_API_URL;
const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Request Interceptor: Automatically add JWT Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Assuming you store the token in localStorage
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Response Interceptor: Handle Errors Globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error('Token expired or unauthorized. Logging out ...');
            localStorage.removeItem('token'); // Clear token on unauthorized
            window.location.href = '/login'; // Redirect to login page
        }
        return Promise.reject(error);
    }
);



export default api;
