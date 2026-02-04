import ApiClient from "../../../core/api/apiClient";

const pasanteService = {
    getAll: async () => {
        const response = await ApiClient.get("/pasantes/");
        // Backend devuelve List[PasanteRead] directamente
        return Array.isArray(response) ? response : (response?.data || []);
    },

    create: async (data) => {
        console.log(data);
        return await ApiClient.post("/pasantes/", data);
    },

    update: async (id, data) => {
        return await ApiClient.put(`/pasantes/${id}`, data);
    },

    delete: async (id) => {
        return await ApiClient.delete(`/pasantes/${id}`);
    },
};

export default pasanteService;
