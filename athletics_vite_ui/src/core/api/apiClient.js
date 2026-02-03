import axios from 'axios';
import Settings from '@config/enviroment';

const BASE_URL = Settings.API_URL + '/api/v1';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Importante para cookies
});

let accessToken = null;
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;


axiosInstance.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // No intentar refresh si el error es de login/register o ya estamos refrescando
        const isAuthEndpoint = originalRequest.url.includes('/auth/login') || 
                              originalRequest.url.includes('/auth/register') ||
                              originalRequest.url.includes('/auth/refresh');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            if (isRefreshing) {
                // Si ya está refrescando, encolar la petición
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Intentar refrescar el token (el backend leerá la cookie)
                const response = await axiosInstance.post('/auth/refresh', {});

                if (response.data.success && response.data.data.access_token) {
                    const newAccessToken = response.data.data.access_token;
                    setAccessToken(newAccessToken);
                    processQueue(null, newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // Si falla el refresh (token expirado o inválido), logout
                processQueue(refreshError, null);
                setAccessToken(null);
                // Solo redirigir si no estamos ya en login
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
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
