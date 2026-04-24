import axios from 'axios';

const API_BASE_URL = import.meta.env.MODE === 'development' 
    ? 'http://localhost:5000/api' 
    : 'https://zylron-ai-pro.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers['Authorization'] = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const authAPI = {
    notifyLogin: (userData) => api.post('/auth/notify-login', userData)
};

export default api;
