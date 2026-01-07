import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import UserRoleManagementPage from '../../../../modules/admin/ui/pages/UserRoleManagementPage'
import adminService from '../../../../modules/admin/services/adminService'
import * as roleUtils from '../../../../modules/auth/utils/roleUtils'

// Mocks
vi.mock('../../../../modules/admin/services/adminService')
vi.mock('../../../../modules/auth/utils/roleUtils')
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}))

describe('UserRoleManagementPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        roleUtils.getUserEmail.mockReturnValue('admin@test.com')
    })

    const mockUsers = [
        { id: 1, email: 'user1@test.com', username: 'user1', role: 'ATLETA' },
        { id: 2, email: 'user2@test.com', username: 'user2', role: 'ENTRENADOR' }
    ]

    const renderComponent = () => {
        render(<UserRoleManagementPage />)
    }

    it('renders loading state', () => {
        adminService.getUsers.mockReturnValue(new Promise(() => { }))
        renderComponent()
        expect(screen.getByText(/cargando usuarios/i)).toBeInTheDocument()
    })

    it('renders user list', async () => {
        adminService.getUsers.mockResolvedValue({ items: mockUsers })
        renderComponent()
        await waitFor(() => {
            expect(screen.getByText('user1@test.com')).toBeInTheDocument()
            expect(screen.getByText('user2@test.com')).toBeInTheDocument()
        })
    })

    it('filters users by search', async () => {
        adminService.getUsers.mockResolvedValue({ items: mockUsers })
        renderComponent()
        await waitFor(() => expect(screen.getByText('user1@test.com')).toBeInTheDocument())

        const searchInput = screen.getByPlaceholderText(/buscar por email/i)
        fireEvent.change(searchInput, { target: { value: 'user2' } })

        await waitFor(() => {
            expect(screen.queryByText('user1@test.com')).not.toBeInTheDocument()
            expect(screen.getByText('user2@test.com')).toBeInTheDocument()
        })
    })

    it('updates user role', async () => {
        adminService.getUsers.mockResolvedValue({ items: mockUsers })
        adminService.updateUserRole.mockResolvedValue({ ...mockUsers[0], role: 'ADMINISTRADOR' })

        renderComponent()
        await waitFor(() => expect(screen.getByText('user1@test.com')).toBeInTheDocument())

        // Find select for first user
        const selects = screen.getAllByRole('combobox')
        fireEvent.change(selects[0], { target: { value: 'ADMINISTRADOR' } })

        // Find safe button (Guardar)
        const saveButton = screen.getAllByText('Guardar')[0]
        expect(saveButton).toBeEnabled()

        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(adminService.updateUserRole).toHaveBeenCalledWith(1, 'ADMINISTRADOR')
        })
    })
})
