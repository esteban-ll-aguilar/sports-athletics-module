import BaseModel from '@core/models/BaseModel';
import TipoDisciplina from './TipoDisciplina';
import Baremo from './Baremo';

class Prueba extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.siglas = data.siglas || '';
        this.fecha_registro = data.fecha_registro ? new Date(data.fecha_registro) : null;
        this.tipo_prueba = data.tipo_prueba || '';
        this.unidad_medida = data.unidad_medida || '';
        this.estado = data.estado ?? true;

        this.tipo_disciplina_id = data.tipo_disciplina_id || null;
        this.tipo_disciplina = data.tipo_disciplina ? new TipoDisciplina(data.tipo_disciplina) : null;

        this.baremo_id = data.baremo_id || null;
        this.baremo = data.baremo ? new Baremo(data.baremo) : null;
    }
}

export default Prueba;
