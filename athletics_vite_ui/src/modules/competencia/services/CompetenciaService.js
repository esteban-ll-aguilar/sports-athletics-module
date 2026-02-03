import ApiClient from "../../../core/api/apiClient";

const CompetenciaService = {
    // Obtener todos los registros de pruebas (para admin/entrenador)
    getAllTestResults: async () => {
        const response = await ApiClient.get('/competencia/resultados-pruebas/');
        return response.data?.items || response.data || [];
    },

    // Obtener registros de pruebas por atleta (filtrado en frontend por ahora)
    getAthleteTestResults: async (atletaId) => {
        const response = await ApiClient.get('/competencia/resultados-pruebas/');
        // ApiClient returns response.data. response.data.items is the array.
        return response.data?.items || response.data || [];
    },

    // Obtener todas las competencias
    getCompetencias: async () => {
        const response = await ApiClient.get('/competencia/competencias/');
        return response.data?.items || response.data || [];
    },

    // Obtener todas las pruebas
    getPruebas: async () => {
        const response = await ApiClient.get('/competencia/pruebas/');
        return response.data?.items || response.data || [];
    },

    // Obtener resultados de competencia
    getResultadosCompetencia: async () => {
        const response = await ApiClient.get('/competencia/resultados/');
        return response.data?.items || response.data || [];
    },

    // Obtener baremos
    getBaremos: async () => {
        const response = await ApiClient.get('/competencia/baremos/');
        return response.data?.items || response.data || [];
    }
};

export default CompetenciaService;
