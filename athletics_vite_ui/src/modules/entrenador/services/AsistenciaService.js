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

    // Eliminar inscripción
    eliminarInscripcion: async (registroId) => {
        return await ApiClient.delete(`/entrenador/asistencias/inscripcion/${registroId}`);
    },

    // --- Nuevos métodos ---

    // Confirmar asistencia (atleta)
    confirmarAsistencia: async (registroId, fechaEntrenamiento) => {
        return await ApiClient.post(
            `/entrenador/asistencias/confirmar/${registroId}`,
            null,
            { params: { fecha_entrenamiento: fechaEntrenamiento } }
        );
    },

    // Rechazar asistencia (atleta)
    rechazarAsistencia: async (registroId, fechaEntrenamiento) => {
        return await ApiClient.post(
            `/entrenador/asistencias/rechazar/${registroId}`,
            null,
            { params: { fecha_entrenamiento: fechaEntrenamiento } }
        );
    },

    // Marcar como presente (entrenador)
    marcarPresente: async (asistenciaId) => {
        return await ApiClient.put(`/entrenador/asistencias/marcar-presente/${asistenciaId}`);
    },

    // Marcar como ausente (entrenador)
    marcarAusente: async (asistenciaId) => {
        return await ApiClient.put(`/entrenador/asistencias/marcar-ausente/${asistenciaId}`);
    },

    // Obtener registros de asistencia del atleta
    obtenerMisRegistros: async (atletaId) => {
        return await ApiClient.get('/entrenador/asistencias/mis-registros', {
            atleta_id: atletaId
        });
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
