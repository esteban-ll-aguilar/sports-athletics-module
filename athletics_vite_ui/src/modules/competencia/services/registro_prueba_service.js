import registroPruebaCompetenciaRepository
    from "../repositories/registro_prueba_repository";

const registroPruebaCompetenciaService = {

    async getAll() {
        const response = await registroPruebaCompetenciaRepository.getAll();
        return response.data.data;
    },

    async getByExternalId(externalId) {
        const response = await registroPruebaCompetenciaRepository.getByExternalId(externalId);
        return response.data.data;
    },

    async create(data) {
        const response = await registroPruebaCompetenciaRepository.create(data);
        return response.data.data;
    },

    async update(externalId, data) {
        const response = await registroPruebaCompetenciaRepository.update(externalId, data);
        return response.data.data;
    }
};

export default registroPruebaCompetenciaService;
