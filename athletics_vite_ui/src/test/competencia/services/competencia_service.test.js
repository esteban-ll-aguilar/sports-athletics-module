import { describe, it, expect, vi, beforeEach } from 'vitest'
import competenciaService from '../../../modules/competencia/services/competencia_service'
import competenciaRepository from '../../../modules/competencia/repositories/competencia_repositorio'

vi.mock('../../../modules/competencia/repositories/competencia_repositorio')

describe('CompetenciaService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getAll', () => {
        it('should return data when repository returns object with data property', async () => {
            const mockData = [{ id: 1, nombre: 'Competencia 1' }]
            // Service expects response.data to be the array or object containing items
            competenciaRepository.getAll.mockResolvedValue({ data: mockData })

            const result = await competenciaService.getAll()

            expect(competenciaRepository.getAll).toHaveBeenCalled()
            expect(result).toEqual(mockData)
        })
    })

    describe('getById', () => {
        it('should return single competency by id', async () => {
            const mockItem = { id: 1, nombre: 'Competencia 1' }
            // Service accesses response.data
            competenciaRepository.getById.mockResolvedValue({ data: mockItem })

            const result = await competenciaService.getById(1)

            expect(competenciaRepository.getById).toHaveBeenCalledWith(1)
            expect(result).toEqual(mockItem)
        })
    })

    describe('create', () => {
        it('should call repository create with correct data', async () => {
            const newItem = { nombre: 'Nueva Competencia' }
            // Service accesses response.data
            competenciaRepository.create.mockResolvedValue({ data: newItem })

            const result = await competenciaService.create(newItem)

            expect(competenciaRepository.create).toHaveBeenCalledWith(newItem)
            expect(result).toEqual(newItem)
        })
    })

    describe('update', () => {
        it('should call repository update with correct arguments', async () => {
            const updateData = { nombre: 'Actualizada' }
            // Service accesses response.data
            competenciaRepository.update.mockResolvedValue({ data: true })

            const result = await competenciaService.update(1, updateData)

            expect(competenciaRepository.update).toHaveBeenCalledWith(1, updateData)
            expect(result).toBe(true)
        })
    })

    describe('delete', () => {
        it('should call repository delete', async () => {
            // Service accesses response.data
            competenciaRepository.delete.mockResolvedValue({ data: true })

            const result = await competenciaService.delete(1)

            expect(competenciaRepository.delete).toHaveBeenCalledWith(1)
            expect(result).toBe(true)
        })
    })
})
