import { describe, it, expect, vi, beforeEach } from 'vitest'
import pruebaService from '../../../modules/competencia/services/prueba_service'
import pruebaRepository from '../../../modules/competencia/repositories/prueba_repository'

vi.mock('../../../modules/competencia/repositories/prueba_repository')

describe('PruebaService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getAll', () => {
        it('should return items when repository returns object with data.items property', async () => {
            const mockData = [
                { id: 1, nombre: 'Prueba 100m', tipo: 'VELOCIDAD' }
            ]

            pruebaRepository.getAll.mockResolvedValue({
                data: { items: mockData }
            })

            const result = await pruebaService.getAll()

            expect(pruebaRepository.getAll).toHaveBeenCalled()
            expect(result).toEqual(mockData)
        })

        it('should return data directly when repository returns object with data property only', async () => {
            const mockData = [
                { id: 1, nombre: 'Prueba 200m', tipo: 'VELOCIDAD' }
            ]

            pruebaRepository.getAll.mockResolvedValue({
                data: mockData
            })

            const result = await pruebaService.getAll()

            expect(pruebaRepository.getAll).toHaveBeenCalled()
            expect(result).toEqual(mockData)
        })
    })

    describe('create', () => {
        it('should call repository create with correct data and return response.data', async () => {
            const newPrueba = {
                nombre: 'Prueba Salto Largo',
                tipo: 'SALTO'
            }
            const mockResponse = { id: 1, ...newPrueba }

            pruebaRepository.create.mockResolvedValue({ data: mockResponse })

            const result = await pruebaService.create(newPrueba)

            expect(pruebaRepository.create).toHaveBeenCalledWith(newPrueba)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('update', () => {
        it('should call repository update with correct arguments and return response.data', async () => {
            const updateData = {
                nombre: 'Prueba Actualizada',
                tipo: 'RESISTENCIA'
            }
            const mockResponse = { id: 1, ...updateData }

            pruebaRepository.update.mockResolvedValue({ data: mockResponse })

            const result = await pruebaService.update(1, updateData)

            expect(pruebaRepository.update).toHaveBeenCalledWith(1, updateData)
            expect(result).toEqual(mockResponse)
        })
    })
})
