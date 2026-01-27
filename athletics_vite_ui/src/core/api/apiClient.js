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

        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
            originalRequest._retry = true;

            try {
                // Intentar refrescar el token (el backend leerá la cookie)
                const response = await axiosInstance.post('/auth/refresh', {});

                if (response.data.success && response.data.data.access_token) {
                    const newAccessToken = response.data.data.access_token;
                    setAccessToken(newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // Si falla el refresh (token expirado o inválido), logout
                setAccessToken(null);
                window.location.href = '/login'; // O usar history.push si se dispone de router fuera de componente
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
