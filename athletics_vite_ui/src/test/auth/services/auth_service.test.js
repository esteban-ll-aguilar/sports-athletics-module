import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import authService from '../../../modules/auth/services/auth_service'
import authRepository from '../../../modules/auth/repositories/auth_repository'

// Mock del repositorio
vi.mock('../../../modules/auth/repositories/auth_repository')

describe('AuthService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('login', () => {
        it('should store tokens on successful login', async () => {
            const mockResponse = {
                access_token: 'mock_access_token',
                refresh_token: 'mock_refresh_token',
                user: { id: 1, email: 'test@test.com' }
            }
            authRepository.login.mockResolvedValue(mockResponse)

            const result = await authService.login('test@test.com', 'password')

            expect(authRepository.login).toHaveBeenCalledWith('test@test.com', 'password')
            expect(result).toEqual(mockResponse)
            expect(localStorage.getItem('access_token')).toBe('mock_access_token')
            expect(localStorage.getItem('refresh_token')).toBe('mock_refresh_token')
        })

        it('should propagate error on failed login', async () => {
            const error = new Error('Invalid credentials')
            authRepository.login.mockRejectedValue(error)

            await expect(authService.login('wrong@test.com', 'wrongpass')).rejects.toThrow('Invalid credentials')
            expect(localStorage.getItem('access_token')).toBeNull()
        })
    })

    describe('logout', () => {
        it('should remove tokens from localStorage', () => {
            localStorage.setItem('access_token', 'token')
            localStorage.setItem('refresh_token', 'refresh')

            authService.logout()

            expect(localStorage.getItem('access_token')).toBeNull()
            expect(localStorage.getItem('refresh_token')).toBeNull()
        })
    })

    describe('isAuthenticated', () => {
        it('should return false if no token exists', () => {
            expect(authService.isAuthenticated()).toBe(false)
        })

        it('should return true if token is valid and not expired', () => {
            // Token con expiración en el futuro (1 hora)
            const futureExp = Math.floor(Date.now() / 1000) + 3600
            const payload = btoa(JSON.stringify({ exp: futureExp })) // Base64 basic encode
            const token = `header.${payload}.signature`

            localStorage.setItem('access_token', token)

            expect(authService.isAuthenticated()).toBe(true)
        })

        it('should return false and logout if token is expired', () => {
            // Token con expiración en el pasado (1 hora)
            const pastExp = Math.floor(Date.now() / 1000) - 3600
            const payload = btoa(JSON.stringify({ exp: pastExp }))
            const token = `header.${payload}.signature`

            localStorage.setItem('access_token', token)

            // Espiar logout para verificar que se llama
            const logoutSpy = vi.spyOn(authService, 'logout')

            expect(authService.isAuthenticated()).toBe(false)
            expect(logoutSpy).toHaveBeenCalled()
            expect(localStorage.getItem('access_token')).toBeNull()
        })

        it('should return false if token is malformed', () => {
            localStorage.setItem('access_token', 'invalid_token_string')

            const logoutSpy = vi.spyOn(authService, 'logout')

            expect(authService.isAuthenticated()).toBe(false)
            expect(logoutSpy).toHaveBeenCalled()
        })
    })

    describe('register', () => {
        it('should call repository register', async () => {
            const userData = { email: 'new@test.com', password: '123' }
            authRepository.register.mockResolvedValue({ success: true })

            await authService.register(userData)

            expect(authRepository.register).toHaveBeenCalledWith(userData)
        })
    })

    describe('verifyEmail', () => {
        it('should call repository verifyEmail', async () => {
            const email = 'test@test.com'
            const code = '123456'
            authRepository.verifyEmail.mockResolvedValue({ success: true })

            await authService.verifyEmail(email, code)

            expect(authRepository.verifyEmail).toHaveBeenCalledWith(email, code)
        })
    })

    describe('resendVerification', () => {
        it('should call repository resendVerification', async () => {
            const email = 'test@test.com'
            authRepository.resendVerification.mockResolvedValue({ success: true })

            await authService.resendVerification(email)

            expect(authRepository.resendVerification).toHaveBeenCalledWith(email)
        })
    })

    describe('updateUser', () => {
        it('should call repository updateUser', async () => {
            const userId = 1
            const userData = { name: 'Updated Name' }
            authRepository.updateUser.mockResolvedValue({ success: true })

            await authService.updateUser(userId, userData)

            expect(authRepository.updateUser).toHaveBeenCalledWith(userId, userData)
        })
    })

    describe('updateRole', () => {
        it('should call repository updateRole', async () => {
            const userId = 1
            const roleData = { role: 'admin' }
            authRepository.updateRole.mockResolvedValue({ success: true })

            await authService.updateRole(userId, roleData)

            expect(authRepository.updateRole).toHaveBeenCalledWith(userId, roleData)
        })
    })

    describe('getProfile', () => {
        it('should call repository getProfile', async () => {
            const mockProfile = { id: 1, email: 'test@test.com' }
            authRepository.getProfile.mockResolvedValue(mockProfile)

            const result = await authService.getProfile()

            expect(authRepository.getProfile).toHaveBeenCalled()
            expect(result).toEqual(mockProfile)
        })
    })

    describe('updateProfile', () => {
        it('should call repository updateProfile', async () => {
            const userData = { name: 'New Name' }
            authRepository.updateProfile.mockResolvedValue({ success: true })

            await authService.updateProfile(userData)

            expect(authRepository.updateProfile).toHaveBeenCalledWith(userData)
        })
    })
})
