import { describe, it, expect, vi, beforeEach } from 'vitest'
import resultadoCompetenciaService from '../../../modules/competencia/services/resultado_competencia_service'
import resultadoCompetenciaRepository from '../../../modules/competencia/repositories/resultado_competencia_repository'

vi.mock('../../../modules/competencia/repositories/resultado_competencia_repository')

describe('ResultadoCompetenciaService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getAll', () => {
        it('should call repository getAll and return response', async () => {
            const mockData = [{ id: 1, resultado: '10.5s' }]
            resultadoCompetenciaRepository.getAll.mockResolvedValue(mockData)

            const result = await resultadoCompetenciaService.getAll()

            expect(resultadoCompetenciaRepository.getAll).toHaveBeenCalled()
            expect(result).toEqual(mockData)
        })
    })

    describe('getById', () => {
        it('should call repository getById with externalId', async () => {
            const externalId = 'ext-123'
            const mockData = { id: 1, resultado: '10.5s' }
            resultadoCompetenciaRepository.getById.mockResolvedValue(mockData)

            const result = await resultadoCompetenciaService.getById(externalId)

            expect(resultadoCompetenciaRepository.getById).toHaveBeenCalledWith(externalId)
            expect(result).toEqual(mockData)
        })
    })

    describe('getByCompetencia', () => {
        it('should call repository getByCompetencia with competenciaExternalId', async () => {
            const competenciaId = 'comp-123'
            const mockData = [{ id: 1, resultado: '10.5s' }]
            resultadoCompetenciaRepository.getByCompetencia.mockResolvedValue(mockData)

            const result = await resultadoCompetenciaService.getByCompetencia(competenciaId)

            expect(resultadoCompetenciaRepository.getByCompetencia).toHaveBeenCalledWith(competenciaId)
            expect(result).toEqual(mockData)
        })
    })

    describe('create', () => {
        it('should call repository create with data', async () => {
            const newData = { resultado: '10.5s' }
            const mockResponse = { id: 1, ...newData }
            resultadoCompetenciaRepository.create.mockResolvedValue(mockResponse)

            const result = await resultadoCompetenciaService.create(newData)

            expect(resultadoCompetenciaRepository.create).toHaveBeenCalledWith(newData)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('update', () => {
        it('should call repository update and return response.data', async () => {
            const externalId = 'ext-123'
            const updateData = { resultado: '9.8s' }
            const mockResponse = { data: { id: 1, ...updateData } }
            resultadoCompetenciaRepository.update.mockResolvedValue(mockResponse)

            const result = await resultadoCompetenciaService.update(externalId, updateData)

            expect(resultadoCompetenciaRepository.update).toHaveBeenCalledWith(externalId, updateData)
            expect(result).toEqual(mockResponse.data)
        })
    })
})
