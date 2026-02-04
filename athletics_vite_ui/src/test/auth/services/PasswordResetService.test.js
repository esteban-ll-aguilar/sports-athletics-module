import { describe, it, expect, vi, beforeEach } from 'vitest'
import PasswordResetService from '../../../modules/auth/services/PasswordResetService'
import ApiClient from '../../../core/api/apiClient'

vi.mock('../../../core/api/apiClient')

describe('PasswordResetService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('requestReset', () => {
        it('should call ApiClient.post with correct endpoint and email', async () => {
            const email = 'test@example.com'
            const mockResponse = { success: true, message: 'Code sent' }
            ApiClient.post.mockResolvedValue(mockResponse)

            const result = await PasswordResetService.requestReset(email)

            expect(ApiClient.post).toHaveBeenCalledWith('/auth/password-reset/request', { email })
            expect(result).toEqual(mockResponse)
        })
    })

    describe('validateCode', () => {
        it('should call ApiClient.post with correct endpoint, email and code', async () => {
            const email = 'test@example.com'
            const code = '123456'
            const mockResponse = { success: true, valid: true }
            ApiClient.post.mockResolvedValue(mockResponse)

            const result = await PasswordResetService.validateCode(email, code)

            expect(ApiClient.post).toHaveBeenCalledWith('/auth/password-reset/validate-code', { email, code })
            expect(result).toEqual(mockResponse)
        })
    })

    describe('completeReset', () => {
        it('should call ApiClient.post with correct endpoint and data', async () => {
            const email = 'test@example.com'
            const code = '123456'
            const newPassword = 'NewSecurePass123!'
            const mockResponse = { success: true, message: 'Password reset successfully' }
            ApiClient.post.mockResolvedValue(mockResponse)

            const result = await PasswordResetService.completeReset(email, code, newPassword)

            expect(ApiClient.post).toHaveBeenCalledWith('/auth/password-reset/reset', {
                email,
                code,
                new_password: newPassword
            })
            expect(result).toEqual(mockResponse)
        })
    })
})
