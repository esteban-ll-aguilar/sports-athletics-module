import resultadoCompetenciaRepository from "../repositories/resultado_competencia_repository";

const resultadoCompetenciaService = {
    async getAll() {
        const response = await resultadoCompetenciaRepository.getAll();
        return response.data || response;
    },

    async getById(externalId) {
        const response = await resultadoCompetenciaRepository.getById(externalId);
        return response.data || response;
    },

    async getByCompetencia(competenciaExternalId) {
        const response = await resultadoCompetenciaRepository.getByCompetencia(competenciaExternalId);
        return response.data || response;
    },

    async create(data) {
        return await resultadoCompetenciaRepository.create(data);
    },

    async update(externalId, data) {
        return await resultadoCompetenciaRepository.update(externalId, data);
    }
};

export default resultadoCompetenciaService;