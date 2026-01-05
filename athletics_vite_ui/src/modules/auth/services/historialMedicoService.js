import historialMedicoRepository from '../repositories/historialMedicoRepositorie';

class HistorialMedicoService {

    // ✅ Crear historial médico
    async createHistorialMedico(payload) {
        try {
            return await historialMedicoRepository.createHistorial(payload);
        } catch (error) {
            throw error;
        }
    }

    // ✅ Obtener todos los historiales (admin)
    async getAllHistoriales() {
        try {
            return await historialMedicoRepository.getAllHistoriales();
        } catch (error) {
            throw error;
        }
    }

    // ✅ Obtener historial del atleta logueado
    async getMyHistorial() {
        try {
            return await historialMedicoRepository.getMyHistorial();
        } catch (error) {
            throw error;
        }
    }

    // ✅ Obtener historial por external_id
    async getHistorialByExternalId(externalId) {
        try {
            return await historialMedicoRepository.getHistorialByExternalId(externalId);
        } catch (error) {
            throw error;
        }
    }

    // ✅ Actualizar historial médico
    async updateHistorial(externalId, payload) {
        try {
            return await historialMedicoRepository.updateHistorial(externalId, payload);
        } catch (error) {
            throw error;
        }
    }
}

export default new HistorialMedicoService();
