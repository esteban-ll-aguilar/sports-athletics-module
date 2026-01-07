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

    // Refresh Token
    async refreshToken() {
        try {
            const token = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');
            const response = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refreshToken }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // Logout
    async logout() {
        try {
            const token = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');
            const response = await axios.post(`${API_URL}/auth/logout`, { refresh_token: refreshToken }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // Sessions
    async getSessions() {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get(`${API_URL}/auth/sessions/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async revokeSession(sessionId) {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(`${API_URL}/auth/sessions/revoke`, { session_id: sessionId }, { // Assuming body param, check if query param needed
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: { session_id: sessionId } // Sending as query param just in case, common pattern
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async revokeAllSessions() {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(`${API_URL}/auth/sessions/revoke-all`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // Two-Factor Authentication
    async enable2FA() {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(`${API_URL}/auth/2fa/enable`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async verify2FA(code) {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(`${API_URL}/auth/2fa/verify`, { code }, {
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

    async disable2FA() {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(`${API_URL}/auth/2fa/disable`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async login2FA(email, code) { // Assuming email might be needed or handled via temp token. If just code, adjust. Based on "Login with 2Fa", usually needs context.
        try {
            const formData = new FormData();
            formData.append('username', email); // Assuming flow requires identifying user again or uses a temp token from first step
            formData.append('otp', code); // Standard 2FA login often sends 'otp' or 'code'

            // NOTE: The prompt says /api/v1/auth/2fa/login.
            // Often this endpoint expects { email, code } json or form data.
            // I will use JSON as it's cleaner for this specific endpoint unless form-data is strictly required like main login.
            const response = await axios.post(`${API_URL}/auth/2fa/login`, { email, code }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async loginBackup(email, backupCode) {
        try {
            const response = await axios.post(`${API_URL}/auth/2fa/login-backup`, { email, code: backupCode }, {
                headers: {
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
