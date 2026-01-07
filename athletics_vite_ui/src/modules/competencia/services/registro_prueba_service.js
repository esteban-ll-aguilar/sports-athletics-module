import registroPruebaCompetenciaRepository 
    from "../repositories/registro_prueba_competencia_repository";

const registroPruebaCompetenciaService = {

    async getAll() {
        const response = await registroPruebaCompetenciaRepository.getAll();
        return response.data || response;
    },

    async getByExternalId(externalId) {
        return await registroPruebaCompetenciaRepository.getByExternalId(externalId);
    },

    async create(data) {
        return await registroPruebaCompetenciaRepository.create(data);
    },

    async update(externalId, data) {
        return await registroPruebaCompetenciaRepository.update(externalId, data);
    }
};

export default registroPruebaCompetenciaService;
