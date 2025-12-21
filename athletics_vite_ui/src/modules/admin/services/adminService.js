import apiClient from '@core/api/apiClient';

class AdminService {
    async getUsers(page = 1, limit = 20) {
        const response = await apiClient.get(`/admin/users/users/?page=${page}&size=${limit}`);
        return response;
    }

    async updateUserRole(userId, role) {
        const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
        return response;
    }
}

export default new AdminService();
