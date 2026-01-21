/**
 * Standard API response schema.
 * @template T
 */
export class APIResponse {
    /**
     * @param {boolean} success - Indicates if the request was successful
     * @param {string|null} message - Optional message
     * @param {T|null} data - Payload containing the response data
     * @param {Array<Object>|null} errors - List of error details
     */
    constructor(success, message = null, data = null, errors = null) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.errors = errors;
    }

    /**
     * Create an APIResponse from a plain object
     * @param {Object} obj 
     * @returns {APIResponse}
     */
    static fromJson(obj) {
        return new APIResponse(
            obj.success,
            obj.message,
            obj.data,
            obj.errors
        );
    }
}
