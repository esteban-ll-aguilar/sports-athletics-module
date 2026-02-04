import { useEffect, useState, useId } from "react";
import PropTypes from "prop-types";
import ResultadoCompetencia from "../../domain/models/ResultadoCompetencia";
import Swal from "sweetalert2";
import { X, Save, Edit3, Activity, User, Trophy, Eye, EyeOff, FileText, Hash, Ruler } from "lucide-react";

const InputField = ({ label, icon: Icon, id, ...props }) => (
  <div className="space-y-1 w-full">
    <label htmlFor={id} className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />}
      <input
        {...props}
        id={id}
        className={`
          w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 rounded-lg
          bg-white dark:bg-[#252525] 
          border border-gray-300 dark:border-[#444]
          text-gray-900 dark:text-white
          placeholder-gray-400
          focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
          outline-none transition-all text-sm
        `}
      />
    </div>
  </div>
);

InputField.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  id: PropTypes.string.isRequired
};

const SelectField = ({ label, icon: Icon, children, id, ...props }) => (
  <div className="space-y-1 w-full">
    <label htmlFor={id} className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />}
      <select
        {...props}
        id={id}
        className={`
          w-full ${Icon ? 'pl-9' : 'pl-3'} pr-8 py-2.5 rounded-lg
          bg-white dark:bg-[#252525] 
          border border-gray-300 dark:border-[#444]
          text-gray-900 dark:text-white
          placeholder-gray-400
          focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
          outline-none transition-all text-sm appearance-none
        `}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  </div>
);

SelectField.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  children: PropTypes.node,
  id: PropTypes.string.isRequired
};

const ResultadoModal = ({ isOpen, onClose, onSubmit, editingResultado, competencias = [], atletas = [], pruebas = [] }) => {
  const [form, setForm] = useState(new ResultadoCompetencia());
  const baseId = useId();

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
    { value: 'METROS', label: 'Metros (m)' },
    { value: 'SEGUNDOS', label: 'Segundos (s)' },
    { value: 'MINUTOS', label: 'Minutos (min)' },
    { value: 'KILOMETROS', label: 'Kilómetros (km)' },
    { value: 'CENTIMETROS', label: 'Centímetros (cm)' },
    { value: 'PUNTOS', label: 'Puntos' }
  ];

  const safeValue = (value) => {
    if (value === null || value === undefined || (typeof value === "number" && isNaN(value))) return "";
    return value;
  };

  const normalizeUnit = (u) => {
    if (!u) return "METROS";
    if (u === "m" || u === "METROS") return "METROS";
    if (u === "s" || u === "SEGUNDOS") return "SEGUNDOS";
    if (u === "min" || u === "MINUTOS") return "MINUTOS";
    if (u === "km" || u === "KILOMETROS") return "KILOMETROS";
    if (u === "cm" || u === "CENTIMETROS") return "CENTIMETROS";
    return u;
  };

  useEffect(() => {
    if (!isOpen) return;

    if (editingResultado) {
      const atletaObj = atletas.find(a => a.id === editingResultado.atleta_id) ?? null;
      const pruebaObj = pruebas.find(p => p.id === editingResultado.prueba_id) ?? null;
      const competenciaObj = competencias.find(c => c.external_id === editingResultado.competencia_id) ?? null;

      const inicializado = {
        external_id: editingResultado.external_id,
        atleta_id: (atletaObj?.external_id || editingResultado.atleta_id) ?? "", // Fallback to raw ID if object not found but ID exists
        atleta: atletaObj,
        prueba_id: (pruebaObj?.external_id || editingResultado.prueba_id) ?? "",
        prueba: pruebaObj,
        competencia_id: (competenciaObj?.external_id || editingResultado.competencia_id) ?? "",
        competencia: competenciaObj,
        resultado: safeValue(editingResultado.resultado),
        unidad_medida: normalizeUnit(editingResultado.unidad_medida),
        posicion_final: editingResultado.posicion_final ?? "participante",
        puesto_obtenido: editingResultado.puesto_obtenido ?? null,
        observaciones: editingResultado.observaciones ?? "",
        estado: editingResultado.estado ?? true,
      };
      setForm(inicializado);
    } else {
      setForm(new ResultadoCompetencia());
    }
  }, [editingResultado, atletas, pruebas, competencias, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      competencia_id: form.competencia_id,
      atleta_id: form.atleta_id,
      prueba_id: form.prueba_id,
      resultado: form.resultado !== "" ? parseFloat(form.resultado) : null,
      unidad_medida: form.unidad_medida,
      puesto_obtenido: form.puesto_obtenido !== "" ? Number(form.puesto_obtenido) : null,
      posicion_final: form.posicion_final,
      observaciones: form.observaciones,
      estado: form.estado
    };

    if (!form.competencia_id || !form.atleta_id || !form.prueba_id || payload.resultado === null || !form.posicion_final) {
      Swal.fire({
        title: "Error",
        text: "Por favor complete todos los campos obligatorios.",
        icon: "error",
        confirmButtonColor: '#b30c25',
        background: '#1a1a1a',
        color: '#fff'
      });
      return;
    }

    try {
      onSubmit(payload);
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al guardar.",
        icon: "error",
        confirmButtonColor: '#b30c25',
        background: '#1a1a1a',
        color: '#fff'
      });
    }
  };

  return (
    <dialog
      open={isOpen}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 w-full h-full border-none outline-none overflow-y-auto"
    >
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-default bg-transparent"
        onClick={onClose}
        aria-label="Cerrar modal"
      />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#333] my-8 flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-[#333] flex justify-between items-center bg-gray-50 dark:bg-[#252525] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-[#b30c25] flex items-center justify-center font-bold">
              {editingResultado ? <Edit3 size={20} /> : <Save size={20} />}
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingResultado ? 'Editar Resultado' : 'Nuevo Resultado'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Competencia */}
          <SelectField
            label="Competencia *"
            icon={Trophy}
            id={`${baseId}-cmp`}
            value={form.competencia_id}
            onChange={(e) => {
              const selected = competencias.find(c => c.external_id === e.target.value);
              setForm({ ...form, competencia_id: selected?.external_id ?? "", competencia: selected ?? null });
            }}
            required
          >
            <option value="">Selecciona Competencia</option>
            {competencias.map(c => (
              <option key={c.external_id} value={c.external_id}>{c.nombre}</option>
            ))}
          </SelectField>

          {/* Atleta */}
          <SelectField
            label="Atleta *"
            icon={User}
            id={`${baseId}-atl`}
            value={form.atleta_id}
            onChange={e => {
              const val = e.target.value;
              const selected = atletas.find(a => (a.atleta?.external_id || a.external_id) === val);
              setForm({ ...form, atleta_id: val, atleta: selected ?? null });
            }}
            required
          >
            <option value="">Seleccione un atleta</option>
            {(atletas || []).map(a => (
              <option key={a.external_id} value={a.atleta?.external_id || a.external_id}>
                {a.first_name || a.username} {a.last_name || ""}
              </option>
            ))}
          </SelectField>

          {/* Prueba */}
          <SelectField
            label="Prueba *"
            icon={Activity}
            id={`${baseId}-pru`}
            value={form.prueba_id}
            onChange={e => {
              const selected = pruebas.find(p => p.external_id === e.target.value);
              setForm({ ...form, prueba_id: selected?.external_id ?? "", prueba: selected ?? null });
            }}
            required
          >
            <option value="">Seleccione una prueba</option>
            {pruebas.map(p => (
              <option key={p.external_id} value={p.external_id}>{p.siglas} - {p.tipo_prueba}</option>
            ))}
          </SelectField>

          {/* Resultado y unidad */}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Resultado *"
              icon={Hash}
              id={`${baseId}-res`}
              type="number"
              step="0.01"
              value={safeValue(form.resultado)}
              onChange={e => setForm({ ...form, resultado: e.target.value })}
              required
            />
            <SelectField
              label="Unidad *"
              icon={Ruler}
              id={`${baseId}-uni`}
              value={safeValue(form.unid_medida) || (safeValue(form.unidad_medida) || 'METROS')}
              onChange={e => setForm({ ...form, unidad_medida: e.target.value })}
              required
            >
              {unidadesMedida.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </SelectField>
          </div>

          {/* Posición y puesto */}
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Posición Final *"
              icon={Trophy}
              id={`${baseId}-pos`}
              value={safeValue(form.posicion_final)}
              onChange={e => setForm({ ...form, posicion_final: e.target.value })}
              required
            >
              {posicionesDisponibles.map(pos => <option key={pos.value} value={pos.value}>{pos.label}</option>)}
            </SelectField>
            <InputField
              label="Puesto Numérico"
              icon={Hash}
              id={`${baseId}-pue`}
              type="number"
              value={safeValue(form.puesto_obtenido)}
              onChange={e => setForm({ ...form, puesto_obtenido: e.target.value ? Number(e.target.value) : null })}
              placeholder="Ej: 1"
            />
          </div>

          {/* Observaciones */}
          <div className="space-y-1 w-full">
            <label htmlFor={`${baseId}-obs`} className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Observaciones</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400" size={16} />
              <textarea
                id={`${baseId}-obs`}
                value={safeValue(form.observaciones)}
                onChange={e => setForm({ ...form, observaciones: e.target.value })}
                rows="2"
                className="
                                    w-full pl-9 pr-3 py-2.5 rounded-lg
                                    bg-white dark:bg-[#252525] 
                                    border border-gray-300 dark:border-[#444]
                                    text-gray-900 dark:text-white
                                    placeholder-gray-400
                                    focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
                                    outline-none transition-all text-sm
                                "
              />
            </div>
          </div>

          {/* TOGGLE DE ESTADO */}
          <div className="flex items-center justify-between px-5 py-4 rounded-xl bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333]">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                {form.estado ? <Eye size={18} /> : <EyeOff size={18} />}
                Estado del Resultado
              </span>
              <span className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${form.estado ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
                {form.estado ? 'Visible / Activo' : 'Oculto / Inactivo'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setForm({ ...form, estado: !form.estado })}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${form.estado ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${form.estado ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-[#333]">
            <button
              type="button"
              onClick={onClose}
              className="
                                flex-1 px-4 py-3 rounded-xl font-bold
                                text-gray-700 dark:text-gray-300 
                                border border-gray-300 dark:border-[#444]
                                hover:bg-gray-50 dark:hover:bg-[#252525]
                                transition-all
                            "
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="
                                flex-1 px-4 py-3 rounded-xl font-bold text-white
                                bg-linear-to-r from-[#b30c25] to-[#80091b]
                                hover:brightness-110 shadow-lg shadow-red-900/20 
                                active:scale-95 transition-all
                            "
            >
              {editingResultado ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div >
    </dialog>
  );
};

ResultadoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editingResultado: PropTypes.shape({
    external_id: PropTypes.string,
    atleta_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    prueba_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    competencia_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    resultado: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    unidad_medida: PropTypes.string,
    posicion_final: PropTypes.string,
    puesto_obtenido: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    observaciones: PropTypes.string,
    estado: PropTypes.bool
  }),
  competencias: PropTypes.array,
  atletas: PropTypes.array,
  pruebas: PropTypes.array
};

export default ResultadoModal;
