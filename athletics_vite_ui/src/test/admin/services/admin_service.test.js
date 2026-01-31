import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import adminService from '../../../modules/admin/services/adminService'
import apiClient from '../../../core/api/apiClient'

vi.mock('../../../core/api/apiClient')

describe('AdminService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getUsers', () => {
        it('should call api get with correct params', async () => {
            const mockResponse = { users: [] }
            apiClient.get.mockResolvedValue(mockResponse)

            const result = await adminService.getUsers(1, 10)

            expect(apiClient.get).toHaveBeenCalledWith('/auth/users/?page=1&size=10')
            expect(result).toEqual(mockResponse)
        })

        it('should use default params', async () => {
            await adminService.getUsers()
            expect(apiClient.get).toHaveBeenCalledWith('/auth/users/?page=1&size=20')
        })

        it('should include role parameter when provided', async () => {
            const mockResponse = { users: [] }
            apiClient.get.mockResolvedValue(mockResponse)

            await adminService.getUsers(1, 20, 'ADMIN')

            expect(apiClient.get).toHaveBeenCalledWith('/auth/users/?page=1&size=20&role=ADMIN')
        })
    })

    describe('updateUserRole', () => {
        it('should call api put with correct params', async () => {
            const userId = 123
            const role = 'ADMIN'
            const mockResponse = { success: true }
            // Service accesses response.data, so we mock nested object
            apiClient.put.mockResolvedValue({ data: mockResponse })

            const result = await adminService.updateUserRole(userId, role)

            expect(apiClient.put).toHaveBeenCalledWith(`/auth/users/${userId}/role`, { role })
            expect(result).toEqual(mockResponse)
        })

        it('should propagate errors', async () => {
            const error = new Error('API Error')
            apiClient.put.mockRejectedValue(error)
            await expect(adminService.updateUserRole(1, 'role')).rejects.toThrow('API Error')
        })
    })

    describe('getJwtRotationInfo', () => {
        it('should call api get and return rotation info', async () => {
            const mockData = {
                current_secret_age: 30,
                rotation_needed: false
            }
            apiClient.get.mockResolvedValue({ data: mockData })

            const result = await adminService.getJwtRotationInfo()

            expect(apiClient.get).toHaveBeenCalledWith('/admin/jwt/rotation-info')
            expect(result).toEqual(mockData)
        })
    })

    describe('rotateJwtSecret', () => {
        it('should call api post and return rotation result', async () => {
            const mockData = {
                success: true,
                message: 'Secret rotated successfully'
            }
            apiClient.post.mockResolvedValue({ data: mockData })

            const result = await adminService.rotateJwtSecret()

            expect(apiClient.post).toHaveBeenCalledWith('/admin/jwt/rotate-secret')
            expect(result).toEqual(mockData)
        })
    })
})

