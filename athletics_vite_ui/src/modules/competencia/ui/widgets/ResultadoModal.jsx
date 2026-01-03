import { useEffect, useState } from "react";
import ResultadoCompetencia from "../../domain/models/ResultadoCompetencia";

const ResultadoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingResultado,
  competencias = [],
  atletas = [],
  pruebas = []
}) => {
  const [form, setForm] = useState(new ResultadoCompetencia());

  const posicionesDisponibles = [
    { value: 'primero', label: '🥇 Primer Lugar' },
    { value: 'segundo', label: '🥈 Segundo Lugar' },
    { value: 'tercero', label: '🥉 Tercer Lugar' },
    { value: 'cuarto', label: '4️⃣ Cuarto Lugar' },
    { value: 'quinto', label: '5️⃣ Quinto Lugar' },
    { value: 'sexto', label: '6️⃣ Sexto Lugar' },
    { value: 'septimo', label: '7️⃣ Séptimo Lugar' },
    { value: 'octavo', label: '8️⃣ Octavo Lugar' },
    { value: 'participante', label: '👤 Participante' },
    { value: 'descalificado', label: '❌ Descalificado' }
  ];

  const unidadesMedida = [
    { value: 'm', label: 'Metros (m)' },
    { value: 's', label: 'Segundos (s)' },
    { value: 'min', label: 'Minutos (min)' },
    { value: 'km', label: 'Kilómetros (km)' },
    { value: 'cm', label: 'Centímetros (cm)' }
  ];

  useEffect(() => {
    if (editingResultado) setForm(editingResultado);
    else setForm(new ResultadoCompetencia());
  }, [editingResultado, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black">
              {editingResultado ? 'Editar Resultado' : 'Registrar Nuevo Resultado'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Complete los detalles del resultado de la competencia
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="p-6 space-y-5">
          
          {/* SELECCIÓN DE COMPETENCIA */}
          <div>
            <label className="block text-sm font-bold mb-2 text-[#181111]">
              Competencia *
            </label>
            <select
              name="competencia_id"
              value={form.competencia_id || ''}
              onChange={(e) => setForm({...form, competencia_id: parseInt(e.target.value)})}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#ec1313] outline-none bg-white appearance-none cursor-pointer"
              required
            >
              <option value="" disabled>Seleccione una competencia</option>
              {competencias.map(comp => (
                <option key={comp.id} value={comp.id}>
                  {comp.nombre} - {new Date(comp.fecha).toLocaleDateString('es-ES')}
                </option>
              ))}
            </select>
          </div>

          {/* GRID: ATLETA Y PRUEBA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SELECCIÓN DE ATLETA */}
            <div>
              <label className="block text-sm font-bold mb-2 text-[#181111]">
                Atleta *
              </label>
              <select
                name="atleta_id"
                value={form.atleta_id || ''}
                onChange={(e) => setForm({...form, atleta_id: parseInt(e.target.value)})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#ec1313] outline-none bg-white appearance-none cursor-pointer"
                required
              >
                <option value="" disabled>Seleccione un atleta</option>
                {atletas.map(atleta => (
                  <option key={atleta.id} value={atleta.id}>
                    {atleta.nombres} {atleta.apellidos}
                  </option>
                ))}
              </select>
            </div>

            {/* SELECCIÓN DE PRUEBA */}
            <div>
              <label className="block text-sm font-bold mb-2 text-[#181111]">
                Prueba *
              </label>
              <select
                name="prueba_id"
                value={form.prueba_id || ''}
                onChange={(e) => setForm({...form, prueba_id: parseInt(e.target.value)})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#ec1313] outline-none bg-white appearance-none cursor-pointer"
                required
              >
                <option value="" disabled>Seleccione una prueba</option>
                {pruebas.map(prueba => (
                  <option key={prueba.id} value={prueba.id}>
                    {prueba.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* GRID: RESULTADO Y UNIDAD DE MEDIDA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* RESULTADO */}
            <div>
              <label className="block text-sm font-bold mb-2 text-[#181111]">
                Resultado *
              </label>
              <input
                type="number"
                step="0.01"
                name="resultado"
                value={form.resultado}
                onChange={(e) => setForm({...form, resultado: parseFloat(e.target.value)})}
                placeholder="Ej: 10.5"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#ec1313] outline-none transition-all"
                required
              />
            </div>

            {/* UNIDAD DE MEDIDA */}
            <div>
              <label className="block text-sm font-bold mb-2 text-[#181111]">
                Unidad de Medida *
              </label>
              <select
                name="unidad_medida"
                value={form.unidad_medida}
                onChange={(e) => setForm({...form, unidad_medida: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#ec1313] outline-none bg-white appearance-none cursor-pointer"
                required
              >
                {unidadesMedida.map(unidad => (
                  <option key={unidad.value} value={unidad.value}>
                    {unidad.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* GRID: POSICIÓN FINAL Y PUESTO OBTENIDO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* POSICIÓN FINAL */}
            <div>
              <label className="block text-sm font-bold mb-2 text-[#181111]">
                Posición Final *
              </label>
              <select
                name="posicion_final"
                value={form.posicion_final}
                onChange={(e) => setForm({...form, posicion_final: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#ec1313] outline-none bg-white appearance-none cursor-pointer"
                required
              >
                {posicionesDisponibles.map(pos => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
            </div>

            {/* PUESTO OBTENIDO */}
            <div>
              <label className="block text-sm font-bold mb-2 text-[#181111]">
                Puesto Numérico (Opcional)
              </label>
              <input
                type="number"
                name="puesto_obtenido"
                value={form.puesto_obtenido || ''}
                onChange={(e) => setForm({...form, puesto_obtenido: e.target.value ? parseInt(e.target.value) : null})}
                placeholder="Ej: 1, 2, 3..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#ec1313] outline-none transition-all"
              />
            </div>
          </div>

          {/* OBSERVACIONES */}
          <div>
            <label className="block text-sm font-bold mb-2 text-[#181111]">
              Observaciones (Opcional)
            </label>
            <textarea
              name="observaciones"
              value={form.observaciones}
              onChange={(e) => setForm({...form, observaciones: e.target.value})}
              placeholder="Notas adicionales sobre el desempeño, condiciones climáticas, etc."
              rows="3"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#ec1313] outline-none transition-all resize-none"
            />
          </div>

          {/* TOGGLE DE ESTADO */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#181111]">Estado del Registro</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${form.estado ? 'text-green-600' : 'text-red-500'}`}>
                {form.estado ? 'Activo / Visible' : 'Inactivo / Oculto'}
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => setForm({...form, estado: !form.estado})}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                form.estado ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-md ${
                  form.estado ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-3 bg-[#ec1313] text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition-all active:scale-95"
            >
              {editingResultado ? 'Actualizar Resultado' : 'Guardar Resultado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResultadoModal;