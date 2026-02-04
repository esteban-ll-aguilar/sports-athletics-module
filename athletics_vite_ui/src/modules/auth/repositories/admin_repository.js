import ApiClient from '../../../core/api/apiClient';
import Settings from '../../../config/enviroment';
import { APIResponse } from '../../../core/api/schemas/api_schema';

const API_URL = `${Settings.API_URL}/api/v1`;

class AdminRepository {
    async listUsers(page = 1, size = 20, role = null) {
        try {
            let url = `${API_URL}/auth/user-management/?page=${page}&size=${size}`;
            if (role) {
                url += `&role=${role}`;
            }
            const responseData = await ApiClient.get(url);
            // Backend should return APIResponse wrapping PaginatedUsers
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async updateUserRole(userId, role) {
        try {
            const responseData = await ApiClient.put(
                `${API_URL}/auth/user-management/${userId}/role`,
                { role }
            );
            // Backend should return APIResponse wrapping UserResponseSchema
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
}

export default new AdminRepository();
