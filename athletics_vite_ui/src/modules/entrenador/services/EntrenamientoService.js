import ApiClient from '@core/api/apiClient';

const ENDPOINT = '/entrenador/entrenamientos';

const EntrenamientoService = {
    getAll: async () => {
        return await ApiClient.get(ENDPOINT);
    },

    getById: async (id) => {
        return await ApiClient.get(`${ENDPOINT}/${id}`);
    },

    create: async (data) => {
        return await ApiClient.post(ENDPOINT, data);
    },

    update: async (id, data) => {
        return await ApiClient.put(`${ENDPOINT}/${id}`, data);
    },

    delete: async (id) => {
        return await ApiClient.delete(`${ENDPOINT}/${id}`);
    }
};

export default EntrenamientoService;
