import BaseModel from '@core/models/BaseModel';

class Asistencia extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.fecha_asistencia = data.fecha_asistencia ? new Date(data.fecha_asistencia) : null;
        this.hora_llegada = data.hora_llegada || '';
        this.descripcion = data.descripcion || '';
    }
}

export default Asistencia;
