import axios from 'axios';
import Settings from '../../../config/enviroment';

const API_URL = `${Settings.API_URL}/api/v1`;


class AuthRepository {
    async login(email, password) {
        try {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await axios.post(`${API_URL}/auth/login`, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async register(userData) {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, userData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async verifyEmail(email, code) {
        try {
            const response = await axios.post(`${API_URL}/auth/email/verify`, { email, code }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async resendVerification(email) {
        try {
            const response = await axios.post(`${API_URL}/auth/email/resend-verification`, { email }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async getProfile() {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get(`${API_URL}/auth/users/user`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async updateProfile(userData) {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.put(`${API_URL}/auth/users/user`, userData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    //  Funcion para actualizar el rol de un usuario por un administrador
    async updateRole(userId, roleData) {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.put(`${API_URL}/auth/users/${userId}/role`, roleData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }


    // Funcion para que un administrador pueda actualizar los datos de un usuario sin el rol
    async updateUser(userId, userData) {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.put(`${API_URL}/auth/users/${userId}`, userData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }




}

export default new AuthRepository();
