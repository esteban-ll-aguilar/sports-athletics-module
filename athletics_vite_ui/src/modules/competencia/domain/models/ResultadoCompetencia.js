import BaseModel from '@core/models/BaseModel';

class ResultadoCompetencia extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.competencia_id = data.competencia_id ?? "";
        this.atleta_id = data.atleta_id ?? "";
        this.prueba_id = data.prueba_id ?? "";
        this.resultado = data.resultado ?? "";
        this.unidad_medida = data.unidad_medida ?? 'm';
        this.posicion_final = data.posicion_final ?? 'participante';
        this.puesto_obtenido = data.puesto_obtenido ?? "";
        this.observaciones = data.observaciones ?? '';
        this.fecha_registro = data.fecha_registro ?? '';
        this.estado = data.estado ?? true;
    }
}

export default ResultadoCompetencia;