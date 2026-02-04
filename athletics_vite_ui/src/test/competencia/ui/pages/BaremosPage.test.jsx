import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import BaremosPage from '../../../../modules/competencia/ui/pages/BaremosPage'
import baremoService from '../../../../modules/competencia/services/baremo_service'
import pruebaService from '../../../../modules/competencia/services/prueba_service'
import Swal from 'sweetalert2'

// Mocks
vi.mock('../../../../modules/competencia/services/baremo_service')
vi.mock('../../../../modules/competencia/services/prueba_service')
vi.mock('sweetalert2', () => ({
    default: {
        fire: vi.fn()
    }
}))

vi.mock('../../../../modules/competencia/ui/widgets/BaremoModal', () => ({
    default: ({ isOpen, onClose, onSubmit, editingBaremo }) => {
        if (!isOpen) return null
        return (
            <div data-testid="baremo-modal">
                <button onClick={onClose}>Cancelar</button>
                <button onClick={() => onSubmit({
                    prueba_id: 'p1',
                    sexo: 'M',
                    edad_min: 10,
                    edad_max: 12,
                    estado: true
                })}>
                    Guardar
                </button>
            </div>
        )
    }
}))

const mockBaremos = [
    {
        external_id: '1',
        prueba_id: 'p1',
        sexo: 'M',
        edad_min: 18,
        edad_max: 25,
        items: [],
        estado: true
    },
    {
        external_id: '2',
        prueba_id: 'p2',
        sexo: 'F',
        edad_min: 20,
        edad_max: 30,
        items: [1, 2],
        estado: false
    }
]

describe('BaremosPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        baremoService.getAll.mockResolvedValue(mockBaremos)
    })

    const mockPruebas = [
        { external_id: 'p1', nombre: '100m', tipo_medicion: 'TIEMPO' },
        { external_id: 'p2', nombre: 'Salto', tipo_medicion: 'METROS' }
    ]

    const renderComponent = () => {
        render(
            <BrowserRouter>
                <BaremosPage />
            </BrowserRouter>
        )
    }

    it('renders loading state initially', () => {
        baremoService.getAll.mockReturnValue(new Promise(() => { }))
        pruebaService.getAll.mockReturnValue(new Promise(() => { }))
        renderComponent()

        expect(screen.getByText(/cargando baremos/i)).toBeInTheDocument()
    })

    it('renders baremos list', async () => {
        baremoService.getAll.mockResolvedValue(mockBaremos)
        pruebaService.getAll.mockResolvedValue(mockPruebas)
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Baremo Simple')).toBeInTheDocument()
            expect(screen.getByText('Baremo Compuesto')).toBeInTheDocument()
            expect(screen.getAllByText('Masculino').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Femenino').length).toBeGreaterThan(0)
            expect(screen.getByText('18 - 25 años')).toBeInTheDocument()
        })
    })

    it('shows empty state when no baremos exist', async () => {
        baremoService.getAll.mockResolvedValue([])
        pruebaService.getAll.mockResolvedValue(mockPruebas)
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText(/no hay baremos registrados/i)).toBeInTheDocument()
        })
    })

    it('opens modal to create new baremo', async () => {
        baremoService.getAll.mockResolvedValue([])
        pruebaService.getAll.mockResolvedValue(mockPruebas)
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText(/no hay baremos registrados/i)).toBeInTheDocument()
        })

        // The button text is 'Agregar Ítems', not 'Añadir Baremo'
        fireEvent.click(screen.getByText((content) => content.toLowerCase().includes('agregar ítems')))
        expect(screen.getByTestId('baremo-modal')).toBeInTheDocument()
    })

    it('opens modal to edit baremo', async () => {
        baremoService.getAll.mockResolvedValue(mockBaremos)
        pruebaService.getAll.mockResolvedValue(mockPruebas)
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Baremo Simple')).toBeInTheDocument()
        })

        const editButton = screen.getAllByTitle('Editar')[0]
        fireEvent.click(editButton)

        expect(screen.getByTestId('baremo-modal')).toBeInTheDocument()
    })

    it('handles status toggle', async () => {
        baremoService.getAll.mockResolvedValue(mockBaremos)
        pruebaService.getAll.mockResolvedValue(mockPruebas)
        baremoService.update.mockResolvedValue(true)

        Swal.fire.mockResolvedValue({ isConfirmed: true })

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
