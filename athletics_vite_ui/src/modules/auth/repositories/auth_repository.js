import ApiClient, { setAccessToken } from '../../../core/api/apiClient';
import Settings from '../../../config/enviroment';
import { APIResponse } from '../../../core/api/schemas/api_schema';

const API_REF = `/auth`;


class AuthRepository {
    // Helper to save tokens
    _saveTokens(data) {
        if (data.access_token) {
            setAccessToken(data.access_token);
        }
        // Refresh token is handled by HttpOnly cookie
    }

    async login(email, password) {
        try {
            // Using JSON instead of FormData
            const responseData = await ApiClient.post(`${API_REF}/login`, {
                username: email,
                password: password
            });
            const apiResponse = APIResponse.fromJson(responseData);

            if (apiResponse.success && apiResponse.data) {
                // Check if we received tokens (successful login) vs temp_token (2FA required)
                if (apiResponse.data.access_token) {
                    this._saveTokens(apiResponse.data);
                }
            }

            return apiResponse;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async register(userData) {
        try {
            const responseData = await ApiClient.post(`${API_REF}/register`, userData);
            return APIResponse.fromJson(responseData);
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async verifyEmail(email, code) {
        try {
            const responseData = await ApiClient.post(`${API_REF}/email/verify`, { email, code });
            return APIResponse.fromJson(responseData);
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async resendVerification(email) {
        try {
            const responseData = await ApiClient.post(`${API_REF}/email/resend-verification`, { email });
            return APIResponse.fromJson(responseData);
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async getProfile() {
        try {
            // ApiClient handles authorization header automatically via interceptor
            const responseData = await ApiClient.get(`${API_REF}/users/me`);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async updateProfile(formData) {
        // ApiClient handles authorization
        // Note: For FormData, axios usually handles Content-Type automatically.
        // ApiClient.put uses axiosInstance.put
        const responseData = await ApiClient.put(
            `${API_REF}/users/me`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" }
            }
        );

        return responseData;
    }

    //  Funcion para actualizar el rol de un usuario por un administrador
    async updateRole(userId, roleData) {
        try {
            const responseData = await ApiClient.put(`${API_REF}/users/${userId}/role`, roleData);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }


    // Funcion para que un administrador pueda actualizar los datos de un usuario sin el rol
    async updateUser(userId, userData) {
        try {
            const responseData = await ApiClient.put(`${API_REF}/users/${userId}`, userData);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // Refresh Token
    async refreshToken() {
        try {
            // We don't send refresh_token in body anymore, browser sends cookie.
            const responseData = await ApiClient.post(`${API_REF}/refresh`, {});

            const apiResponse = APIResponse.fromJson(responseData);
            if (apiResponse.success && apiResponse.data) {
                this._saveTokens(apiResponse.data);
            }
            return apiResponse;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // Logout
    async logout() {
        try {
            const responseData = await ApiClient.post(`${API_REF}/logout`, {});
            setAccessToken(null); // Clear memory token
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // Sessions
    async getSessions() {
        try {
            const responseData = await ApiClient.get(`${API_REF}/sessions/`);
            return APIResponse.fromJson(responseData); // Adjust based on return type needed, checking other methods
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async revokeSession(sessionId) {
        try {
            const responseData = await ApiClient.post(`${API_REF}/sessions/revoke`, { session_id: sessionId }, { // Assuming body param, check if query param needed
                params: { session_id: sessionId } // Sending as query param just in case, common pattern
            });
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async revokeAllSessions() {
        try {
            const responseData = await ApiClient.post(`${API_REF}/sessions/revoke-all`, {});
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // Two-Factor Authentication
    async enable2FA() {
        try {
            const responseData = await ApiClient.post(`${API_REF}/2fa/enable`, {});
            // Backend returns APIResponse[Enable2FAResponse]
            // So response.data = {success, message, data: {secret, qr_code, backup_codes, message}}
            if (responseData.success && responseData.data) {
                return responseData.data; // Return the Enable2FAResponse
            }
            return responseData; // Return whole APIResponse for errors
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async verify2FA(code) {
        try {
            const responseData = await ApiClient.post(`${API_REF}/2fa/verify`, { code });

            // Backend returns APIResponse[MessageResponse]
            if (responseData.success && responseData.data) {
                return responseData.data; // Return MessageResponse {message}
            }
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async disable2FA(password, code) {
        try {
            const responseData = await ApiClient.post(`${API_REF}/2fa/disable`, { password, code });

            // Backend returns APIResponse[MessageResponse]
            if (responseData.success && responseData.data) {
                return responseData.data;
            }
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async login2FA(email, code, temp_token) {
        try {
            // Note: Backend expects Login2FARequest { email, code, temp_token }
            const responseData = await ApiClient.post(`${API_REF}/2fa/login`, { email, code, temp_token });

            const apiResponse = APIResponse.fromJson(responseData);
            if (apiResponse.success && apiResponse.data) {
                this._saveTokens(apiResponse.data);
            }
            return apiResponse;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async loginBackup(email, backupCode, temp_token) {
        try {
            // Note: Backend expects LoginBackupCodeRequest { email, backup_code, temp_token }
            const responseData = await ApiClient.post(`${API_REF}/2fa/login-backup`, { email, backup_code: backupCode, temp_token });

            const apiResponse = APIResponse.fromJson(responseData);
            if (apiResponse.success && apiResponse.data) {
                this._saveTokens(apiResponse.data);
            }
            return apiResponse;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
}



export default new AuthRepository();
