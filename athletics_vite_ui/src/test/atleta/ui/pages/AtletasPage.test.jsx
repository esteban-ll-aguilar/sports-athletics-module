import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AthletesTable from '../../../../modules/atleta/ui/pages/atletlas'
import AtletaService from '../../../../modules/atleta/services/AtletaService'

// Mocks
vi.mock('../../../../modules/atleta/services/AtletaService')

// Mock the `RegisterPage` used as the modal so tests can control its markup
vi.mock('../../../../modules/auth/ui/pages/RegisterPage', () => ({
    default: ({ onClose }) => (
        <div>
            <button aria-label="Cerrar modal" onClick={onClose}>Close</button>
        </div>
    )
}))

// Mock Swal
vi.mock('sweetalert2', () => ({
    default: {
        fire: vi.fn()
    }
}))

// Mock jsPDF and autoTable
vi.mock('jspdf', () => ({
    default: vi.fn().mockImplementation(() => ({
        text: vi.fn(),
        save: vi.fn()
    }))
}))
vi.mock('jspdf-autotable', () => ({ default: vi.fn() }))

describe('AthletesTable', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        AtletaService.getAthletes.mockResolvedValue(mockAthletesResponse)
    })

    const mockAthletesResponse = [
        {
            id: 1,
            username: 'athlete1',
            role: 'ATLETA',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            is_active: true,
            identificacion: '1234567890',
            tipo_identificacion: 'CEDULA',
            tipo_estamento: 'ESTUDIANTES',
            phone: '0999999999',
            direccion: 'Calle 123'
        },
        {
            id: 2,
            username: 'athlete2',
            role: 'ATLETA',
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane@example.com',
            is_active: false,
            identificacion: '0987654321',
            tipo_identificacion: 'CEDULA',
            tipo_estamento: 'EXTERNOS',
            phone: '0988888888',
            direccion: 'Avenida 456'
        }
    ]

    it('renders loading state initially', () => {
        // Return a promise that never resolves immediately to test loading state
        AtletaService.getAthletes.mockReturnValue(new Promise(() => { }))
        render(
            <MemoryRouter>
                <AthletesTable />
            </MemoryRouter>
        )
        const spinner = document.querySelector('.animate-spin')
        expect(spinner).toBeInTheDocument()
    })

    it('renders athletes list after loading', async () => {
        render(
            <MemoryRouter>
                <AthletesTable />
            </MemoryRouter>
        )
        await waitFor(() => {
            expect(screen.getByText((content) => content.includes('athlete1'))).toBeInTheDocument()
            expect(screen.getByText((content) => content.includes('John'))).toBeInTheDocument()
            expect(screen.getByText((content) => content.includes('athlete2'))).toBeInTheDocument()
        })
    })

    it('filters athletes by search term', async () => {
        render(
            <MemoryRouter>
                <AthletesTable />
            </MemoryRouter>
        )
        await waitFor(() => {
            expect(screen.getByText((content) => content.includes('athlete1'))).toBeInTheDocument()
        })
        const searchInput = screen.getByPlaceholderText(/buscar/i)
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
        await waitFor(() => {
            expect(screen.queryByText((content) => content.includes('athlete1'))).not.toBeInTheDocument()
        })
        fireEvent.change(searchInput, { target: { value: 'John' } })
        await waitFor(() => {
            expect(screen.getByText((content) => content.includes('athlete1'))).toBeInTheDocument()
        })
    })

    it('opens modal on edit', async () => {
        render(
            <MemoryRouter>
                <AthletesTable />
            </MemoryRouter>
        )

        await waitFor(() => expect(screen.getByText('athlete1')).toBeInTheDocument())

        // Click edit button for athlete1 (using title attribute)
        const editButtons = screen.getAllByTitle('Editar')
        fireEvent.click(editButtons[0])

        await waitFor(() => {
            expect(screen.getByTestId('edit-user-modal')).toBeInTheDocument()
        })

        // Close modal using the icon button
        fireEvent.click(screen.getByLabelText('Cerrar modal'))
        expect(screen.queryByTestId('edit-user-modal')).not.toBeInTheDocument()
    })
})
