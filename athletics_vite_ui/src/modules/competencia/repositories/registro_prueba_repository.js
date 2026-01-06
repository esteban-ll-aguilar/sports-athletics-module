import axios from 'axios';
import Settings from '../../../config/enviroment';

const API_URL = `${Settings.API_URL}/api/v1/competencia/registro-pruebas/registro-pruebas`;

class RegistroPruebaCompetenciaRepository {

    async getAll() {
        try {
            const response = await axios.get(`${API_URL}/`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async getByExternalId(externalId) {
        try {
            const response = await axios.get(`${API_URL}/${externalId}`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    async create(data) {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(`${API_URL}/`, data, {
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

    async update(externalId, data) {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.put(`${API_URL}/${externalId}`, data, {
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

export default new RegistroPruebaCompetenciaRepository();
