import ApiClient from '../../../core/api/apiClient';
import Settings from '../../../config/enviroment';

const API_URL = `${Settings.API_URL}/api/v1/competencia/tipo-disciplina`;

class TipoDisciplinaRepository {
    async getAll() {
        try {
            const responseData = await ApiClient.get(`${API_URL}/`);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async create(data) {
        try {
            const responseData = await ApiClient.post(`${API_URL}/`, data);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async update(externalId, data) {
        try {
            const responseData = await ApiClient.put(`${API_URL}/${externalId}`, data);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
}

export default new TipoDisciplinaRepository();