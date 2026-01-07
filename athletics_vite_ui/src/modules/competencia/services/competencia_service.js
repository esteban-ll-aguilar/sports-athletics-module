import competenciaRepository from "../repositories/competencia_repositorio";

const competenciaService = {
    async getAll() {
        const response = await competenciaRepository.getAll();
        return response.data || response;
    },

    async getById(externalId) {
        const response = await competenciaRepository.getById(externalId);
        return response.data || response;
    },

    async create(data) {
        return await competenciaRepository.create(data);
    },

    async update(externalId, data) {
        return await competenciaRepository.update(externalId, data);
    },

    async delete(externalId) {
        return await competenciaRepository.delete(externalId);
    }
};

export default competenciaService;