import ApiClient from '../../../core/api/apiClient';
import Settings from '../../../config/enviroment';

const API_URL = `${Settings.API_URL}/api/v1/competencia/baremos`;

class BaremoRepository {
    // GET /api/v1/competencia/baremos/baremos/
    async getAll() {
        try {
            const responseData = await ApiClient.get(`${API_URL}/`);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // POST /api/v1/competencia/baremos/baremos/
    async create(baremoData) {
        try {
            const responseData = await ApiClient.post(`${API_URL}/`, baremoData);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // PUT /api/v1/competencia/baremos/baremos/{external_id}
    // Este método se usa tanto para editar como para DESACTIVAR (enviando estado: false)
    async update(externalId, baremoData) {
        try {
            const responseData = await ApiClient.put(`${API_URL}/${externalId}`, baremoData);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
}

export default new BaremoRepository();