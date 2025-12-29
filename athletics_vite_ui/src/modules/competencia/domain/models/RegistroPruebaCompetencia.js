import BaseModel from '@core/models/BaseModel';
import Prueba from './Prueba';
import Atleta from '@modules/atleta/domain/models/Atleta';

class RegistroPruebaCompetencia extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.id_entrenador = data.id_entrenador || null;
        this.valor = data.valor || 0;
        this.fecha_registro = data.fecha_registro ? new Date(data.fecha_registro) : null;

        this.prueba_id = data.prueba_id || null;
        this.prueba = data.prueba ? new Prueba(data.prueba) : null;

        this.atleta_id = data.atleta_id || null;
        this.atleta = data.atleta ? new Atleta(data.atleta) : null;
    }
}

export default RegistroPruebaCompetencia;
