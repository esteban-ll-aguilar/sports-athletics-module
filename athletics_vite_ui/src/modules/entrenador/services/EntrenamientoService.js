import ApiClient from '@core/api/apiClient';

const ENDPOINT = '/entrenador/entrenamientos';

const EntrenamientoService = {
    getAll: async () => {
        const response = await ApiClient.get(ENDPOINT + '/');
        return response?.items || response || [];
    },

    getById: async (id) => {
        const response = await ApiClient.get(`${ENDPOINT}/${id}`);
        return response?.data || response;
    },

    create: async (data) => {
        const response = await ApiClient.post(ENDPOINT + '/', data);
        return response?.data || response;
    },

    update: async (id, data) => {
        const response = await ApiClient.put(`${ENDPOINT}/${id}`, data);
        return response?.data || response;
    },

    delete: async (id) => {
        return await ApiClient.delete(`${ENDPOINT}/${id}`);
    }
};

export default EntrenamientoService;
