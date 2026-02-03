import axios from "../../../core/api/apiClient";

const pasanteService = {
    getAll: async () => {
        return await axios.get("/pasantes/");
    },

    create: async (data) => {
        console.log(data);
        return await axios.post("/pasantes/", data);

    },

    update: async (id, data) => {
        return await axios.put(`/pasantes/${id}`, data);
    },

    delete: async (id) => {
        return await axios.delete(`/pasantes/${id}`);
    },
};

export default pasanteService;
