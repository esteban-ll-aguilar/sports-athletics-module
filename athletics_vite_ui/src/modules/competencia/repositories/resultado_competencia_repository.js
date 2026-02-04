import ApiClient from '../../../core/api/apiClient';
import Settings from '../../../config/enviroment';

const API_URL = `${Settings.API_URL}/api/v1/competencia/resultados`;

class ResultadoCompetenciaRepository {
    // GET /api/v1/competencia/resultados/
    async getAll() {
        try {
            const responseData = await ApiClient.get(`${API_URL}`);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // GET /api/v1/competencia/resultados/{external_id}
    async getById(externalId) {
        try {
            const responseData = await ApiClient.get(`${API_URL}/${externalId}`);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // GET /api/v1/competencia/resultados/competencia/{external_id}
    async getByCompetencia(competenciaExternalId) {
        try {
            const responseData = await ApiClient.get(`${API_URL}/competencia/${competenciaExternalId}`);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // POST /api/v1/competencia/resultados/
    async create(resultadoData) {
        try {
            const responseData = await ApiClient.post(`${API_URL}`, resultadoData);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // PUT /api/v1/competencia/resultados/{external_id}
    async update(externalId, resultadoData) {
        try {
            const responseData = await ApiClient.put(`${API_URL}/${externalId}`, resultadoData);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
}

export default new ResultadoCompetenciaRepository();