import BaseModel from '@core/models/BaseModel';
import Entrenamiento from './Entrenamiento';

class Horario extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.hora_inicio = data.hora_inicio || '';
        this.hora_fin = data.hora_fin || '';

        this.entrenamiento_id = data.entrenamiento_id || null;
        this.entrenamiento = data.entrenamiento ? new Entrenamiento(data.entrenamiento) : null;
    }
}

export default Horario;
