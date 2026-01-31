import { describe, it, expect, vi, beforeEach } from 'vitest'
import RepresentanteService from '../../../modules/representante/services/RepresentanteService'
import ApiClient from '../../../core/api/apiClient'

vi.mock('../../../core/api/apiClient')

describe('RepresentanteService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('registerChildAthlete', () => {
        it('should call ApiClient.post with correct endpoint and data', async () => {
            const childData = {
                nombre: 'Juan',
                apellido: 'Pérez',
                edad: 10
            }
            const mockResponse = { id: 1, ...childData }

            ApiClient.post.mockResolvedValue(mockResponse)

            const result = await RepresentanteService.registerChildAthlete(childData)

            expect(ApiClient.post).toHaveBeenCalledWith('/representante/athletes', childData)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('updateChildAthlete', () => {
        it('should call ApiClient.put with correct endpoint and data', async () => {
            const atletaId = 123
            const updateData = {
                nombre: 'Juan Actualizado',
                edad: 11
            }
            const mockResponse = { id: atletaId, ...updateData }

            ApiClient.put.mockResolvedValue(mockResponse)

            const result = await RepresentanteService.updateChildAthlete(atletaId, updateData)

            expect(ApiClient.put).toHaveBeenCalledWith(`/representante/athletes/${atletaId}`, updateData)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('getMyAthletes', () => {
        it('should call ApiClient.get with correct endpoint', async () => {
            const mockData = [
                { id: 1, nombre: 'Atleta 1' },
                { id: 2, nombre: 'Atleta 2' }
            ]

            ApiClient.get.mockResolvedValue(mockData)

            const result = await RepresentanteService.getMyAthletes()

            expect(ApiClient.get).toHaveBeenCalledWith('/representante/athletes')
            expect(result).toEqual(mockData)
        })
    })

    describe('getAtletaDetail', () => {
        it('should call ApiClient.get with correct endpoint and atletaId', async () => {
            const atletaId = 123
            const mockData = {
                id: atletaId,
                nombre: 'Juan Pérez',
                edad: 10
            }

            ApiClient.get.mockResolvedValue(mockData)

            const result = await RepresentanteService.getAtletaDetail(atletaId)

            expect(ApiClient.get).toHaveBeenCalledWith(`/representante/athletes/${atletaId}`)
            expect(result).toEqual(mockData)
        })
    })

    describe('getAtletaHistorial', () => {
        it('should call ApiClient.get with correct endpoint and atletaId', async () => {
            const atletaId = 123
            const mockData = [
                { id: 1, fecha: '2024-01-01', actividad: 'Entrenamiento' }
            ]

            ApiClient.get.mockResolvedValue(mockData)

            const result = await RepresentanteService.getAtletaHistorial(atletaId)

            expect(ApiClient.get).toHaveBeenCalledWith(`/representante/athletes/${atletaId}/historial`)
            expect(result).toEqual(mockData)
        })
    })

    describe('getAtletaEstadisticas', () => {
        it('should call ApiClient.get with correct endpoint and atletaId', async () => {
            const atletaId = 123
            const mockData = {
                total_entrenamientos: 50,
                promedio_asistencia: 90
            }

            ApiClient.get.mockResolvedValue(mockData)

            const result = await RepresentanteService.getAtletaEstadisticas(atletaId)

            expect(ApiClient.get).toHaveBeenCalledWith(`/representante/athletes/${atletaId}/estadisticas`)
            expect(result).toEqual(mockData)
        })
    })
})
