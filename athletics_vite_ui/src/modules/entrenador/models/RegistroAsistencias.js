import BaseModel from '../../../core/models/BaseModel';
import Horario from './Horario';
import Atleta from '../../atleta/models/Atleta';
import Asistencia from './Asistencia';

class RegistroAsistencias extends BaseModel {
    constructor(data = {}) {
        super(data);

        this.horario_id = data.horario_id || null;
        this.horario = data.horario ? new Horario(data.horario) : null;

        this.atleta_id = data.atleta_id || null;
        this.atleta = data.atleta ? new Atleta(data.atleta) : null;

        this.asistencia_id = data.asistencia_id || null;
        this.asistencia = data.asistencia ? new Asistencia(data.asistencia) : null;
    }
}

export default RegistroAsistencias;
