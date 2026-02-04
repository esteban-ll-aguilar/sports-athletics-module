import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock axios BEFORE importing ApiClient
const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPut = vi.fn()
const mockDelete = vi.fn()
const mockPatch = vi.fn()

vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => ({
            get: mockGet,
            post: mockPost,
            put: mockPut,
            delete: mockDelete,
            patch: mockPatch,
            interceptors: {
                request: { use: vi.fn() },
                response: { use: vi.fn() }
            }
        }))
    }
}))

// NOW import ApiClient after mocking
const { default: ApiClient, setAccessToken, getAccessToken } = await import('../../../core/api/apiClient')

describe('ApiClient', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        setAccessToken(null)
    })

    describe('Token Management', () => {
        it('should set and get access token', () => {
            const token = 'test-token-123'
            setAccessToken(token)
            expect(getAccessToken()).toBe(token)
        })

        it('should return null when no token is set', () => {
            expect(getAccessToken()).toBeNull()
        })
    })

    describe('HTTP Methods', () => {
        describe('get', () => {
            it('should call axios get and return data', async () => {
                const mockData = { items: [] }
                mockGet.mockResolvedValue({ data: mockData })

                const result = await ApiClient.get('/test', { page: 1 })

                expect(mockGet).toHaveBeenCalledWith('/test', { params: { page: 1 } })
                expect(result).toEqual(mockData)
            })

            it('should work with no params', async () => {
                const mockData = { items: [] }
                mockGet.mockResolvedValue({ data: mockData })

                await ApiClient.get('/test')

                expect(mockGet).toHaveBeenCalledWith('/test', { params: {} })
            })
        })

        describe('post', () => {
            it('should call axios post and return data', async () => {
                const mockData = { success: true }
                const postData = { name: 'test' }
                mockPost.mockResolvedValue({ data: mockData })

                const result = await ApiClient.post('/test', postData)

                expect(mockPost).toHaveBeenCalledWith('/test', postData, {})
                expect(result).toEqual(mockData)
            })

            it('should work with config', async () => {
                const mockData = { success: true }
                const config = { headers: { 'Custom-Header': 'value' } }
                mockPost.mockResolvedValue({ data: mockData })

                await ApiClient.post('/test', {}, config)

                expect(mockPost).toHaveBeenCalledWith('/test', {}, config)
            })
        })

        describe('put', () => {
            it('should call axios put and return data', async () => {
                const mockData = { success: true }
                const putData = { name: 'updated' }
                mockPut.mockResolvedValue({ data: mockData })

                const result = await ApiClient.put('/test/1', putData)

                expect(mockPut).toHaveBeenCalledWith('/test/1', putData, {})
                expect(result).toEqual(mockData)
            })
        })

        describe('delete', () => {
            it('should call axios delete and return data', async () => {
                const mockData = { success: true }
                mockDelete.mockResolvedValue({ data: mockData })

                const result = await ApiClient.delete('/test/1')

                expect(mockDelete).toHaveBeenCalledWith('/test/1', {})
                expect(result).toEqual(mockData)
            })
        })

        describe('patch', () => {
            it('should call axios patch and return data', async () => {
                const mockData = { success: true }
                const patchData = { status: 'active' }
                mockPatch.mockResolvedValue({ data: mockData })

                const result = await ApiClient.patch('/test/1', patchData)

                expect(mockPatch).toHaveBeenCalledWith('/test/1', patchData, {})
                expect(result).toEqual(mockData)
            })
        })
    })

    describe('Error Handling', () => {
        it('should propagate errors from axios', async () => {
            const error = new Error('Network Error')
            mockGet.mockRejectedValue(error)

            await expect(ApiClient.get('/test')).rejects.toThrow('Network Error')
        })

        it('should propagate errors from post', async () => {
            const error = new Error('Server Error')
            mockPost.mockRejectedValue(error)

            await expect(ApiClient.post('/test', {})).rejects.toThrow('Server Error')
        })
    })
})
