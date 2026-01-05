import axios from 'axios';
import Settings from '../../../config/enviroment';

const API_URL = `${Settings.API_URL}/api/v1/competencia/resultados`;

class ResultadoCompetenciaRepository {
    // GET /api/v1/competencia/resultados/
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

    // GET /api/v1/competencia/resultados/{external_id}
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

    // GET /api/v1/competencia/resultados/competencia/{external_id}
    async getByCompetencia(competenciaExternalId) {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get(`${API_URL}/competencia/${competenciaExternalId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // POST /api/v1/competencia/resultados/
    async create(resultadoData) {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(`${API_URL}`, resultadoData, {
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

    // PUT /api/v1/competencia/resultados/{external_id}
    async update(externalId, resultadoData) {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.put(`${API_URL}/${externalId}`, resultadoData, {
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

export default new ResultadoCompetenciaRepository();