import ApiClient from "../../../core/api/apiClient";

const HorarioService = {
    create: async (entrenamientoId, payload) => {
        return await ApiClient.post(`/entrenador/horarios/entrenamiento/${entrenamientoId}`, payload);
    },
    getByEntrenamiento: async (entrenamientoId) => {
        return await ApiClient.get(`/entrenador/horarios/entrenamiento/${entrenamientoId}`);
    },
    delete: async (id) => {
        return await ApiClient.delete(`/entrenador/horarios/${id}`);
    }
};

export default HorarioService;
