import { describe, it, expect, vi, beforeEach } from 'vitest'
import HorarioService from '../../../modules/entrenador/services/HorarioService'
import ApiClient from '../../../core/api/apiClient'

vi.mock('../../../core/api/apiClient')

describe('HorarioService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('create', () => {
        it('should call ApiClient.post with correct endpoint, entrenamientoId and payload', async () => {
            const entrenamientoId = 123
            const payload = { dia: 'Lunes', hora_inicio: '08:00', hora_fin: '10:00' }
            const mockResponse = { id: 1, ...payload }
            ApiClient.post.mockResolvedValue(mockResponse)

            const result = await HorarioService.create(entrenamientoId, payload)

            expect(ApiClient.post).toHaveBeenCalledWith(`/entrenador/horarios/entrenamiento/${entrenamientoId}`, payload)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('getByEntrenamiento', () => {
        it('should call ApiClient.get with correct endpoint and entrenamientoId', async () => {
            const entrenamientoId = 123
            const mockData = [
                { id: 1, dia: 'Lunes', hora_inicio: '08:00' }
            ]
            ApiClient.get.mockResolvedValue(mockData)

            const result = await HorarioService.getByEntrenamiento(entrenamientoId)

            expect(ApiClient.get).toHaveBeenCalledWith(`/entrenador/horarios/entrenamiento/${entrenamientoId}`)
            expect(result).toEqual(mockData)
        })
    })

    describe('delete', () => {
        it('should call ApiClient.delete with correct endpoint and id', async () => {
            const id = 123
            ApiClient.delete.mockResolvedValue({ success: true })

            const result = await HorarioService.delete(id)

            expect(ApiClient.delete).toHaveBeenCalledWith(`/entrenador/horarios/${id}`)
            expect(result).toEqual({ success: true })
        })
    })
})
