import ApiClient from "../../../core/api/apiClient";

const AtletaService = {
    getAll: async () => {
        const response = await ApiClient.get('/atleta/');
        console.log("AtletaService.getAll response:", response);
        return response;
    }
};

export default AtletaService;
