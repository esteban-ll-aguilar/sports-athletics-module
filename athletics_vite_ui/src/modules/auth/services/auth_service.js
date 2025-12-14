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

    async register(data) {
        try {
            const response = await authRepository.register(data);
            return response;
        } catch (error) {
            // Propagar el error con formato adecuado
            if (error.detail) {
                throw new Error(error.detail);
            }
            throw error;
        }
    }

    async getRoles() {
        try {
            return await authRepository.getRoles();
        } catch (error) {
            console.error('Error fetching roles:', error);
            throw error;
        }
    }

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Optional: Call backend logout endpoint if needed
    }

    isAuthenticated() {
        return !!localStorage.getItem('access_token');
    }

    getToken() {
        return localStorage.getItem('access_token');
    }
}

export default new AuthService();
