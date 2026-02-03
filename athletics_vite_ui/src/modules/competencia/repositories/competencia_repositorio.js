import ApiClient from '../../../core/api/apiClient';
import Settings from '../../../config/enviroment';

const API_URL = `${Settings.API_URL}/api/v1/competencia/competencias`;

class CompetenciaRepository {
    // GET /api/v1/competencia/competencias/
    async getAll() {
        try {
            const responseData = await ApiClient.get(`${API_URL}`);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // GET /api/v1/competencia/competencias/{external_id}
    async getById(externalId) {
        try {
            const responseData = await ApiClient.get(`${API_URL}/${externalId}`);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // POST /api/v1/competencia/competencias/
    async create(competenciaData) {
        try {
            console.log("CompetenciaRepository create payload:", competenciaData);
            const responseData = await ApiClient.post(`${API_URL}`, competenciaData);
            console.log("CompetenciaRepository create response:", responseData);
            return responseData;
        } catch (error) {
            console.error("CompetenciaRepository create error:", error);
            throw error.response ? error.response.data : error;
        }
    }

    // PUT /api/v1/competencia/competencias/{external_id}
    async update(externalId, competenciaData) {
        try {
            const responseData = await ApiClient.put(`${API_URL}/${externalId}`, competenciaData);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
    // DELETE /api/v1/competencia/competencias/{external_id}
    async delete(externalId) {
        try {
            const responseData = await ApiClient.delete(`${API_URL}/${externalId}`);
            return responseData;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
}

export default new CompetenciaRepository();