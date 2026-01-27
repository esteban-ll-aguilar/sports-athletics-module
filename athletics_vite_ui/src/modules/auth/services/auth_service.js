import authRepository from '../repositories/auth_repository';
import { jwtDecode } from 'jwt-decode';
import { getAccessToken, setAccessToken } from '../../../core/api/apiClient';

class AuthService {

    async login(email, password) {
        const data = await authRepository.login(email, password);
        // data is APIResponse. authRepository handles token storage.
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

    async updateProfile(formData) {
        if (!(formData instanceof FormData)) {
            throw new Error("updateProfile requiere FormData");
        }

        return await authRepository.updateProfile(formData);
    }


    // Flag to manage concurrent refresh requests
    _refreshPromise = null;

    // New methods delegating to repository
    async refreshToken() {
        if (this._refreshPromise) {
            return this._refreshPromise;
        }

        this._refreshPromise = (async () => {
            try {
                const result = await authRepository.refreshToken();
                return result;
            } finally {
                this._refreshPromise = null;
            }
        })();

        return this._refreshPromise;
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
        const responseCtx = await authRepository.login2FA(email, code, temp_token);
        // authRepository handles token setAccessToken via _saveTokens
        return responseCtx;
    }

    async loginBackup(email, code, temp_token) {
        const responseCtx = await authRepository.loginBackup(email, code, temp_token);
        // authRepository handles token setAccessToken via _saveTokens
        return responseCtx;
    }

    async logout() {
        try {
            await authRepository.logout();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setAccessToken(null);
        }
    }

    isAuthenticated() {
        const token = getAccessToken();
        if (!token) return false;

        try {
            const payload = jwtDecode(token);
            const isExpired = payload.exp * 1000 < Date.now();

            if (isExpired) {
                // If expired in memory, we assume client interceptor will refresh or has failed.
                // But specifically for UI checking "is logged in", validation fails.
                return false;
            }

            return true;
        } catch (error) {
            console.error("Token validation failed:", error);
            return false;
        }
    }

    // New method to initialize app state
    async checkAuth() {
        if (this.isAuthenticated()) return true;
        try {
            // Try silent refresh (uses deduplication logic in refreshToken)
            await this.refreshToken();
            return !!getAccessToken(); // Check if access token was set by repository
        } catch (e) {
            return false;
        }
    }

    getToken() {
        return getAccessToken();
    }
}

export default new AuthService();

