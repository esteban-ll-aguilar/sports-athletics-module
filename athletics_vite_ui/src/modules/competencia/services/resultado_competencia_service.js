import resultadoCompetenciaRepository from "../repositories/resultado_competencia_repository";

const resultadoCompetenciaService = {
    async getAll() {
        const response = await resultadoCompetenciaRepository.getAll();
        return response;
    },

    async getById(externalId) {
        const response = await resultadoCompetenciaRepository.getById(externalId);
        return response;
    },

    async getByCompetencia(competenciaExternalId) {
        const response = await resultadoCompetenciaRepository.getByCompetencia(competenciaExternalId);
        return response;
    },

    async create(data) {
        const response = await resultadoCompetenciaRepository.create(data);
        return response;
    },

    async update(externalId, data) {
        const response = await resultadoCompetenciaRepository.update(externalId, data);
        return response.data;
    }
};

export default resultadoCompetenciaService;