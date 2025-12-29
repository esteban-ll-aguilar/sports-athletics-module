import pruebaRepository from "../repositories/prueba_repository";

const pruebaService = {
    async getAll() {
        const response = await pruebaRepository.getAll();
        return response.data || response; 
    },

    async create(data) {
        return await pruebaRepository.create(data);
    },

    async update(id, data) {
        return await pruebaRepository.update(id, data);
    }
};

export default pruebaService;