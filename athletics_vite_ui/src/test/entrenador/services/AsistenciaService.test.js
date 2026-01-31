import { describe, it, expect, vi, beforeEach } from 'vitest'
import AsistenciaService from '../../../modules/entrenador/services/AsistenciaService'
import ApiClient from '../../../core/api/apiClient'

vi.mock('../../../core/api/apiClient')

describe('AsistenciaService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('inscribirAtleta', () => {
        it('should call ApiClient.post with correct endpoint and payload', async () => {
            const payload = { atletaId: 1, horarioId: 2 }
            const mockResponse = { success: true }
            ApiClient.post.mockResolvedValue(mockResponse)

            const result = await AsistenciaService.inscribirAtleta(payload)

            expect(ApiClient.post).toHaveBeenCalledWith('/entrenador/asistencias/inscripcion', payload)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('listarInscritos', () => {
        it('should call ApiClient.get with correct endpoint and horarioId', async () => {
            const horarioId = 123
            const mockData = [{ id: 1, nombre: 'Atleta 1' }]
            ApiClient.get.mockResolvedValue(mockData)

            const result = await AsistenciaService.listarInscritos(horarioId)

            expect(ApiClient.get).toHaveBeenCalledWith(`/entrenador/asistencias/inscripcion/horario/${horarioId}`)
            expect(result).toEqual(mockData)
        })
    })

    describe('registrarAsistencia', () => {
        it('should call ApiClient.post with correct endpoint and payload', async () => {
            const payload = { atletaId: 1, fecha: '2024-01-01', presente: true }
            const mockResponse = { success: true }
            ApiClient.post.mockResolvedValue(mockResponse)

            const result = await AsistenciaService.registrarAsistencia(payload)

            expect(ApiClient.post).toHaveBeenCalledWith('/entrenador/asistencias/registro', payload)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('eliminarInscripcion', () => {
        it('should call ApiClient.delete with correct endpoint and registroId', async () => {
            const registroId = 123
            ApiClient.delete.mockResolvedValue({ success: true })

            const result = await AsistenciaService.eliminarInscripcion(registroId)

            expect(ApiClient.delete).toHaveBeenCalledWith(`/entrenador/asistencias/inscripcion/${registroId}`)
            expect(result).toEqual({ success: true })
        })
    })

    describe('confirmarAsistencia', () => {
        it('should call ApiClient.post with correct endpoint, registroId and fecha', async () => {
            const registroId = 123
            const fecha = '2024-01-01'
            const mockResponse = { success: true }
            ApiClient.post.mockResolvedValue(mockResponse)

            const result = await AsistenciaService.confirmarAsistencia(registroId, fecha)

            expect(ApiClient.post).toHaveBeenCalledWith(
                `/entrenador/asistencias/confirmar/${registroId}`,
                null,
                { params: { fecha_entrenamiento: fecha } }
            )
            expect(result).toEqual(mockResponse)
        })
    })

    describe('rechazarAsistencia', () => {
        it('should call ApiClient.post with correct endpoint, registroId and fecha', async () => {
            const registroId = 123
            const fecha = '2024-01-01'
            const mockResponse = { success: true }
            ApiClient.post.mockResolvedValue(mockResponse)

            const result = await AsistenciaService.rechazarAsistencia(registroId, fecha)

            expect(ApiClient.post).toHaveBeenCalledWith(
                `/entrenador/asistencias/rechazar/${registroId}`,
                null,
                { params: { fecha_entrenamiento: fecha } }
            )
            expect(result).toEqual(mockResponse)
        })
    })

    describe('marcarPresente', () => {
        it('should call ApiClient.put with correct endpoint and asistenciaId', async () => {
            const asistenciaId = 123
            const mockResponse = { success: true }
            ApiClient.put.mockResolvedValue(mockResponse)

            const result = await AsistenciaService.marcarPresente(asistenciaId)

            expect(ApiClient.put).toHaveBeenCalledWith(`/entrenador/asistencias/marcar-presente/${asistenciaId}`)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('marcarAusente', () => {
        it('should call ApiClient.put with correct endpoint and asistenciaId', async () => {
            const asistenciaId = 123
            const mockResponse = { success: true }
            ApiClient.put.mockResolvedValue(mockResponse)

            const result = await AsistenciaService.marcarAusente(asistenciaId)

            expect(ApiClient.put).toHaveBeenCalledWith(`/entrenador/asistencias/marcar-ausente/${asistenciaId}`)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('obtenerMisRegistros', () => {
        it('should call ApiClient.get with correct endpoint and atletaId', async () => {
            const atletaId = 123
            const mockData = [{ id: 1, fecha: '2024-01-01' }]
            ApiClient.get.mockResolvedValue(mockData)

            const result = await AsistenciaService.obtenerMisRegistros(atletaId)

            expect(ApiClient.get).toHaveBeenCalledWith('/entrenador/asistencias/mis-registros', {
                atleta_id: atletaId
            })
            expect(result).toEqual(mockData)
        })
    })

    describe('getTodayDate', () => {
        it('should return today date in YYYY-MM-DD format', () => {
            const result = AsistenciaService.getTodayDate()
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        })
    })

    describe('getCurrentTime', () => {
        it('should return current time in HH:MM:SS format', () => {
            const result = AsistenciaService.getCurrentTime()
            expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/)
        })
    })
})
