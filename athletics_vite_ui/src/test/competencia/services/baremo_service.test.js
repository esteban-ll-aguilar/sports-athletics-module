import { describe, it, expect, vi, beforeEach } from 'vitest'
import baremoService from '../../../modules/competencia/services/baremo_service'
import baremoRepository from '../../../modules/competencia/repositories/baremo_repository'

vi.mock('../../../modules/competencia/repositories/baremo_repository')

describe('BaremoService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getAll', () => {
        it('should return items when repository returns object with data.items property', async () => {
            const mockData = [
                { id: 1, nombre: 'Baremo 1', descripcion: 'Test' }
            ]

            baremoRepository.getAll.mockResolvedValue({
                data: { items: mockData }
            })

            const result = await baremoService.getAll()

            expect(baremoRepository.getAll).toHaveBeenCalled()
            expect(result).toEqual(mockData)
        })

        it('should return data directly when repository returns object with data property only', async () => {
            const mockData = [
                { id: 1, nombre: 'Baremo 1', descripcion: 'Test' }
            ]

            baremoRepository.getAll.mockResolvedValue({
                data: mockData
            })

            const result = await baremoService.getAll()

            expect(baremoRepository.getAll).toHaveBeenCalled()
            expect(result).toEqual(mockData)
        })
    })

    describe('create', () => {
        it('should call repository create with correct data and return response.data', async () => {
            const newBaremo = {
                nombre: 'Nuevo Baremo',
                descripcion: 'Test'
            }
            const mockResponse = { id: 1, ...newBaremo }

            baremoRepository.create.mockResolvedValue({ data: mockResponse })

            const result = await baremoService.create(newBaremo)

            expect(baremoRepository.create).toHaveBeenCalledWith(newBaremo)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('update', () => {
        it('should call repository update with correct arguments and return response.data', async () => {
            const updateData = {
                nombre: 'Baremo Actualizado',
                descripcion: 'Updated'
            }
            const mockResponse = { id: 1, ...updateData }

            baremoRepository.update.mockResolvedValue({ data: mockResponse })

            const result = await baremoService.update(1, updateData)

            expect(baremoRepository.update).toHaveBeenCalledWith(1, updateData)
            expect(result).toEqual(mockResponse)
        })
    })
})
