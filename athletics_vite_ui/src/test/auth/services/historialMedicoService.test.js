import { describe, it, expect, vi, beforeEach } from 'vitest'
import historialMedicoService from '../../../modules/auth/services/historialMedicoService'
import historialMedicoRepository from '../../../modules/auth/repositories/historialMedicoRepositorie'

vi.mock('../../../modules/auth/repositories/historialMedicoRepositorie')

describe('HistorialMedicoService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('createHistorialMedico', () => {
        it('should call repository createHistorial and return result', async () => {
            const payload = { diagnostico: 'Saludable', fecha: '2024-01-01' }
            const mockResponse = { id: 1, ...payload }
            historialMedicoRepository.createHistorial.mockResolvedValue(mockResponse)

            const result = await historialMedicoService.createHistorialMedico(payload)

            expect(historialMedicoRepository.createHistorial).toHaveBeenCalledWith(payload)
            expect(result).toEqual(mockResponse)
        })

        it('should propagate errors from repository', async () => {
            const error = new Error('Repository Error')
            historialMedicoRepository.createHistorial.mockRejectedValue(error)

            await expect(historialMedicoService.createHistorialMedico({})).rejects.toThrow('Repository Error')
        })
    })

    describe('getAllHistoriales', () => {
        it('should call repository getAllHistoriales and return result', async () => {
            const mockData = [{ id: 1, diagnostico: 'Saludable' }]
            historialMedicoRepository.getAllHistoriales.mockResolvedValue(mockData)

            const result = await historialMedicoService.getAllHistoriales()

            expect(historialMedicoRepository.getAllHistoriales).toHaveBeenCalled()
            expect(result).toEqual(mockData)
        })

        it('should propagate errors from repository', async () => {
            const error = new Error('Repository Error')
            historialMedicoRepository.getAllHistoriales.mockRejectedValue(error)

            await expect(historialMedicoService.getAllHistoriales()).rejects.toThrow('Repository Error')
        })
    })

    describe('getMyHistorial', () => {
        it('should call repository getMyHistorial and return result', async () => {
            const mockData = { id: 1, diagnostico: 'Saludable' }
            historialMedicoRepository.getMyHistorial.mockResolvedValue(mockData)

            const result = await historialMedicoService.getMyHistorial()

            expect(historialMedicoRepository.getMyHistorial).toHaveBeenCalled()
            expect(result).toEqual(mockData)
        })

        it('should propagate errors from repository', async () => {
            const error = new Error('Repository Error')
            historialMedicoRepository.getMyHistorial.mockRejectedValue(error)

            await expect(historialMedicoService.getMyHistorial()).rejects.toThrow('Repository Error')
        })
    })

    describe('getHistorialByExternalId', () => {
        it('should call repository getHistorialByExternalId with externalId', async () => {
            const externalId = 'ext-123'
            const mockData = { id: 1, diagnostico: 'Saludable' }
            historialMedicoRepository.getHistorialByExternalId.mockResolvedValue(mockData)

            const result = await historialMedicoService.getHistorialByExternalId(externalId)

            expect(historialMedicoRepository.getHistorialByExternalId).toHaveBeenCalledWith(externalId)
            expect(result).toEqual(mockData)
        })

        it('should propagate errors from repository', async () => {
            const error = new Error('Repository Error')
            historialMedicoRepository.getHistorialByExternalId.mockRejectedValue(error)

            await expect(historialMedicoService.getHistorialByExternalId('ext-123')).rejects.toThrow('Repository Error')
        })
    })

    describe('updateHistorial', () => {
        it('should call repository updateHistorial with externalId and payload', async () => {
            const externalId = 'ext-123'
            const payload = { diagnostico: 'Actualizado' }
            const mockResponse = { id: 1, ...payload }
            historialMedicoRepository.updateHistorial.mockResolvedValue(mockResponse)

            const result = await historialMedicoService.updateHistorial(externalId, payload)

            expect(historialMedicoRepository.updateHistorial).toHaveBeenCalledWith(externalId, payload)
            expect(result).toEqual(mockResponse)
        })

        it('should propagate errors from repository', async () => {
            const error = new Error('Repository Error')
            historialMedicoRepository.updateHistorial.mockRejectedValue(error)

            await expect(historialMedicoService.updateHistorial('ext-123', {})).rejects.toThrow('Repository Error')
        })
    })
})
