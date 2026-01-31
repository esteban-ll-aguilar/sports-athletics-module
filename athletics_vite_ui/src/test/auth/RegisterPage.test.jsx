import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RegisterPage from '../../modules/auth/ui/pages/RegisterPage'
import authService from '../../modules/auth/services/auth_service'
import { BrowserRouter } from 'react-router-dom'
import { toast } from 'react-hot-toast'

// Mocks
vi.mock('../../modules/auth/services/auth_service')
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}))

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate
    }
})

// Mock assets
vi.mock('@assets/images/auth/login2.webp', () => ({ default: 'login-image.webp' }))

describe('RegisterPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const renderComponent = () => {
        render(
            <BrowserRouter>
                <RegisterPage />
            </BrowserRouter>
        )
    }

    it('renders register form elements', () => {
        renderComponent()
        expect(screen.getByPlaceholderText(/Nombre de usuario/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/correo/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument()
    })

    it('validates password match', async () => {
        const { container } = render(
            <BrowserRouter>
                <RegisterPage />
            </BrowserRouter>
        )

        const passwordInput = container.querySelector('input[name="password"]')
        const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]')
        const submitButton = screen.getByRole('button', { name: /registrarse/i })

        fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
        fireEvent.change(confirmPasswordInput, { target: { value: 'Password124!' } })

        // Fill other required fields to avoid HTML5 validation blocking
        fireEvent.change(container.querySelector('input[name="username"]'), { target: { value: 'user' } })
        fireEvent.change(container.querySelector('input[name="first_name"]'), { target: { value: 'Name' } })
        fireEvent.change(container.querySelector('input[name="last_name"]'), { target: { value: 'Last' } })
        fireEvent.change(container.querySelector('input[name="identificacion"]'), { target: { value: '0123456789' } })
        fireEvent.change(container.querySelector('input[name="email"]'), { target: { value: 'email@test.com' } })
        fireEvent.change(container.querySelector('input[name="fecha_nacimiento"]'), { target: { value: '2000-01-01' } })

        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument()
        })
    })

    it('submits form on valid data', async () => {
        const { container } = render(
            <BrowserRouter>
                <RegisterPage />
            </BrowserRouter>
        )
        authService.register.mockResolvedValue({})

        fireEvent.change(container.querySelector('input[name="username"]'), { target: { value: 'testuser' } })
        fireEvent.change(container.querySelector('input[name="first_name"]'), { target: { value: 'Test' } })
        fireEvent.change(container.querySelector('input[name="last_name"]'), { target: { value: 'User' } })
        fireEvent.change(container.querySelector('input[name="identificacion"]'), { target: { value: '1710034065' } })
        fireEvent.change(container.querySelector('input[name="email"]'), { target: { value: 'test@example.com' } })
        fireEvent.change(container.querySelector('input[name="fecha_nacimiento"]'), { target: { value: '2000-01-01' } })

        fireEvent.change(container.querySelector('input[name="password"]'), { target: { value: 'Password123!' } })
        fireEvent.change(container.querySelector('input[name="confirmPassword"]'), { target: { value: 'Password123!' } })

        fireEvent.click(screen.getByRole('button', { name: /registrarse/i }))

        await waitFor(() => {
            expect(authService.register).toHaveBeenCalled()
            expect(mockNavigate).toHaveBeenCalledWith('/login')
            expect(toast.success).toHaveBeenCalled()
        })
    })

    it('shows loading state during registration', async () => {
        const { container } = render(
            <BrowserRouter>
                <RegisterPage />
            </BrowserRouter>
        )
        authService.register.mockReturnValue(new Promise(() => { }))

        fireEvent.change(container.querySelector('input[name="username"]'), { target: { value: 'testuser' } })
        fireEvent.change(container.querySelector('input[name="first_name"]'), { target: { value: 'Test' } })
        fireEvent.change(container.querySelector('input[name="last_name"]'), { target: { value: 'User' } })
        fireEvent.change(container.querySelector('input[name="identificacion"]'), { target: { value: '1710034065' } })
        fireEvent.change(container.querySelector('input[name="email"]'), { target: { value: 'test@example.com' } })
        fireEvent.change(container.querySelector('input[name="fecha_nacimiento"]'), { target: { value: '2000-01-01' } })

        fireEvent.change(container.querySelector('input[name="password"]'), { target: { value: 'Password123!' } })
        fireEvent.change(container.querySelector('input[name="confirmPassword"]'), { target: { value: 'Password123!' } })

        const submitButton = screen.getByRole('button', { name: /registrarse/i })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(submitButton).toBeDisabled()
            expect(screen.getByText(/registrando/i)).toBeInTheDocument()
        })
    })

    it('shows error message on registration failure', async () => {
        const { container } = render(
            <BrowserRouter>
                <RegisterPage />
            </BrowserRouter>
        )
        const errorMessage = 'Error al registrar'
        authService.register.mockRejectedValue({ detail: errorMessage })

        fireEvent.change(container.querySelector('input[name="username"]'), { target: { value: 'testuser' } })
        fireEvent.change(container.querySelector('input[name="first_name"]'), { target: { value: 'Test' } })
        fireEvent.change(container.querySelector('input[name="last_name"]'), { target: { value: 'User' } })
        fireEvent.change(container.querySelector('input[name="identificacion"]'), { target: { value: '1710034065' } })
        fireEvent.change(container.querySelector('input[name="email"]'), { target: { value: 'test@example.com' } })
        fireEvent.change(container.querySelector('input[name="fecha_nacimiento"]'), { target: { value: '2000-01-01' } })

        fireEvent.change(container.querySelector('input[name="password"]'), { target: { value: 'Password123!' } })
        fireEvent.change(container.querySelector('input[name="confirmPassword"]'), { target: { value: 'Password123!' } })

        fireEvent.click(screen.getByRole('button', { name: /registrarse/i }))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(errorMessage)
        })
    })
})
