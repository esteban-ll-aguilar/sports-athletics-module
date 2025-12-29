import BaseModel from '@core/models/BaseModel';

class AuthUser extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.email = data.email || '';
        this.phone = data.phone || '';
        this.profile_image = data.profile_image || '';
        this.is_active = data.is_active ?? true;
        this.email_confirmed_at = data.email_confirmed_at ? new Date(data.email_confirmed_at) : null;

        // 2FA Fields
        this.two_factor_enabled = data.two_factor_enabled ?? false;

        // Profile Fields
        this.username = data.username || '';
        this.fecha_nacimiento = data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : null;
        this.sexo = data.sexo || '';
        this.role = data.role || 'ATLETA';
    }
}

export default AuthUser;
