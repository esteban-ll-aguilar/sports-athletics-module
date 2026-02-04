import ApiClient from "../../../core/api/apiClient";

const API_PATH = "/competencia/resultados-pruebas";

const resultadoPruebaService = {
    getAll: async () => {
        const response = await ApiClient.get(`${API_PATH}/`);
        // ApiClient returns response.data directly.
        // Backend returns { success: true, data: { items: [...] } }
        return response.data?.items || response.data || [];
    },

    getById: async (id) => {
        const response = await ApiClient.get(`${API_PATH}/${id}`);
        return response.data;
    },

    create: async (data) => {
        // ApiClient.post returns response.data
        const response = await ApiClient.post(`${API_PATH}/`, data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await ApiClient.put(`${API_PATH}/${id}`, data);
        return response.data;
    }
};

export default resultadoPruebaService;
