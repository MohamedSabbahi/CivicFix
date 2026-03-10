import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, 
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Session Expiry
api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }

);

export default api;

