import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginPage from '../../modules/auth/ui/pages/LoginPage'
import authService from '../../modules/auth/services/auth_service'
import { BrowserRouter } from 'react-router-dom'

// Mocks
vi.mock('../../modules/auth/services/auth_service')
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate
    }
})

// Mocks para imagenes
vi.mock('@assets/images/auth/login.webp', () => ({ default: 'login-image.webp' }))

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Default mock implementation
        authService.isAuthenticated.mockReturnValue(false)
    })

    const renderComponent = () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        )
    }

    it('renders login form elements', () => {
        renderComponent()
        expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
    })

    it('navigates to dashboard on successful login', async () => {
        renderComponent()
        authService.login.mockResolvedValue({}) // Simula éxito

        const emailInput = screen.getByLabelText(/correo electrónico/i)
        const passwordInput = screen.getByLabelText(/contraseña/i)
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123')
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
        })
    })

    it('shows loading state during login', async () => {
        renderComponent()
        // Never resolves to keep it in loading state
        authService.login.mockReturnValue(new Promise(() => { }))

        const emailInput = screen.getByLabelText(/correo electrónico/i)
        const passwordInput = screen.getByLabelText(/contraseña/i)
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        expect(submitButton).toBeDisabled()
        expect(screen.getByText(/iniciando sesión/i)).toBeInTheDocument()
    })

    it('shows error message on failed login', async () => {
        renderComponent()
        const errorMessage = 'Credenciales inválidas'
        authService.login.mockRejectedValue({ detail: errorMessage }) // Simula error

        const emailInput = screen.getByLabelText(/correo electrónico/i)
        const passwordInput = screen.getByLabelText(/contraseña/i)
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

        fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument()
        })
    })

    it('redirects if already authenticated', () => {
        authService.isAuthenticated.mockReturnValue(true)
        renderComponent()
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
})
