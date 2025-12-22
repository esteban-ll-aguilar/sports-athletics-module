import BaseModel from '@core/models/BaseModel';

class TipoDisciplina extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.nombre = data.nombre || '';
        this.descripcion = data.descripcion || '';
        this.estado = data.estado ?? true;
    }
}

export default TipoDisciplina;
