import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import authService from '../../../modules/auth/services/auth_service'
import authRepository from '../../../modules/auth/repositories/auth_repository'
import { setAccessToken, getAccessToken } from '../../../core/api/apiClient'

// Mock del repositorio
vi.mock('../../../modules/auth/repositories/auth_repository')

describe('AuthService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        setAccessToken(null)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('login', () => {
        it('should call repository login', async () => {
            const mockResponse = {
                access_token: 'mock_access_token',
                refresh_token: 'mock_refresh_token',
                user: { id: 1, email: 'test@test.com' }
            }
            authRepository.login.mockResolvedValue(mockResponse)

            const result = await authService.login('test@test.com', 'password')

            expect(authRepository.login).toHaveBeenCalledWith('test@test.com', 'password')
            expect(result).toEqual(mockResponse)
        })

        it('should propagate error on failed login', async () => {
            const error = new Error('Invalid credentials')
            authRepository.login.mockRejectedValue(error)

            await expect(authService.login('wrong@test.com', 'wrongpass')).rejects.toThrow('Invalid credentials')
        })
    })

    describe('logout', () => {
        it('should call repository logout and clear token', async () => {
            setAccessToken('token')
            authRepository.logout.mockResolvedValue()

            await authService.logout()

            expect(authRepository.logout).toHaveBeenCalled()
            expect(getAccessToken()).toBeNull()
        })
    })

    describe('isAuthenticated', () => {
        it('should return false if no token exists', () => {
            setAccessToken(null)
            expect(authService.isAuthenticated()).toBe(false)
        })

        it('should return true if token is valid and not expired', () => {
            // Token con expiración en el futuro (1 hora)
            const futureExp = Math.floor(Date.now() / 1000) + 3600
            const payload = btoa(JSON.stringify({ exp: futureExp })) // Base64 basic encode
            const token = `header.${payload}.signature`

            setAccessToken(token)

            expect(authService.isAuthenticated()).toBe(true)
        })

        it('should return false if token is expired', () => {
            // Token con expiración en el pasado (1 hora)
            const pastExp = Math.floor(Date.now() / 1000) - 3600
            const payload = btoa(JSON.stringify({ exp: pastExp }))
            const token = `header.${payload}.signature`

            setAccessToken(token)

            expect(authService.isAuthenticated()).toBe(false)
        })

        it('should return false if token is malformed', () => {
            setAccessToken('invalid_token_string')
            expect(authService.isAuthenticated()).toBe(false)
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
            const formData = new FormData()
            formData.append('name', 'New Name')
            authRepository.updateProfile.mockResolvedValue({ success: true })

            await authService.updateProfile(formData)

            expect(authRepository.updateProfile).toHaveBeenCalledWith(formData)
        })
    })
})
