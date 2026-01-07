import axios from 'axios';
import Settings from '../../../config/enviroment';

const API_URL = `${Settings.API_URL}/api/v1`;

class HistorialMedicoRepository {

    // 🔐 Obtener token
    getAuthHeaders() {
        const token = localStorage.getItem('access_token');
        return {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    // ✅ POST - Crear historial médico
    async createHistorial(data) {
        try {
            const response = await axios.post(
                `${API_URL}/atleta/historial-medico/`,
                data,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // ✅ GET - Listar todos los historiales (admin)
    async getAllHistoriales() {
        try {
            const response = await axios.get(
                `${API_URL}/atleta/historial-medico/`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // ✅ GET - Obtener mi historial (ATLETA LOGUEADO)
    async getMyHistorial() {
        try {
            const response = await axios.get(
                `${API_URL}/atleta/historial-medico/me`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // ✅ GET - Obtener historial por external_id
    async getHistorialByExternalId(externalId) {
        try {
            const response = await axios.get(
                `${API_URL}/atleta/historial-medico/${externalId}`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // ✅ PUT - Actualizar historial por external_id
    async updateHistorial(externalId, data) {
        try {
            const response = await axios.put(
                `${API_URL}/atleta/historial-medico/${externalId}`,
                data,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
}

export default new HistorialMedicoRepository();
