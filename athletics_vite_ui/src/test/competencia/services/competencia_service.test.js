import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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
            competenciaRepository.getAll.mockResolvedValue({ data: mockData })

            const result = await competenciaService.getAll()

            expect(competenciaRepository.getAll).toHaveBeenCalled()
            expect(result).toEqual(mockData)
        })

        it('should return data directly when repository returns array', async () => {
            const mockData = [{ id: 1, nombre: 'Competencia 1' }]
            competenciaRepository.getAll.mockResolvedValue(mockData)

            const result = await competenciaService.getAll()

            expect(competenciaRepository.getAll).toHaveBeenCalled()
            expect(result).toEqual(mockData)
        })
    })

    describe('getById', () => {
        it('should return single competency by id', async () => {
            const mockItem = { id: 1, nombre: 'Competencia 1' }
            competenciaRepository.getById.mockResolvedValue({ data: mockItem })

            const result = await competenciaService.getById(1)

            expect(competenciaRepository.getById).toHaveBeenCalledWith(1)
            expect(result).toEqual(mockItem)
        })
    })

    describe('create', () => {
        it('should call repository create with correct data', async () => {
            const newItem = { nombre: 'Nueva Competencia' }
            competenciaRepository.create.mockResolvedValue(newItem)

            const result = await competenciaService.create(newItem)

            expect(competenciaRepository.create).toHaveBeenCalledWith(newItem)
            expect(result).toEqual(newItem)
        })
    })

    describe('update', () => {
        it('should call repository update with correct arguments', async () => {
            const updateData = { nombre: 'Actualizada' }
            competenciaRepository.update.mockResolvedValue(true)

            const result = await competenciaService.update(1, updateData)

            expect(competenciaRepository.update).toHaveBeenCalledWith(1, updateData)
            expect(result).toBe(true)
        })
    })

    describe('delete', () => {
        it('should call repository delete', async () => {
            competenciaRepository.delete.mockResolvedValue(true)

            const result = await competenciaService.delete(1)

            expect(competenciaRepository.delete).toHaveBeenCalledWith(1)
            expect(result).toBe(true)
        })
    })
})
