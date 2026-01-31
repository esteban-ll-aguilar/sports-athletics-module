import apiClient from "../../../core/api/apiClient";

const resultadoEntrenamientoService = {
    getAll: async (incluirInactivos = false) => {
        const response = await apiClient.get(`/entrenador/resultados-entrenamientos/?incluir_inactivos=${incluirInactivos}`);
        return response;
    },
    create: async (data) => {
        const response = await apiClient.post("/entrenador/resultados-entrenamientos", data);
        return response;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`/entrenador/resultados-entrenamientos/${id}`, data);
        return response;
    },
    delete: async (id) => {
        await apiClient.delete(`/entrenador/resultados-entrenamientos/${id}`);
    }
};

export default resultadoEntrenamientoService;
