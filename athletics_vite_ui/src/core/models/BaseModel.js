class BaseModel {
    constructor(data = {}) {
        // Map external_id to id for frontend usage if present
        if (data.external_id) {
            this.id = data.external_id;
        } else if (data.id) {
            this.id = data.id;
        }

        // Store original external_id as well if needed
        this.external_id = data.external_id || data.id;

        // Map other common fields
        this.created_at = data.created_at ? new Date(data.created_at) : null;
        this.updated_at = data.updated_at ? new Date(data.updated_at) : null;
    }

    /**
     * Prepares data for API submission (mapping id back to external_id if necessary, 
     * though usually APIs expect external_id or handle it automatically)
     */
    toJSON() {
        const { id, ...rest } = this;
        return {
            ...rest,
            external_id: this.external_id || id,
        };
    }

    static fromJson(json) {
        return new this(json);
    }

    static fromJsonArray(jsonArray) {
        if (!Array.isArray(jsonArray)) return [];
        return jsonArray.map(item => new this(item));
    }
}

export default BaseModel;
