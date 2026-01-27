import ApiClient from "../../../core/api/apiClient";

const AtletaService = {
    getAll: async () => {
        const response = await ApiClient.get('/atleta/');
        console.log("AtletaService.getAll response:", response);
        return response;
    },

    getAthletes: async (page = 1, limit = 20) => {
        const response = await ApiClient.get(`/auth/users/list?page=${page}&size=${limit}&role=ATLETA`);
        console.log("AtletaService.getAthletes response:", response);
        return response;
    },

    getHistorial: async () => {
        const response = await ApiClient.get('/atleta/historial');
        return response;
    },

    getEstadisticas: async () => {
        const response = await ApiClient.get('/atleta/estadisticas');
        return response;
    },

    getHistorialByUserId: async (userId) => {
        const response = await ApiClient.get(`/atleta/historial-medico/user/${userId}`);
        return response;
    }
};

export default AtletaService;
