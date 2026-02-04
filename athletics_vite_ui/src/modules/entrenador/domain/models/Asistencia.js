import BaseModel from '@core/models/BaseModel';

class Asistencia extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.fecha_asistencia = data.fecha_asistencia ? new Date(data.fecha_asistencia) : null;
        this.hora_llegada = data.hora_llegada || '';
        this.descripcion = data.descripcion || '';
        this.asistio = data.asistio || false;
        this.fecha_confirmacion = data.fecha_confirmacion ? new Date(data.fecha_confirmacion) : null;
    }
}

export default Asistencia;
