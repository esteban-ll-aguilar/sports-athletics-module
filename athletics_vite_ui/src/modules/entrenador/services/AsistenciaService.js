import ApiClient from "../../../core/api/apiClient";

const AsistenciaService = {
    // Inscribir atleta a un horario
    inscribirAtleta: async (payload) => {
        return await ApiClient.post('/entrenador/asistencias/inscripcion', payload);
    },

    // Listar atletas inscritos en un horario
    listarInscritos: async (horarioId) => {
        return await ApiClient.get(`/entrenador/asistencias/inscripcion/horario/${horarioId}`);
    },

    // Registrar asistencia diaria
    registrarAsistencia: async (payload) => {
        return await ApiClient.post('/entrenador/asistencias/registro', payload);
    },

    // Helper to get formatted date for database (YYYY-MM-DD)
    getTodayDate: () => {
        return new Date().toISOString().split('T')[0];
    },

    // Helper to get current time for database (HH:MM:SS)
    getCurrentTime: () => {
        const now = new Date();
        return now.toTimeString().split(' ')[0];
    }
};

export default AsistenciaService;
