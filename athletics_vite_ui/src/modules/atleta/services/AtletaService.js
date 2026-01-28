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
    }
};

export default AtletaService;
