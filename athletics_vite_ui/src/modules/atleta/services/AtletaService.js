import ApiClient from "../../../core/api/apiClient";

const AtletaService = {
    getAll: async () => {
        const data = await ApiClient.get('/atleta/');
        console.log("AtletaService.getAll data:", data);
        return data; // ApiClient already unwraps response.data
    },

    getAthletes: async (page = 1, limit = 20) => {
        const response = await ApiClient.get(`/auth/users/?page=${page}&size=${limit}&role=ATLETA`);
        // Always return { items, total } for consistency with test expectations
        if (response && typeof response === 'object' && 'items' in response && 'total' in response) {
            return response;
        }
        if (response && Array.isArray(response)) {
            return { items: response, total: response.length };
        }
        if (response && response.data && Array.isArray(response.data.items)) {
            return { items: response.data.items, total: response.data.items.length };
        }
        // Fallback: empty
        return { items: [], total: 0 };
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
    },

    // Obtener confirmaciones pendientes de asistencia
    getPendingConfirmations: async (atletaId) => {
        const response = await ApiClient.get(`/entrenador/asistencias/mis-registros?atleta_id=${atletaId}`);
        return response;
    },

    // Confirmar o rechazar asistencia
    confirmAttendance: async (registroId, confirmado, fechaEntrenamiento) => {
        const endpoint = confirmado
            ? `/entrenador/asistencias/confirmar/${registroId}?fecha_entrenamiento=${fechaEntrenamiento}`
            : `/entrenador/asistencias/rechazar/${registroId}?fecha_entrenamiento=${fechaEntrenamiento}`;

        const response = await ApiClient.post(endpoint);
        return response;
    }
};

export default AtletaService;
