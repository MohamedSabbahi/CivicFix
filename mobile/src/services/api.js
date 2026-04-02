import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const BASE_URL = 'https://civicfix-api-l5i5.onrender.com';

const API_URL = `${BASE_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const sendChatMessage = async (message) => {
  try {
    // This hits your Node.js backend, which securely forwards it to the Python AI
    const response = await api.post('/chatbot/chat', { message });
    return response.data;
  } catch (error) {
    console.error("Chatbot API Error:", error);
    throw error;
  }
};

export default api;