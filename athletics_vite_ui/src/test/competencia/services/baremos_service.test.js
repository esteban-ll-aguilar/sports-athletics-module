import { describe, it, expect, vi, beforeEach } from 'vitest'
import baremoService from '../../../modules/baremo/services/baremo_service'
import baremoRepository from '../../../modules/baremo/repositories/baremo_repository'

vi.mock('../../../modules/baremo/repositories/baremo_repository')

describe('BaremoService', () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getAll', () => {
        it('should return data when repository returns object with data property', async () => {
            const mockData = [
                { id: 1, nombre: 'Baremo 1', puntaje: 10 }
            ]

            baremoRepository.getAll.mockResolvedValue({ data: mockData })

            const result = await baremoService.getAll()

            expect(baremoRepository.getAll).toHaveBeenCalled()
            expect(result).toEqual(mockData)
        })

        it('should return data directly when repository returns array', async () => {
            const mockData = [
                { id: 1, nombre: 'Baremo 1', puntaje: 10 }
            ]

            baremoRepository.getAll.mockResolvedValue(mockData)

            const result = await baremoService.getAll()

            expect(baremoRepository.getAll).toHaveBeenCalled()
            expect(result).toEqual(mockData)
        })
    })

    describe('create', () => {
        it('should call repository create with correct data', async () => {
            const newBaremo = {
                nombre: 'Nuevo Baremo',
                puntaje: 20
            }

            baremoRepository.create.mockResolvedValue(newBaremo)

            const result = await baremoService.create(newBaremo)

            expect(baremoRepository.create).toHaveBeenCalledWith(newBaremo)
            expect(result).toEqual(newBaremo)
        })
    })

    describe('update', () => {
        it('should call repository update with correct arguments', async () => {
            const updateData = {
                nombre: 'Baremo Actualizado',
                puntaje: 30
            }

            baremoRepository.update.mockResolvedValue(true)

            const result = await baremoService.update(1, updateData)

            expect(baremoRepository.update).toHaveBeenCalledWith(1, updateData)
            expect(result).toBe(true)
        })
    })

})
