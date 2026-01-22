import axios from "axios";
import Settings from "../../../config/enviroment";

const API_URL = `${Settings.API_URL}/api/v1/competencia/resultados-pruebas`;

const resultadoPruebaService = {
    getAll: async () => {
        const response = await axios.get(API_URL);
        return response.data;
    },

    getById: async (id) => {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await axios.post(API_URL, data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await axios.put(`${API_URL}/${id}`, data);
        return response.data;
    },

    // Delete usually just updates status, but if needed:
    // delete: async (id) => { ... }
};

export default resultadoPruebaService;
