import { useEffect, useState } from "react";
import ResultadoCompetencia from "../../domain/models/ResultadoCompetencia";
import PruebaRepository from "../../services/prueba_service";
import AtletaService from "../../../atleta/services/AtletaService";
import AdminService from "../../../admin/services/adminService";
import resultadoCompetenciaService from "../../services/resultado_competencia_service";
import Swal from "sweetalert2";

const ResultadoModal = ({ isOpen, onClose, onSubmit, editingResultado, competencias = [], atletas = [], pruebas = [] }) => {
  const [form, setForm] = useState(new ResultadoCompetencia());
  const [loading, setLoading] = useState(false);

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

  const safeValue = (value) => {
    if (value === null || value === undefined || (typeof value === "number" && isNaN(value))) return "";
    return value;
  };


  // Inicializar formulario
  useEffect(() => {
    if (!isOpen) return;

    if (editingResultado) {
      // Buscar objetos completos
      const atletaObj = atletas.find(a => a.id === editingResultado.atleta_id) ?? null;
      const pruebaObj = pruebas.find(p => p.id === editingResultado.prueba_id) ?? null;
      const competenciaObj = competencias.find(c => c.external_id === editingResultado.competencia_id) ?? null;

      const inicializado = {
        external_id: editingResultado.external_id,
        atleta_id: atletaObj ? (atletaObj.atleta?.external_id || atletaObj.external_id) : "",
        atleta: atletaObj,
        prueba_id: pruebaObj?.external_id ?? "",
        prueba: pruebaObj,
        competencia_id: competenciaObj?.external_id ?? "",
        competencia: competenciaObj,
        resultado: safeValue(editingResultado.resultado),
        unidad_medida: editingResultado.unidad_medida ?? "m",
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
      puesto_obtenido: form.puesto_obtenido !== "" ? Number(form.puesto_obtenido) : null,
      posicion_final: form.posicion_final,
      observaciones: form.observaciones,
      estado: form.estado
    };



    // Validaciones básicas
    if (!form.competencia_id || !form.atleta_id || !form.prueba_id || payload.resultado === null || !form.posicion_final) {
      Swal.fire("Error", "Por favor complete todos los campos obligatorios con valores válidos.", "error");
      return;
    }

    try {
      // Delegamos la persistencia al padre (ResultadosPage) via onSubmit
      onSubmit(payload);
      onClose();
    } catch (err) {
      console.error("❌ Error al guardar:", err);
      Swal.fire("Error", "Ocurrió un error al guardar el resultado. Revisa la consola para más info.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-[#212121] rounded-2xl shadow-2xl border border-[#332122]">
        <div className="px-6 py-5 border-b border-[#332122] flex justify-between items-center bg-[#1a1a1a]">
          <div>
            <h2 className="text-lg font-black text-gray-100">{editingResultado ? 'Editar Resultado' : 'Nuevo Resultado'}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-1.5">
          {/* Competencia */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-300">Competencia *</label>
            <select
              value={form.competencia_id}
              onChange={(e) => {
                const selected = competencias.find(c => c.external_id === e.target.value);
                setForm({ ...form, competencia_id: selected?.external_id ?? "", competencia: selected ?? null });
              }}
              className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm"              required
            >
              <option value="">Selecciona Competencia</option>
              {competencias.map(c => (
                <option key={c.external_id} value={c.external_id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* Atleta */}
          <div>
            <label className="block text-xs font-semibold mb-1">Atleta *</label>
            <select
              value={form.atleta_id}
              onChange={e => {
                const val = e.target.value;
                const selected = atletas.find(a => (a.atleta?.external_id || a.external_id) === val);
                setForm({ ...form, atleta_id: val, atleta: selected ?? null });
              }}
              className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm"                required
            >
              <option value="">Seleccione un atleta</option>
              {(atletas || []).map(a => (
                <option key={a.external_id} value={a.atleta?.external_id || a.external_id}>
                  {a.first_name || a.username} {a.last_name || ""} {!a.atleta ? "(Sin perfil de atleta)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Prueba */}
          <div>
            <label className="block text-xs font-semibold mb-1">Prueba *</label>
            <select
              value={form.prueba_id}
              onChange={e => {
                const selected = pruebas.find(p => p.external_id === e.target.value);
                setForm({ ...form, prueba_id: selected?.external_id ?? "", prueba: selected ?? null });
              }}
              className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm"                required
            >
              <option value="">Seleccione una prueba</option>
              {pruebas.map(p => (
                <option key={p.external_id} value={p.external_id}>{p.siglas} - {p.tipo_prueba}</option>
              ))}
            </select>
          </div>

          {/* Resultado y unidad */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">Resultado *</label>
              <input
                type="number"
                step="0.01"
                value={safeValue(form.resultado)}
                onChange={e => setForm({ ...form, resultado: e.target.value })}
                className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm"                  required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Unidad *</label>
              <select
                value={safeValue(form.unidad_medida) || 'm'}
                onChange={e => setForm({ ...form, unidad_medida: e.target.value })}
                className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm"                  required
              >
                {unidadesMedida.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>

          {/* Posición y puesto */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">Posición Final *</label>
              <select
                value={safeValue(form.posicion_final)}
                onChange={e => setForm({ ...form, posicion_final: e.target.value })}
                className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm"                  required
              >
                {posicionesDisponibles.map(pos => <option key={pos.value} value={pos.value}>{pos.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Puesto Numérico</label>
              <input
                type="number"
                value={safeValue(form.puesto_obtenido)}
                onChange={e => setForm({ ...form, puesto_obtenido: e.target.value ? Number(e.target.value) : null })}
                className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm"                  placeholder="Ej: 1,2,3..."
              />
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-semibold mb-1">Observaciones</label>
            <textarea
              value={safeValue(form.observaciones)}
              onChange={e => setForm({ ...form, observaciones: e.target.value })}
              rows="2"
              className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm"              />
          </div>

          {/* TOGGLE DE ESTADO */}
          <div className="flex items-center justify-between px-5 py-4 rounded-2xl bg-[#1c1c1c] border border-[#332122]">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-200">
                Estado
              </span>
              <span
                className={`text-[11px] font-black uppercase tracking-wider ${form.estado ? 'text-green-400' : 'text-red-400'
                  }`}
              >
                {form.estado ? 'Activo / Visible' : 'Inactivo / Oculto'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setForm({ ...form, estado: !form.estado })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${form.estado ? 'bg-green-500' : 'bg-gray-600'
                }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-md ${form.estado ? 'translate-x-7' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="
      flex-1 px-5 py-3 rounded-xl font-semibold
      border border-[#332122]
      text-gray-400
      hover:bg-[#242223] hover:text-gray-200
      transition-all duration-300
    "
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="
      flex-1 px-5 py-3 rounded-xl font-semibold text-white
      bg-gradient-to-r from-[#b30c25] via-[#362022] to-[#332122]
      hover:brightness-110
      transition-all duration-300
      active:scale-95
      shadow-lg
    "
            >
              {editingResultado ? 'Actualizar Resultado' : 'Guardar Resultado'}
            </button>
          </div>
        </form>
      </div >
    </div>
  );
};

export default ResultadoModal;
