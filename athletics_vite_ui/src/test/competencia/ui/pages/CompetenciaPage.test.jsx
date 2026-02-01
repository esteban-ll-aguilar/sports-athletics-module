import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CompetenciasPage from '../../../../modules/competencia/ui/pages/CompetenciaPage'
import competenciaService from '../../../../modules/competencia/services/competencia_service'
import { BrowserRouter } from 'react-router-dom'
import Swal from 'sweetalert2'

// Mocks
vi.mock('sweetalert2', () => ({
    default: {
        fire: vi.fn()
    }
}))
vi.mock('../../../../modules/competencia/services/competencia_service')

vi.mock('../../../../modules/competencia/ui/widgets/CompetenciaModal', () => ({
    default: ({ isOpen, onClose, onSubmit, editingCompetencia }) => {
        if (!isOpen) return null;
        return (
            <div data-testid="competencia-modal">
                <button onClick={onClose}>Cancelar</button>
                <button onClick={() => onSubmit({ nombre: 'Nueva Competencia Mock' })}>Guardar</button>
            </div>
        )
    }
}))

describe('CompetenciasPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const mockCompetencias = [
        {
            external_id: '1',
            nombre: 'Competencia 1',
            fecha: '2023-01-01',
            lugar: 'Lugar 1',
            estado: true
        },
        {
            external_id: '2',
            nombre: 'Competencia 2',
            fecha: '2023-02-01',
            lugar: 'Lugar 2',
            estado: false
        }
    ]

    const renderComponent = () => {
        render(
            <BrowserRouter>
                <CompetenciasPage />
            </BrowserRouter>
        )
    }

    it('renders loading state initially', () => {
        competenciaService.getAll.mockReturnValue(new Promise(() => { }))
        renderComponent()
        expect(screen.getByText(/cargando competencias/i)).toBeInTheDocument()
    })

    it('renders competencies list', async () => {
        competenciaService.getAll.mockResolvedValue(mockCompetencias)
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Competencia 1')).toBeInTheDocument()
            expect(screen.getByText('Competencia 2')).toBeInTheDocument()
        })
    })

    it('handles search filtering', async () => {
        competenciaService.getAll.mockResolvedValue(mockCompetencias)
        renderComponent()

        await waitFor(() => expect(screen.getByText('Competencia 1')).toBeInTheDocument())

        const searchInput = screen.getByPlaceholderText(/buscar por nombre/i)
        fireEvent.change(searchInput, { target: { value: 'Lugar 2' } })

        await waitFor(() => {
            expect(screen.queryByText('Competencia 1')).not.toBeInTheDocument()
            expect(screen.getByText('Competencia 2')).toBeInTheDocument()
        })
    })

    it('opens modal for new competency', async () => {
        competenciaService.getAll.mockResolvedValue([])
        renderComponent()

        await waitFor(() => expect(screen.getByText(/no hay competencias/i)).toBeInTheDocument())

        fireEvent.click(screen.getByText(/nueva competencia/i))
        expect(screen.getByTestId('competencia-modal')).toBeInTheDocument()
    })

    it('handles status toggle', async () => {
        competenciaService.getAll.mockResolvedValue(mockCompetencias)
        competenciaService.update.mockResolvedValue({ ...mockCompetencias[0], estado: false })

        // Mock confirm
        Swal.fire.mockResolvedValue({ isConfirmed: true })

        renderComponent()

        await waitFor(() => expect(screen.getByText('Activo')).toBeInTheDocument())

        // Find button to deactivate (Activo status -> button title is "Desactivar")
        const deactivateButton = screen.getAllByTitle('Desactivar')[0]
        fireEvent.click(deactivateButton)

        await waitFor(() => {
            expect(competenciaService.update).toHaveBeenCalledWith('1', { ...mockCompetencias[0], estado: false })
        })
    })

    it('opens modal to edit competency', async () => {
        competenciaService.getAll.mockResolvedValue(mockCompetencias)
        renderComponent()

        await waitFor(() => expect(screen.getByText('Competencia 1')).toBeInTheDocument())

        const editButton = screen.getAllByTitle('Editar')[0]
        fireEvent.click(editButton)

        expect(screen.getByTestId('competencia-modal')).toBeInTheDocument()
    })
})
