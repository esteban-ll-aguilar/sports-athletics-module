import BaseModel from '../../../core/models/BaseModel';
import AuthUser from '../../auth/models/AuthUser';

class Entrenador extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.is_pasante = data.is_pasante ?? false;
        this.anios_experiencia = data.anios_experiencia || 0;

        this.user_id = data.user_id || null;
        this.user = data.user ? new AuthUser(data.user) : null;
    }
}

export default Entrenador;
