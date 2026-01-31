import { describe, it, expect, vi, beforeEach } from 'vitest'
import AtletaService from '../../../modules/atleta/services/AtletaService'
import ApiClient from '../../../core/api/apiClient'

vi.mock('../../../core/api/apiClient')

// Mock console.log to avoid cluttering test output
global.console = {
    ...console,
    log: vi.fn(),
}

describe('AtletaService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getAll', () => {
        it('should call ApiClient.get with correct endpoint', async () => {
            const mockData = [
                { id: 1, nombre: 'Atleta 1' }
            ]

            ApiClient.get.mockResolvedValue(mockData)

            const result = await AtletaService.getAll()

            expect(ApiClient.get).toHaveBeenCalledWith('/atleta/')
            expect(result).toEqual(mockData)
        })
    })

    describe('getAthletes', () => {
        it('should call ApiClient.get with default pagination parameters', async () => {
            const mockResponse = {
                items: [{ id: 1, username: 'athlete1' }],
                total: 1
            }

            ApiClient.get.mockResolvedValue(mockResponse)

            const result = await AtletaService.getAthletes()

            expect(ApiClient.get).toHaveBeenCalledWith('/auth/users/?page=1&size=20&role=ATLETA')
            expect(result).toEqual(mockResponse)
        })

        it('should call ApiClient.get with custom pagination parameters', async () => {
            const mockResponse = {
                items: [{ id: 1, username: 'athlete1' }],
                total: 1
            }

            ApiClient.get.mockResolvedValue(mockResponse)

            const result = await AtletaService.getAthletes(2, 50)

            expect(ApiClient.get).toHaveBeenCalledWith('/auth/users/?page=2&size=50&role=ATLETA')
            expect(result).toEqual(mockResponse)
        })
    })

    describe('getHistorial', () => {
        it('should call ApiClient.get with correct endpoint', async () => {
            const mockData = [
                { id: 1, fecha: '2024-01-01', descripcion: 'Entrenamiento' }
            ]

            ApiClient.get.mockResolvedValue(mockData)

            const result = await AtletaService.getHistorial()

            expect(ApiClient.get).toHaveBeenCalledWith('/atleta/historial')
            expect(result).toEqual(mockData)
        })
    })

    describe('getEstadisticas', () => {
        it('should call ApiClient.get with correct endpoint', async () => {
            const mockData = {
                total_entrenamientos: 10,
                promedio_asistencia: 85
            }

            ApiClient.get.mockResolvedValue(mockData)

            const result = await AtletaService.getEstadisticas()

            expect(ApiClient.get).toHaveBeenCalledWith('/atleta/estadisticas')
            expect(result).toEqual(mockData)
        })
    })

    describe('getHistorialByUserId', () => {
        it('should call ApiClient.get with correct endpoint and userId', async () => {
            const userId = 123
            const mockData = [
                { id: 1, fecha: '2024-01-01', diagnostico: 'Saludable' }
            ]

            ApiClient.get.mockResolvedValue(mockData)

            const result = await AtletaService.getHistorialByUserId(userId)

            expect(ApiClient.get).toHaveBeenCalledWith(`/atleta/historial-medico/user/${userId}`)
            expect(result).toEqual(mockData)
        })
    })
})
