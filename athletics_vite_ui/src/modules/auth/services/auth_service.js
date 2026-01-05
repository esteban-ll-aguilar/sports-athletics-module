import authRepository from '../repositories/auth_repository';

class AuthService {

    async login(email, password) {
        const data = await authRepository.login(email, password);
        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
        }
        return data;
    }

    async register(userData) {
        return await authRepository.register(userData);
    }

    async verifyEmail(email, code) {
        return await authRepository.verifyEmail(email, code);
    }

    async resendVerification(email) {
        return await authRepository.resendVerification(email);
    }

    async updateUser(userId, userData) {
        return await authRepository.updateUser(userId, userData);
    }

    async updateRole(userId, roleData) {
        return await authRepository.updateRole(userId, roleData);
    }

    async getProfile() {
        return await authRepository.getProfile();
    }

    async updateProfile(userData) {
        return await authRepository.updateProfile(userData);
    }

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    isAuthenticated() {
        const token = localStorage.getItem('access_token');
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();

            if (isExpired) {
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            this.logout();
            return false;
        }
    }

    getToken() {
        return localStorage.getItem('access_token');
    }
}

export default new AuthService();
