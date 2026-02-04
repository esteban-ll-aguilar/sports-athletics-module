import ApiClient from "../../../core/api/apiClient";

const resultadoPruebaService = {
    getAll: async () => {
        const response = await ApiClient.get('/competencia/resultados-pruebas/');
        // ApiClient already unwraps one level, so response.data is the backend's "data" field
        return response.data?.items || response.data || [];
    },

    getById: async (id) => {
        const response = await ApiClient.get(`/competencia/resultados-pruebas/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await ApiClient.post('/competencia/resultados-pruebas/', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await ApiClient.put(`/competencia/resultados-pruebas/${id}`, data);
        return response.data;
    },

    // Delete usually just updates status, but if needed:
    // delete: async (id) => { ... }
};

export default resultadoPruebaService;
