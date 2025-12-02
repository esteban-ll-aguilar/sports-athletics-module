import BaseModel from '../../../core/models/BaseModel';
import Entrenador from './Entrenador';

class Entrenamiento extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.tipo_entrenamiento = data.tipo_entrenamiento || '';
        this.descripcion = data.descripcion || '';
        this.fecha_entrenamiento = data.fecha_entrenamiento ? new Date(data.fecha_entrenamiento) : null;

        this.entrenador_id = data.entrenador_id || null;
        this.entrenador = data.entrenador ? new Entrenador(data.entrenador) : null;
    }
}

export default Entrenamiento;
