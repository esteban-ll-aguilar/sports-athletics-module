import axios from 'axios';
import Settings from '../../../config/enviroment';

const API_URL = `${Settings.API_URL}/api/v1/competencia/baremos`;

class BaremoRepository {
    // GET /api/v1/competencia/baremos/baremos/
    async getAll() {
        try {
            const response = await axios.get(`${API_URL}/`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }

    // POST /api/v1/competencia/baremos/baremos/
    async create(baremoData) {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(`${API_URL}/`, baremoData, {
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

    // PUT /api/v1/competencia/baremos/baremos/{external_id}
    // Este método se usa tanto para editar como para DESACTIVAR (enviando estado: false)
    async update(externalId, baremoData) {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.put(`${API_URL}/${externalId}`, baremoData, {
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

export default new BaremoRepository();