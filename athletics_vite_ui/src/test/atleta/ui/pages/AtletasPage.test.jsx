import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AthletesTable from '../../../../modules/atleta/ui/pages/atletlas'
import adminService from '../../../../modules/admin/services/adminService'

// Mocks
vi.mock('../../../../modules/admin/services/adminService')

// Mock child components that might cause issues or aren't the focus
vi.mock('../../../../modules/atleta/ui/widgets/atletasModal', () => ({
    default: ({ onClose }) => <div data-testid="edit-user-modal"><button onClick={onClose}>Close</button></div>
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
    })

    const mockUsersResponse = {
        users: [
            {
                id: 1,
                username: 'athlete1',
                role: 'ATLETA',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                is_active: true,
                identificacion: '1234567890'
            },
            {
                id: 2,
                username: 'admin1',
                role: 'ADMIN', // Should be filtered out
                first_name: 'Admin',
                last_name: 'User',
                email: 'admin@example.com'
            }
        ]
    }

    it('renders loading state initially', () => {
        // Return a promise that never resolves immediately to test loading state
        adminService.getUsers.mockReturnValue(new Promise(() => { }))
        render(<AthletesTable />)
        // Check for loading spinner or text (based on implementation)
        // The component has: <div className="animate-spin ...">
        // Testing for class might be brittle, but we can look for the container structure or assume implementation detail
        const spinner = document.querySelector('.animate-spin')
        expect(spinner).toBeInTheDocument()
    })

    it('renders athletes list after loading', async () => {
        adminService.getUsers.mockResolvedValue(mockUsersResponse)

        render(<AthletesTable />)

        await waitFor(() => {
            expect(screen.getByText('athlete1')).toBeInTheDocument()
            expect(screen.getByText('John')).toBeInTheDocument()
            expect(screen.queryByText('admin1')).not.toBeInTheDocument() // Admin should be filtered
        })
    })

    it('handles error state', async () => {
        adminService.getUsers.mockRejectedValue(new Error('Failed to fetch'))

        render(<AthletesTable />)

        await waitFor(() => {
            expect(screen.getByText(/no se pudo cargar la lista de atletas/i)).toBeInTheDocument()
        })
    })

    it('filters athletes by search term', async () => {
        adminService.getUsers.mockResolvedValue(mockUsersResponse)
        render(<AthletesTable />)

        await waitFor(() => {
            expect(screen.getByText('athlete1')).toBeInTheDocument()
        })

        const searchInput = screen.getByPlaceholderText(/buscar/i)
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

        await waitFor(() => {
            expect(screen.queryByText('athlete1')).not.toBeInTheDocument()
        })

        fireEvent.change(searchInput, { target: { value: 'John' } })
        await waitFor(() => {
            expect(screen.getByText('athlete1')).toBeInTheDocument()
        })
    })

    it('opens modal on create/edit', async () => {
        adminService.getUsers.mockResolvedValue(mockUsersResponse)
        render(<AthletesTable />)

        await waitFor(() => expect(screen.getByText('athlete1')).toBeInTheDocument())

        // Click create button
        fireEvent.click(screen.getByText(/nuevo atleta/i))
        expect(screen.getByTestId('edit-user-modal')).toBeInTheDocument()

        // Close modal
        fireEvent.click(screen.getByText('Close'))
        expect(screen.queryByTestId('edit-user-modal')).not.toBeInTheDocument()

        // Click edit button for athlete1
        const editButtons = screen.getAllByText('Editar')
        fireEvent.click(editButtons[0])

        expect(screen.getByTestId('edit-user-modal')).toBeInTheDocument()
        // Here we could verify that the modal received the user data if we had access to props,
        // but since it's mocked, we at least verify it opens.
    })
})
