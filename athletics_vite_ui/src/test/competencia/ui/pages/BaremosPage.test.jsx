import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import BaremosPage from '../../../../modules/baremo/ui/pages/BaremosPage'
import baremoService from '../../../../modules/baremo/services/baremo_service'

// Mocks
vi.mock('../../../../modules/baremo/services/baremo_service')
vi.mock('../../../../modules/baremo/ui/widgets/BaremoModal', () => ({
    default: ({ isOpen, onClose, onSubmit, editingBaremo }) => {
        if (!isOpen) return null
        return (
            <div data-testid="baremo-modal">
                <button onClick={onClose}>Cancelar</button>
                <button onClick={() => onSubmit({ valor_baremo: 50, clasificacion: 'A', estado: true })}>
                    Guardar
                </button>
            </div>
        )
    }
}))

describe('BaremosPage', () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })

    const mockBaremos = [
        {
            external_id: '1',
            valor_baremo: 10,
            clasificacion: 'A',
            estado: true
        },
        {
            external_id: '2',
            valor_baremo: 5,
            clasificacion: 'B',
            estado: false
        }
    ]

    const renderComponent = () => {
        render(
            <BrowserRouter>
                <BaremosPage />
            </BrowserRouter>
        )
    }

    it('renders loading state initially', () => {
        baremoService.getAll.mockReturnValue(new Promise(() => {}))
        renderComponent()

        expect(screen.getByText(/cargando baremos/i)).toBeInTheDocument()
    })

    it('renders baremos list', async () => {
        baremoService.getAll.mockResolvedValue(mockBaremos)
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('10')).toBeInTheDocument()
            expect(screen.getByText('5')).toBeInTheDocument()
            expect(screen.getByText('Activo')).toBeInTheDocument()
            expect(screen.getByText('Inactivo')).toBeInTheDocument()
        })
    })

    it('shows empty state when no baremos exist', async () => {
        baremoService.getAll.mockResolvedValue([])
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText(/no hay baremos registrados/i)).toBeInTheDocument()
        })
    })

    it('opens modal to create new baremo', async () => {
        baremoService.getAll.mockResolvedValue([])
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText(/no hay baremos registrados/i)).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText(/añadir baremo/i))
        expect(screen.getByTestId('baremo-modal')).toBeInTheDocument()
    })

    it('opens modal to edit baremo', async () => {
        baremoService.getAll.mockResolvedValue(mockBaremos)
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('10')).toBeInTheDocument()
        })

        const editButton = screen.getAllByTitle('Editar')[0]
        fireEvent.click(editButton)

        expect(screen.getByTestId('baremo-modal')).toBeInTheDocument()
    })

    it('handles status toggle', async () => {
        baremoService.getAll.mockResolvedValue(mockBaremos)
        baremoService.update.mockResolvedValue(true)

        global.confirm = vi.fn(() => true)

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Activo')).toBeInTheDocument()
        })

        const deactivateButton = screen.getAllByTitle('Desactivar')[0]
        fireEvent.click(deactivateButton)

        await waitFor(() => {
            expect(baremoService.update).toHaveBeenCalledWith('1', {
                ...mockBaremos[0],
                estado: false
            })
        })
    })

})
