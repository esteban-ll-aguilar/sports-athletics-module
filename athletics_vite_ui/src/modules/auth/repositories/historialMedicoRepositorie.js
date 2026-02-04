import ApiClient from '../../../core/api/apiClient';
import Settings from '../../../config/enviroment';

const API_URL = `${Settings.API_URL}/api/v1`;

class HistorialMedicoRepository {

    // ✅ POST - Crear historial médico
    async createHistorial(data) {
        try {
            const responseData = await ApiClient.post(`${API_URL}/atleta/historial-medico/`, data);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // ✅ GET - Listar todos los historiales (admin)
    async getAllHistoriales() {
        try {
            const responseData = await ApiClient.get(`${API_URL}/atleta/historial-medico/`);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // ✅ GET - Obtener mi historial (ATLETA LOGUEADO)
    async getMyHistorial() {
        try {
            const responseData = await ApiClient.get(`${API_URL}/atleta/historial-medico/me`);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // ✅ GET - Obtener historial por external_id
    async getHistorialByExternalId(externalId) {
        try {
            const responseData = await ApiClient.get(`${API_URL}/atleta/historial-medico/${externalId}`);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // ✅ PUT - Actualizar historial por external_id
    async updateHistorial(externalId, data) {
        try {
            const responseData = await ApiClient.put(`${API_URL}/atleta/historial-medico/${externalId}`, data);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
}

export default new HistorialMedicoRepository();
