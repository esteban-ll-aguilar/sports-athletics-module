import BaseModel from '../../../core/models/BaseModel';

class Baremo extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.valor_baremo = data.valor_baremo || 0;
        this.clasificacion = data.clasificacion || '';
        this.estado = data.estado ?? true;
    }
}

export default Baremo;
