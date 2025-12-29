import axios from 'axios';
import Settings from '@config/enviroment';

const BASE_URL = Settings.API_URL + '/api/v1';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle specific error codes (e.g., 401 for logout)
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

class ApiClient {
    static async get(url, params = {}) {
        const response = await axiosInstance.get(url, { params });
        return response.data;
    }

    static async post(url, data = {}, config = {}) {
        const response = await axiosInstance.post(url, data, config);
        return response.data;
    }

    static async put(url, data = {}, config = {}) {
        const response = await axiosInstance.put(url, data, config);
        return response.data;
    }

    static async delete(url, config = {}) {
        const response = await axiosInstance.delete(url, config);
        return response.data;
    }

    static async patch(url, data = {}, config = {}) {
        const response = await axiosInstance.patch(url, data, config);
        return response.data;
    }
}

export default ApiClient;
