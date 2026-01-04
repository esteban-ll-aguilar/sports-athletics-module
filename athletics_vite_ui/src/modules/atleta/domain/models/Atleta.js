import BaseModel from '@core/models/BaseModel';
import AuthUser from '@modules/auth/domain/models/AuthUser';
import HistorialMedico from './HistorialMedico';
import Representante from './Representante';

class Atleta extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.anios_experiencia = data.anios_experiencia || 0;
        this.estamento = data.estamento || '';

        this.user_id = data.user_id || null;
        this.user = data.user ? new AuthUser(data.user) : null;

        this.historial_medico = data.historial_medico ? new HistorialMedico(data.historial_medico) : null;

        this.representante_id = data.representante_id || null;
        this.representante = data.representante ? new Representante(data.representante) : null;
    }
}

export default Atleta;
