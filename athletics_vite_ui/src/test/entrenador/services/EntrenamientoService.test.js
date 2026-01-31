import { describe, it, expect, vi, beforeEach } from 'vitest'
import EntrenamientoService from '../../../modules/entrenador/services/EntrenamientoService'
import ApiClient from '../../../core/api/apiClient'

vi.mock('../../../core/api/apiClient')

describe('EntrenamientoService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getAll', () => {
        it('should call ApiClient.get with correct endpoint', async () => {
            const mockData = [
                { id: 1, nombre: 'Entrenamiento 1' }
            ]
            ApiClient.get.mockResolvedValue(mockData)

            const result = await EntrenamientoService.getAll()

            expect(ApiClient.get).toHaveBeenCalledWith('/entrenador/entrenamientos/')
            expect(result).toEqual(mockData)
        })
    })

    describe('getById', () => {
        it('should call ApiClient.get with correct endpoint and id', async () => {
            const mockData = { id: 1, nombre: 'Entrenamiento 1' }
            ApiClient.get.mockResolvedValue(mockData)

            const result = await EntrenamientoService.getById(1)

            expect(ApiClient.get).toHaveBeenCalledWith('/entrenador/entrenamientos/1')
            expect(result).toEqual(mockData)
        })
    })

    describe('create', () => {
        it('should call ApiClient.post with correct endpoint and data', async () => {
            const newData = { nombre: 'Nuevo Entrenamiento' }
            const mockResponse = { id: 1, ...newData }
            ApiClient.post.mockResolvedValue(mockResponse)

            const result = await EntrenamientoService.create(newData)

            expect(ApiClient.post).toHaveBeenCalledWith('/entrenador/entrenamientos/', newData)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('update', () => {
        it('should call ApiClient.put with correct endpoint, id and data', async () => {
            const updateData = { nombre: 'Entrenamiento Actualizado' }
            const mockResponse = { id: 1, ...updateData }
            ApiClient.put.mockResolvedValue(mockResponse)

            const result = await EntrenamientoService.update(1, updateData)

            expect(ApiClient.put).toHaveBeenCalledWith('/entrenador/entrenamientos/1', updateData)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('delete', () => {
        it('should call ApiClient.delete with correct endpoint and id', async () => {
            ApiClient.delete.mockResolvedValue({ success: true })

            const result = await EntrenamientoService.delete(1)

            expect(ApiClient.delete).toHaveBeenCalledWith('/entrenador/entrenamientos/1')
            expect(result).toEqual({ success: true })
        })
    })
})
