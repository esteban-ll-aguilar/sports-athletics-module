import tipoDisciplinaRepository from "../repositories/tipo_disciplina_repository";

const tipoDisciplinaService = {
    async getAll() {
        const response = await tipoDisciplinaRepository.getAll();
        return response.data || response; 
    },

    async create(data) {
        return await tipoDisciplinaRepository.create(data);
    },

    async update(id, data) {
        return await tipoDisciplinaRepository.update(id, data);
    }
};

export default tipoDisciplinaService;