import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock axios module with a factory so imports (like ApiClient) receive the mocked
// axios before they execute `axios.create()` and set interceptors.
vi.mock('axios', () => {
    const mAxios = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
    };
    // axios.create should return an instance that contains interceptors and methods
    mAxios.create = vi.fn(() => ({
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() }
        },
        get: mAxios.get,
        post: mAxios.post,
        put: mAxios.put,
        delete: mAxios.delete,
        patch: mAxios.patch
    }));
    return { default: mAxios };
});

import axios from 'axios'
import resultadoPruebaService from '../../../modules/competencia/services/resultado_prueba_service'
import Settings from '../../../config/enviroment'

describe('ResultadoPruebaService', () => {
    const API_URL = `${Settings.API_URL}/api/v1/competencia/resultados-pruebas`

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getAll', () => {
        it('should return items when response has data.data.items', async () => {
            const mockData = [
                { id: 1, resultado: '10.5s' }
            ]
            axios.get.mockResolvedValue({
                data: { data: { items: mockData } }
            })

            const result = await resultadoPruebaService.getAll()

            expect(axios.get).toHaveBeenCalledWith('/competencia/resultados-pruebas/', { params: {} })
            expect(result).toEqual(mockData)
        })

        it('should return data directly when no items property', async () => {
            const mockData = [
                { id: 1, resultado: '10.5s' }
            ]
            axios.get.mockResolvedValue({
                data: { data: mockData }
            })

            const result = await resultadoPruebaService.getAll()

            expect(result).toEqual(mockData)
        })
    })

    describe('getById', () => {
        it('should call axios.get with correct URL and return data', async () => {
            const mockData = { id: 1, resultado: '10.5s' }
            axios.get.mockResolvedValue({
                data: { data: mockData }
            })

            const result = await resultadoPruebaService.getById(1)

            expect(axios.get).toHaveBeenCalledWith('/competencia/resultados-pruebas/1', { params: {} })
            expect(result).toEqual(mockData)
        })
    })

    describe('create', () => {
        it('should call axios.post with correct URL and data', async () => {
            const newData = { resultado: '10.5s' }
            const mockResponse = { id: 1, ...newData }
            axios.post.mockResolvedValue({
                data: { data: mockResponse }
            })

            const result = await resultadoPruebaService.create(newData)

            expect(axios.post).toHaveBeenCalledWith('/competencia/resultados-pruebas/', newData, {})
            expect(result).toEqual(mockResponse)
        })
    })

    describe('update', () => {
        it('should call axios.put with correct URL, id and data', async () => {
            const updateData = { resultado: '9.8s' }
            const mockResponse = { id: 1, ...updateData }
            axios.put.mockResolvedValue({
                data: { data: mockResponse }
            })

            const result = await resultadoPruebaService.update(1, updateData)

            expect(axios.put).toHaveBeenCalledWith('/competencia/resultados-pruebas/1', updateData, {})
            expect(result).toEqual(mockResponse)
        })
    })
})
