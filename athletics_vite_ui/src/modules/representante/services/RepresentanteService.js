import ApiClient from "@core/api/apiClient";

const RepresentanteService = {
    registerChildAthlete: async (childData) => {
        return await ApiClient.post('/representante/athletes', childData);
    },
    getMyAthletes: async () => {
        return await ApiClient.get('/representante/athletes');
    },
    getAtletaHistorial: async (atletaId) => {
        return await ApiClient.get(`/representante/athletes/${atletaId}/historial`);
    },
    getAtletaEstadisticas: async (atletaId) => {
        return await ApiClient.get(`/representante/athletes/${atletaId}/estadisticas`);
    }
};

export default RepresentanteService;
