import { describe, it, expect, vi, beforeEach } from 'vitest'
import resultadoEntrenamientoService from '../../../modules/entrenador/services/resultado_entrenamiento_service'
import apiClient from '../../../core/api/apiClient'

vi.mock('../../../core/api/apiClient')

describe('ResultadoEntrenamientoService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getAll', () => {
        it('should call apiClient.get with incluirInactivos=false by default', async () => {
            const mockData = [{ id: 1, resultado: '10.5s' }]
            apiClient.get.mockResolvedValue(mockData)

            const result = await resultadoEntrenamientoService.getAll()

            expect(apiClient.get).toHaveBeenCalledWith('/entrenador/resultados-entrenamientos/?incluir_inactivos=false')
            expect(result).toEqual(mockData)
        })

        it('should call apiClient.get with incluirInactivos=true when specified', async () => {
            const mockData = [{ id: 1, resultado: '10.5s' }]
            apiClient.get.mockResolvedValue(mockData)

            const result = await resultadoEntrenamientoService.getAll(true)

            expect(apiClient.get).toHaveBeenCalledWith('/entrenador/resultados-entrenamientos/?incluir_inactivos=true')
            expect(result).toEqual(mockData)
        })
    })

    describe('create', () => {
        it('should call apiClient.post with correct endpoint and data', async () => {
            const newData = { resultado: '10.5s' }
            const mockResponse = { id: 1, ...newData }
            apiClient.post.mockResolvedValue(mockResponse)

            const result = await resultadoEntrenamientoService.create(newData)

            expect(apiClient.post).toHaveBeenCalledWith('/entrenador/resultados-entrenamientos', newData)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('update', () => {
        it('should call apiClient.put with correct endpoint, id and data', async () => {
            const id = 123
            const updateData = { resultado: '9.8s' }
            const mockResponse = { id, ...updateData }
            apiClient.put.mockResolvedValue(mockResponse)

            const result = await resultadoEntrenamientoService.update(id, updateData)

            expect(apiClient.put).toHaveBeenCalledWith(`/entrenador/resultados-entrenamientos/${id}`, updateData)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('delete', () => {
        it('should call apiClient.delete with correct endpoint and id', async () => {
            const id = 123
            apiClient.delete.mockResolvedValue(undefined)

            await resultadoEntrenamientoService.delete(id)

            expect(apiClient.delete).toHaveBeenCalledWith(`/entrenador/resultados-entrenamientos/${id}`)
        })
    })
})
