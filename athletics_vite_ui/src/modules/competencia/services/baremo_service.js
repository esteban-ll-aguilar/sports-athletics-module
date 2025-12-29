import baremoRepository from "../repositories/baremo_repository";

const baremoService = {
    async getAll() {
        const response = await baremoRepository.getAll();
        // Dependiendo de tu backend, puede que necesites retornar response.data o response
        return response.data || response; 
    },

    async create(data) {
        return await baremoRepository.create(data);
    },

    async update(id, data) {
        return await baremoRepository.update(id, data);
    }
};

export default baremoService;