import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUserRole, getUserName, getUserEmail } from '../../../modules/auth/utils/roleUtils'
import authService from '../../../modules/auth/services/auth_service'
import { jwtDecode } from 'jwt-decode'

vi.mock('../../../modules/auth/services/auth_service')
vi.mock('jwt-decode')

// Mock console.error
global.console = {
    ...console,
    error: vi.fn(),
}

describe('roleUtils', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getUserRole', () => {
        it('should return null if no token exists', () => {
            authService.getToken.mockReturnValue(null)

            const result = getUserRole()

            expect(result).toBeNull()
        })

        it('should return role from decoded token', () => {
            const mockToken = 'mock.jwt.token'
            const mockDecoded = { role: 'ADMIN', sub: '123' }

            authService.getToken.mockReturnValue(mockToken)
            jwtDecode.mockReturnValue(mockDecoded)

            const result = getUserRole()

            expect(jwtDecode).toHaveBeenCalledWith(mockToken)
            expect(result).toBe('ADMIN')
        })

        it('should return null if role is not in token', () => {
            const mockToken = 'mock.jwt.token'
            const mockDecoded = { sub: '123' }

            authService.getToken.mockReturnValue(mockToken)
            jwtDecode.mockReturnValue(mockDecoded)

            const result = getUserRole()

            expect(result).toBeNull()
        })

        it('should return null and log error if token decode fails', () => {
            const mockToken = 'invalid.token'
            const error = new Error('Invalid token')

            authService.getToken.mockReturnValue(mockToken)
            jwtDecode.mockImplementation(() => { throw error })

            const result = getUserRole()

            expect(console.error).toHaveBeenCalledWith('Error decoding token:', error)
            expect(result).toBeNull()
        })
    })

    describe('getUserName', () => {
        it('should return null if no token exists', () => {
            authService.getToken.mockReturnValue(null)

            const result = getUserName()

            expect(result).toBeNull()
        })

        it('should return formatted name with role from decoded token', () => {
            const mockToken = 'mock.jwt.token'
            const mockDecoded = { name: 'John Doe', role: 'ADMIN', sub: '123' }

            authService.getToken.mockReturnValue(mockToken)
            jwtDecode.mockReturnValue(mockDecoded)

            const result = getUserName()

            expect(jwtDecode).toHaveBeenCalledWith(mockToken)
            expect(result).toBe('John Doe (admin)')
        })

        it('should return null and log error if token decode fails', () => {
            const mockToken = 'invalid.token'
            const error = new Error('Invalid token')

            authService.getToken.mockReturnValue(mockToken)
            jwtDecode.mockImplementation(() => { throw error })

            const result = getUserName()

            expect(console.error).toHaveBeenCalledWith('Error decoding token:', error)
            expect(result).toBeNull()
        })
    })

    describe('getUserEmail', () => {
        it('should return null if no token exists', () => {
            authService.getToken.mockReturnValue(null)

            const result = getUserEmail()

            expect(result).toBeNull()
        })

        it('should return email from decoded token', () => {
            const mockToken = 'mock.jwt.token'
            const mockDecoded = { email: 'john@example.com', sub: '123' }

            authService.getToken.mockReturnValue(mockToken)
            jwtDecode.mockReturnValue(mockDecoded)

            const result = getUserEmail()

            expect(jwtDecode).toHaveBeenCalledWith(mockToken)
            expect(result).toBe('john@example.com')
        })

        it('should return null if email is not in token', () => {
            const mockToken = 'mock.jwt.token'
            const mockDecoded = { sub: '123' }

            authService.getToken.mockReturnValue(mockToken)
            jwtDecode.mockReturnValue(mockDecoded)

            const result = getUserEmail()

            expect(result).toBeNull()
        })

        it('should return null and log error if token decode fails', () => {
            const mockToken = 'invalid.token'
            const error = new Error('Invalid token')

            authService.getToken.mockReturnValue(mockToken)
            jwtDecode.mockImplementation(() => { throw error })

            const result = getUserEmail()

            expect(console.error).toHaveBeenCalledWith('Error decoding token:', error)
            expect(result).toBeNull()
        })
    })
})
