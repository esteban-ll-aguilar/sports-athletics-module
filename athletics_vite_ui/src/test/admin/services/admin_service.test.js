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

            expect(apiClient.get).toHaveBeenCalledWith('/admin/users/users/?page=1&size=10')
            expect(result).toEqual(mockResponse)
        })

        it('should use default params', async () => {
            await adminService.getUsers()
            expect(apiClient.get).toHaveBeenCalledWith('/admin/users/users/?page=1&size=20')
        })
    })

    describe('updateUserRole', () => {
        it('should call api put with correct params', async () => {
            const userId = 123
            const role = 'ADMIN'
            const mockResponse = { success: true }
            apiClient.put.mockResolvedValue(mockResponse)

            const result = await adminService.updateUserRole(userId, role)

            expect(apiClient.put).toHaveBeenCalledWith(`/admin/users/${userId}/role`, { role })
            expect(result).toEqual(mockResponse)
        })

        it('should propagate errors', async () => {
            const error = new Error('API Error')
            apiClient.put.mockRejectedValue(error)
            await expect(adminService.updateUserRole(1, 'role')).rejects.toThrow('API Error')
        })
    })
})
