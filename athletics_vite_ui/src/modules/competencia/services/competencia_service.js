import competenciaRepository from "../repositories/competencia_repositorio";

const competenciaService = {
    async getAll() {
        const response = await competenciaRepository.getAll();
        return response.data.items || response.data;
    },

    async getById(externalId) {
        const response = await competenciaRepository.getById(externalId);
        return response.data;
    },

    async create(data) {
        const response = await competenciaRepository.create(data);
        return response.data;
    },

    async update(externalId, data) {
        const response = await competenciaRepository.update(externalId, data);
        return response.data;
    },

    async delete(externalId) {
        const response = await competenciaRepository.delete(externalId);
        return response.data;
    }
};

export default competenciaService;