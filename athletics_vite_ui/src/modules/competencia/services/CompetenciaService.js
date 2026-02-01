import ApiClient from "../../../core/api/apiClient";

const CompetenciaService = {
    // Obtener todos los registros de pruebas (para admin/entrenador)
    getAllTestResults: async () => {
        const data = await ApiClient.get('/competencia/resultados-pruebas/');
        return data;
    },

    // Obtener registros de pruebas por atleta (filtrado en frontend por ahora)
    getAthleteTestResults: async (atletaId) => {
        const data = await ApiClient.get('/competencia/resultados-pruebas/');
        // Filtrar por atleta_user_id si viene del backend
        return data;
    },

    // Obtener todas las competencias
    getCompetencias: async () => {
        const data = await ApiClient.get('/competencia/competencias/');
        return data;
    },

    // Obtener todas las pruebas
    getPruebas: async () => {
        const data = await ApiClient.get('/competencia/pruebas/');
        return data;
    },

    // Obtener resultados de competencia
    getResultadosCompetencia: async () => {
        const data = await ApiClient.get('/competencia/resultados/');
        return data;
    },

    // Obtener baremos
    getBaremos: async () => {
        const data = await ApiClient.get('/competencia/baremos/');
        return data;
    }
};

export default CompetenciaService;
