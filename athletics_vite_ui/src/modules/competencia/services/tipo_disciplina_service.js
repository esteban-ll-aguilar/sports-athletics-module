import tipoDisciplinaRepository from "../repositories/tipo_disciplina_repository";

const tipoDisciplinaService = {
    async getAll() {
        const response = await tipoDisciplinaRepository.getAll();
        return response.data.items || response.data;
    },

    async create(data) {
        const response = await tipoDisciplinaRepository.create(data);
        return response.data;
    },

    async update(id, data) {
        const response = await tipoDisciplinaRepository.update(id, data);
        return response.data;
    }
};

export default tipoDisciplinaService;