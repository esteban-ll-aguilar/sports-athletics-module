import ApiClient from "@core/api/apiClient";

const RepresentanteService = {
    registerChildAthlete: async (childData) => {
        return await ApiClient.post('/representante/athletes', childData);
    },
    updateChildAthlete: async (atletaId, data) => {
        return await ApiClient.put(`/representante/athletes/${atletaId}`, data);
    },
    getMyAthletes: async () => {
        return await ApiClient.get('/representante/athletes');
    },
    getAtletaDetail: async (atletaId) => {
        return await ApiClient.get(`/representante/athletes/${atletaId}`);
    },
    getAtletaHistorial: async (atletaId) => {
        return await ApiClient.get(`/representante/athletes/${atletaId}/historial`);
    },
    getAtletaEstadisticas: async (atletaId) => {
        return await ApiClient.get(`/representante/athletes/${atletaId}/estadisticas`);
    }
};

export default RepresentanteService;
