import BaseModel from '@core/models/BaseModel';
import AuthUser from '@modules/auth/domain/models/AuthUser';

class Representante extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.estamento = data.estamento || '';

        this.user_id = data.user_id || null;
        this.user = data.user ? new AuthUser(data.user) : null;
    }
}

export default Representante;
