import axios from 'axios';
import Settings from '../../../config/enviroment';
import { APIResponse } from '../../../core/api/schemas/api_schema';

const API_URL = `${Settings.API_URL}/api/v1`;

class AdminRepository {
    async listUsers(page = 1, size = 20, role = null) {
        try {
            const token = localStorage.getItem('access_token');
            let url = `${API_URL}/auth/user-management/?page=${page}&size=${size}`;
            if (role) {
                url += `&role=${role}`;
            }
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Backend should return APIResponse wrapping PaginatedUsers
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async updateUserRole(userId, role) {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.put(
                `${API_URL}/auth/user-management/${userId}/role`,
                { role },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            // Backend should return APIResponse wrapping UserResponseSchema
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
}

export default new AdminRepository();
