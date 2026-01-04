import { useEffect, useState } from "react";
import ResultadoCompetencia from "../../domain/models/ResultadoCompetencia";
import PruebaRepository from "../../services/prueba_service";
import AdminService from "../../../admin/services/adminService";
import resultadoCompetenciaService from "../../services/resultado_competencia_service";
import Swal from "sweetalert2";

const ResultadoModal = ({ isOpen, onClose, onSubmit, editingResultado, competencias = [] }) => {
  const [form, setForm] = useState(new ResultadoCompetencia());
  const [atletas, setAtletas] = useState([]);
  const [pruebas, setPruebas] = useState([]);
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

  // Cargar atletas y pruebas
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);

    Promise.all([
      AdminService.getUsers(1, 100).catch(() => ({ users: [] })),
      PruebaRepository.getAll().catch(() => [])
    ])
      .then(([usersResponse, pruebasResponse]) => {
        const atletasData = (usersResponse.users || []).filter(u => u.role === "ATLETA");
        setAtletas(atletasData);
        setPruebas(pruebasResponse || []);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  // Inicializar formulario
  useEffect(() => {
    if (!isOpen) return;

    if (editingResultado) {
      console.log("📝 Editing resultado:", editingResultado);

      // Buscar objetos completos
      const atletaObj = atletas.find(a => a.id === editingResultado.atleta_id) ?? null;
      const pruebaObj = pruebas.find(p => p.id === editingResultado.prueba_id) ?? null;
      const competenciaObj = competencias.find(c => c.external_id === editingResultado.competencia_id) ?? null;

      const inicializado = {
        external_id: editingResultado.external_id,
        atleta_id: atletaObj?.id ?? "",
        atleta: atletaObj,
        prueba_id: (pruebaObj?.id ?? pruebaObj?.external_id) ?? "",
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

      console.log("🔹 Form inicializado con:", inicializado);
      setForm(inicializado);
    } else {
      console.log("🆕 Nuevo formulario inicializado");
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

    console.log("🚀 Form antes de enviar:", form);
    console.log("📤 Payload a enviar:", payload);

    // Validaciones básicas
    if (!form.competencia_id || !form.atleta_id || !form.prueba_id || payload.resultado === null || !form.posicion_final) {
      Swal.fire("Error", "Por favor complete todos los campos obligatorios con valores válidos.", "error");
      return;
    }

    try {
      if (editingResultado) {
        console.log("🔹 Actualizando resultado con external_id:", form.external_id);
        await resultadoCompetenciaService.update(form.external_id, payload);
      } else {
        console.log("➕ Creando nuevo resultado");
        await resultadoCompetenciaService.create(payload);
      }

      Swal.fire("Éxito", "Resultado guardado correctamente", "success");
      onSubmit(payload);
      onClose();
    } catch (err) {
      console.error("❌ Error al guardar:", err);
      Swal.fire("Error", "Ocurrió un error al guardar el resultado. Revisa la consola para más info.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-lg overflow-hidden my-4">
        <div className="p-3 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">{editingResultado ? 'Editar Resultado' : 'Nuevo Resultado'}</h2>
            <p className="text-xs text-gray-500 mt-1">Complete los detalles del resultado</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 space-y-3">
          {/* Competencia */}
          <div>
            <label className="block text-xs font-semibold mb-1">Competencia *</label>
            <select
              value={form.competencia_id}
              onChange={(e) => {
                const selected = competencias.find(c => c.external_id === e.target.value);
                setForm({ ...form, competencia_id: selected?.external_id ?? "", competencia: selected ?? null });
              }}
              className="w-full border border-gray-200 rounded-md px-2 py-1"
              required
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
                const selected = atletas.find(a => a.id === e.target.value);
                setForm({ ...form, atleta_id: selected?.id ?? "", atleta: selected ?? null });
              }}
              className="w-full border border-gray-200 rounded-md px-2 py-1"
              required
            >
              <option value="">Seleccione un atleta</option>
              {atletas.map(a => (
                <option key={a.id} value={a.id}>{a.username} ({a.email})</option>
              ))}
            </select>
          </div>

          {/* Prueba */}
          <div>
            <label className="block text-xs font-semibold mb-1">Prueba *</label>
            <select
              value={form.prueba_id}
              onChange={e => {
                const selected = pruebas.find(p => (p.id ?? p.external_id) === e.target.value);
                setForm({ ...form, prueba_id: selected?.id ?? selected?.external_id ?? "", prueba: selected ?? null });
              }}
              className="w-full border border-gray-200 rounded-md px-2 py-1"
              required
            >
              <option value="">Seleccione una prueba</option>
              {pruebas.map(p => (
                <option key={p.id ?? p.external_id} value={p.id ?? p.external_id}>{p.siglas} - {p.tipo_prueba}</option>
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
                className="w-full border border-gray-200 rounded-md px-2 py-1"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Unidad *</label>
              <select
                value={safeValue(form.unidad_medida) || 'm'}
                onChange={e => setForm({ ...form, unidad_medida: e.target.value })}
                className="w-full border border-gray-200 rounded-md px-2 py-1"
                required
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
                className="w-full border border-gray-200 rounded-md px-2 py-1"
                required
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
                className="w-full border border-gray-200 rounded-md px-2 py-1"
                placeholder="Ej: 1,2,3..."
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
              className="w-full border border-gray-200 rounded-md px-2 py-1 resize-none"
            />
          </div>

          {/* Toggle estado */}
          <div className="flex items-center justify-between p-1 bg-gray-50 rounded-md border border-gray-200">
            <span className="text-xs font-semibold">Estado: {form.estado ? 'Activo' : 'Inactivo'}</span>
            <button
              type="button"
              onClick={() => setForm({ ...form, estado: !form.estado })}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 ${form.estado ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform bg-white rounded-full transition-transform duration-300 ${form.estado ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>

          <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-md font-bold hover:bg-red-700">
            {editingResultado ? 'Actualizar Resultado' : 'Guardar Resultado'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResultadoModal;
