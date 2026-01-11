import ApiClient from "@core/api/apiClient";

const PasswordResetService = {
    // Step 1: Request Code
    requestReset: async (email) => {
        return await ApiClient.post('/auth/password-reset/request', { email });
    },

    // Step 2: Validate Code (Optional, but good UX to verify before showing password fields)
    validateCode: async (email, code) => {
        return await ApiClient.post('/auth/password-reset/validate-code', { email, code });
    },

    // Step 3: Complete Reset
    completeReset: async (email, code, newPassword) => {
        return await ApiClient.post('/auth/password-reset/reset', {
            email,
            code,
            new_password: newPassword
        });
    }
};

export default PasswordResetService;
