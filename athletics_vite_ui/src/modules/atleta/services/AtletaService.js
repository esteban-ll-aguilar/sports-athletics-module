import ApiClient from "../../../core/api/apiClient";

const AtletaService = {
    getAll: async () => {
        const data = await ApiClient.get('/atleta/');
        console.log("AtletaService.getAll data:", data);
        return data; // ApiClient already unwraps response.data
    },

    getAthletes: async (page = 1, limit = 20) => {
        const response = await ApiClient.get(`/auth/users/?page=${page}&size=${limit}&role=ATLETA`);
        console.log("AtletaService.getAthletes data:", response);
        return response; // ApiClient already returned response.data
    },

    getHistorial: async () => {
        const data = await ApiClient.get('/atleta/historial');
        return data;
    },

    getEstadisticas: async () => {
        const response = await ApiClient.get('/atleta/estadisticas');
        return response;
    },

    getHistorialByUserId: async (userId) => {
        const response = await ApiClient.get(`/atleta/historial-medico/user/${userId}`);
        return response;
    },

    // Obtener perfil del atleta actual (usa endpoint /me)
    getProfile: async () => {
        const response = await ApiClient.get('/atleta/me');
        console.log("AtletaService.getProfile data:", response);
        return response;
    },

    // Obtener resultados de pruebas del atleta
    getTestResults: async () => {
        const response = await ApiClient.get('/competencia/resultados-pruebas/');
        return response;
    },

    // Obtener entrenamientos del atleta
    getTrainingSessions: async (atletaId) => {
        const response = await ApiClient.get(`/entrenador/asistencias/mis-registros?atleta_id=${atletaId}`);
        return response;
    }
};

export default AtletaService;
