import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = '192.168.1.109:5001/api';

const api = axios.create({
    baseURL: `http://${API_URL}`,
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;