import ApiClient from '@core/api/apiClient';

const ExternalService = {
    // PUT /api/v1/external/users/token
    updateUserToken: async (token) => {
        return await ApiClient.put('/external/users/token', { token });
    }
};

export default ExternalService;
