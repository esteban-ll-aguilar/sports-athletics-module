import pruebaRepository from "../repositories/prueba_repository";

const pruebaService = {
    async getAll() {
        const response = await pruebaRepository.getAll();
        return response.data.items || response.data;
    },

    async create(data) {
        const response = await pruebaRepository.create(data);
        return response.data;
    },

    async update(id, data) {
        const response = await pruebaRepository.update(id, data);
        return response.data;
    }
};

export default pruebaService;