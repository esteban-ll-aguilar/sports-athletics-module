import axios from 'axios';
import Settings from '../../../config/enviroment';

const API_URL = `${Settings.API_URL}/api/v1/competencia/competencias`;

class CompetenciaRepository {
    // GET /api/v1/competencia/competencias/
    async getAll() {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get(`${API_URL}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // GET /api/v1/competencia/competencias/{external_id}
    async getById(externalId) {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get(`${API_URL}/${externalId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // POST /api/v1/competencia/competencias/
    async create(competenciaData) {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(`${API_URL}`, competenciaData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // PUT /api/v1/competencia/competencias/{external_id}
    async update(externalId, competenciaData) {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.put(`${API_URL}/${externalId}`, competenciaData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
}

export default new CompetenciaRepository();