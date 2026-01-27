import authRepository from '../repositories/auth_repository';

class AuthService {

    async login(email, password) {
        const response = await authRepository.login(email, password);
        // La respuesta estandarizada pone los datos en "data"
        const tokens = response.data;

        if (tokens && tokens.access_token) {
            localStorage.setItem('access_token', tokens.access_token);
            localStorage.setItem('refresh_token', tokens.refresh_token);
        }
        return response;
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

    async updateProfile(formData) {
        if (!(formData instanceof FormData)) {
            throw new Error("updateProfile requiere FormData");
        }

        return await authRepository.updateProfile(formData);
    }


    // New methods delegating to repository
    async refreshToken() {
        return await authRepository.refreshToken();
    }

    async getSessions() {
        return await authRepository.getSessions();
    }

    async revokeSession(sessionId) {
        return await authRepository.revokeSession(sessionId);
    }

    async revokeAllSessions() {
        return await authRepository.revokeAllSessions();
    }

    async enable2FA() {
        return await authRepository.enable2FA();
    }

    async verify2FA(code) {
        return await authRepository.verify2FA(code);
    }

    async disable2FA(password, code) {
        return await authRepository.disable2FA(password, code);
    }

    async login2FA(email, code, temp_token) {
        const data = await authRepository.login2FA(email, code, temp_token);
        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
        }
        return data;
    }

    async loginBackup(email, code, temp_token) {
        const data = await authRepository.loginBackup(email, code, temp_token);
        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
        }
        return data;
    }

    async logout() {
        try {
            await authRepository.logout();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
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
