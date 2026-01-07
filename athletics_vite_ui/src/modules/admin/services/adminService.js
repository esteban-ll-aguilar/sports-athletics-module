import apiClient from '@core/api/apiClient';

class AdminService {
    async getUsers(page = 1, limit = 20) {
        const response = await apiClient.get(`/auth/users/users/?page=${page}&size=${limit}`);
        return response;
    }

    async updateUserRole(userId, role) {
        const response = await apiClient.put(`/auth/users/${userId}/role`, { role });
        return response;
    }

    async getJwtRotationInfo() {
        const response = await apiClient.get('/admin/jwt/rotation-info');
        return response;
    }

    async rotateJwtSecret() {
        const response = await apiClient.post('/admin/jwt/rotate-secret');
        return response;
    }

}

export default new AdminService();
