import apiClient from "../../../core/api/apiClient";

const resultadoEntrenamientoService = {
    getAll: async (incluirInactivos = false) => {
        try {
            const response = await apiClient.get(`/entrenador/resultados-entrenamientos/?incluir_inactivos=${incluirInactivos}`);
            return response;
        } catch (error) {
            throw error;
        }
    },
    create: async (data) => {
        try {
            const response = await apiClient.post("/entrenador/resultados-entrenamientos", data);
            return response;
        } catch (error) {
            throw error;
        }
    },
    update: async (id, data) => {
        try {
            const response = await apiClient.put(`/entrenador/resultados-entrenamientos/${id}`, data);
            return response;
        } catch (error) {
            throw error;
        }
    },
    delete: async (id) => {
        try {
            await apiClient.delete(`/entrenador/resultados-entrenamientos/${id}`);
        } catch (error) {
            throw error;
        }
    }
};

export default resultadoEntrenamientoService;
