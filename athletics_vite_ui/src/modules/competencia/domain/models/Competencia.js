import BaseModel from '@core/models/BaseModel';

class Competencia extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.nombre = data.nombre || '';
        this.descripcion = data.descripcion || '';
        this.fecha = data.fecha || '';
        this.lugar = data.lugar || '';
        this.estado = data.estado ?? true;
    }
}

export default Competencia;