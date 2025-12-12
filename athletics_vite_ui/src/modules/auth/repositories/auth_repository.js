import axios from 'axios';
import Settings from '../../../config/enviroment';
import ApiClient from '../../../core/api/apiClient';

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

    async register(data) {
        try {
            return await ApiClient.post('/auth/register', data);
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
}

export default new AuthRepository();
