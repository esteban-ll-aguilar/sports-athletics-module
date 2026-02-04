import { describe, it, expect, vi, beforeEach } from 'vitest'
import registroPruebaCompetenciaService from '../../../modules/competencia/services/registro_prueba_service'
import registroPruebaCompetenciaRepository from '../../../modules/competencia/repositories/registro_prueba_repository'

vi.mock('../../../modules/competencia/repositories/registro_prueba_repository')

describe('RegistroPruebaCompetenciaService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getAll', () => {
        it('should call repository getAll and return response.data.data', async () => {
            const mockData = [{ id: 1, nombre: 'Registro 1' }]
            registroPruebaCompetenciaRepository.getAll.mockResolvedValue({
                data: { data: mockData }
            })

            const result = await registroPruebaCompetenciaService.getAll()

            expect(registroPruebaCompetenciaRepository.getAll).toHaveBeenCalled()
            expect(result).toEqual(mockData)
        })
    })

    describe('getByExternalId', () => {
        it('should call repository getByExternalId and return response.data.data', async () => {
            const externalId = 'ext-123'
            const mockData = { id: 1, nombre: 'Registro 1' }
            registroPruebaCompetenciaRepository.getByExternalId.mockResolvedValue({
                data: { data: mockData }
            })

            const result = await registroPruebaCompetenciaService.getByExternalId(externalId)

            expect(registroPruebaCompetenciaRepository.getByExternalId).toHaveBeenCalledWith(externalId)
            expect(result).toEqual(mockData)
        })
    })

    describe('create', () => {
        it('should call repository create and return response.data.data', async () => {
            const newData = { nombre: 'Nuevo Registro' }
            const mockResponse = { id: 1, ...newData }
            registroPruebaCompetenciaRepository.create.mockResolvedValue({
                data: { data: mockResponse }
            })

            const result = await registroPruebaCompetenciaService.create(newData)

            expect(registroPruebaCompetenciaRepository.create).toHaveBeenCalledWith(newData)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('update', () => {
        it('should call repository update and return response.data.data', async () => {
            const externalId = 'ext-123'
            const updateData = { nombre: 'Registro Actualizado' }
            const mockResponse = { id: 1, ...updateData }
            registroPruebaCompetenciaRepository.update.mockResolvedValue({
                data: { data: mockResponse }
            })

            const result = await registroPruebaCompetenciaService.update(externalId, updateData)

            expect(registroPruebaCompetenciaRepository.update).toHaveBeenCalledWith(externalId, updateData)
            expect(result).toEqual(mockResponse)
        })
    })
})
