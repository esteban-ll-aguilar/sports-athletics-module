import { describe, it, expect, vi, beforeEach } from 'vitest'
import tipoDisciplinaService from '../../../modules/competencia/services/tipo_disciplina_service'
import tipoDisciplinaRepository from '../../../modules/competencia/repositories/tipo_disciplina_repository'

vi.mock('../../../modules/competencia/repositories/tipo_disciplina_repository')

describe('TipoDisciplinaService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getAll', () => {
        it('should return items when repository returns object with data.items property', async () => {
            const mockData = [
                { id: 1, nombre: 'Atletismo', descripcion: 'Deportes de pista' }
            ]

            tipoDisciplinaRepository.getAll.mockResolvedValue({
                data: { items: mockData }
            })

            const result = await tipoDisciplinaService.getAll()

            expect(tipoDisciplinaRepository.getAll).toHaveBeenCalled()
            expect(result).toEqual(mockData)
        })

        it('should return data directly when repository returns object with data property only', async () => {
            const mockData = [
                { id: 1, nombre: 'Natación', descripcion: 'Deportes acuáticos' }
            ]

            tipoDisciplinaRepository.getAll.mockResolvedValue({
                data: mockData
            })

            const result = await tipoDisciplinaService.getAll()

            expect(tipoDisciplinaRepository.getAll).toHaveBeenCalled()
            expect(result).toEqual(mockData)
        })
    })

    describe('create', () => {
        it('should call repository create with correct data and return response.data', async () => {
            const newTipoDisciplina = {
                nombre: 'Ciclismo',
                descripcion: 'Deportes de bicicleta'
            }
            const mockResponse = { id: 1, ...newTipoDisciplina }

            tipoDisciplinaRepository.create.mockResolvedValue({ data: mockResponse })

            const result = await tipoDisciplinaService.create(newTipoDisciplina)

            expect(tipoDisciplinaRepository.create).toHaveBeenCalledWith(newTipoDisciplina)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('update', () => {
        it('should call repository update with correct arguments and return response.data', async () => {
            const updateData = {
                nombre: 'Gimnasia Actualizada',
                descripcion: 'Deportes de flexibilidad'
            }
            const mockResponse = { id: 1, ...updateData }

            tipoDisciplinaRepository.update.mockResolvedValue({ data: mockResponse })

            const result = await tipoDisciplinaService.update(1, updateData)

            expect(tipoDisciplinaRepository.update).toHaveBeenCalledWith(1, updateData)
            expect(result).toEqual(mockResponse)
        })
    })
})
