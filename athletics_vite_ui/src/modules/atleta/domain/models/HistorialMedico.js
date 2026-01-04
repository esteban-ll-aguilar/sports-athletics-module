import BaseModel from '@core/models/BaseModel';

class HistorialMedico extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.talla = data.talla || 0;
        this.peso = data.peso || 0;
        this.imc = data.imc || 0;
        this.alergias = data.alergias || '';
        this.enfermedades_hereditarias = data.enfermedades_hereditarias || '';
        this.enfermedades = data.enfermedades || '';

        this.atleta_id = data.atleta_id || null;
    }
}

export default HistorialMedico;
