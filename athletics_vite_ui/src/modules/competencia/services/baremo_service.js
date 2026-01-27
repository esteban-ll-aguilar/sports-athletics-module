import baremoRepository from "../repositories/baremo_repository";

const baremoService = {
    async getAll() {
        const response = await baremoRepository.getAll();
        // Repository returns Wrapper. Wrapper.data is Payload. Payload.items is Array.
        return response.data.items || response.data;
    },

    async create(data) {
        const response = await baremoRepository.create(data);
        return response.data;
    },

    async update(id, data) {
        const response = await baremoRepository.update(id, data);
        return response.data;
    }
};

export default baremoService;