import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import pruebaService from "../../services/prueba_service";
// import baremoService from "../../services/baremo_service"; // Passed via props implicitly or used in parent

const BaremoModal = ({ isOpen, onClose, onSubmit, editingBaremo }) => {
  const [loading, setLoading] = useState(false);
  const [pruebas, setPruebas] = useState([]);

  // Estado del formulario
  const [form, setForm] = useState({
    prueba_id: "",
    sexo: "M",
    edad_min: "",
    edad_max: "",
    estado: true,
    items: [] // { marca_minima, marca_maxima, clasificacion }
  });

  // Cargar Pruebas al abrir
  useEffect(() => {
    if (isOpen) {
      const loadPruebas = async () => {
        try {
          const data = await pruebaService.getAll();
          setPruebas(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Error cargando pruebas", error);
        }
      };
      loadPruebas();

      if (editingBaremo) {
        // Mapear datos existentes - need to find prueba external_id from prueba_id
        const pruebaExternalId = editingBaremo.prueba_external_id || editingBaremo.prueba_id || "";

        setForm({
          ...editingBaremo,
          prueba_id: pruebaExternalId,
          items: editingBaremo.items || []
        });
      } else {
        // Reset
        setForm({
          prueba_id: "",
          sexo: "M",
          edad_min: "",
          edad_max: "",
          estado: true,
          items: [{ marca_minima: "", marca_maxima: "", clasificacion: "PRINCIPIANTE" }]
        });
      }
    }
  }, [isOpen, editingBaremo]);

  if (!isOpen) return null;

  // Manejo de Items
  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;
    setForm({ ...form, items: newItems });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { marca_minima: "", marca_maxima: "", clasificacion: "INTERMEDIO" }]
    });
  };

  const removeItem = (index) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!form.prueba_id) return Swal.fire("Error", "Seleccione una prueba", "error");
    if (form.items.length === 0) return Swal.fire("Error", "Agregue al menos un rango de calificación", "error");

    const payload = {
      ...form,
      edad_min: Number(form.edad_min),
      edad_max: Number(form.edad_max),
      items: form.items.map(i => ({
        ...i,
        marca_minima: Number(i.marca_minima),
        marca_maxima: Number(i.marca_maxima)
      }))
    };

    const result = await Swal.fire({
      title: editingBaremo ? '¿Actualizar Baremo?' : '¿Crear Baremo?',
      text: "Se guardará la configuración de puntuación.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#b30c25',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      background: '#212121',
      color: '#fff'
    });

    if (result.isConfirmed) {
      onSubmit(payload);
    }
  };

  return (
    <dialog
      open={isOpen}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 overflow-y-auto w-full h-full border-none outline-none"
      aria-labelledby="modal-title"
    >
      <div className="w-full max-w-4xl bg-[#1e1e1e] rounded-2xl shadow-2xl border border-[#333] my-8">

        {/* HEADER */}
        <div className="px-8 py-6 border-b border-[#333] flex justify-between items-center bg-[#252525] rounded-t-2xl">
          <div>
            <h2 id="modal-title" className="text-2xl font-bold text-white mb-1">
              {editingBaremo ? 'Editar Baremo' : 'Nuevo Baremo'}
            </h2>
            <p className="text-gray-400 text-sm">Configura las reglas de puntuación y clasificación</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Cerrar modal">
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">

          {/* SECCIÓN 1: CONTEXTO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="baremo-prueba" className="block text-sm font-medium text-gray-300 mb-2">Prueba</label>
              <select
                id="baremo-prueba"
                className="w-full bg-[#121212] border border-[#444] rounded-xl px-4 py-3 text-white focus:border-[#b30c25] focus:ring-1 focus:ring-[#b30c25] outline-none transition"
                value={form.prueba_id}
                onChange={e => setForm({ ...form, prueba_id: e.target.value })}
                required
              >
                <option value="">Seleccione Prueba...</option>
                {pruebas.map(p => (
                  <option key={p.external_id} value={p.external_id}>
                    {p.nombre} ({p.tipo_medicion})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sexo</label>
              <fieldset className="flex bg-[#121212] rounded-xl p-1 border border-[#444]" aria-label="Seleccionar sexo">
                {['M', 'F'].map(sex => (
                  <button
                    type="button"
                    key={sex}
                    onClick={() => setForm({ ...form, sexo: sex })}
                    aria-pressed={form.sexo === sex}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${form.sexo === sex
                      ? 'bg-[#b30c25] text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    {sex === 'M' ? 'Masculino' : 'Femenino'}
                  </button>
                ))}
              </fieldset>
            </div>

            <div>
              <label htmlFor="baremo-edad-min" className="block text-sm font-medium text-gray-300 mb-2">Edad Mínima (años)</label>
              <input
                id="baremo-edad-min"
                type="number"
                className="w-full bg-[#121212] border border-[#444] rounded-xl px-4 py-3 text-white focus:border-[#b30c25] outline-none"
                value={form.edad_min}
                onChange={e => setForm({ ...form, edad_min: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="baremo-edad-max" className="block text-sm font-medium text-gray-300 mb-2">Edad Máxima (años)</label>
              <input
                id="baremo-edad-max"
                type="number"
                className="w-full bg-[#121212] border border-[#444] rounded-xl px-4 py-3 text-white focus:border-[#b30c25] outline-none"
                value={form.edad_max}
                onChange={e => setForm({ ...form, edad_max: e.target.value })}
                required
              />
            </div>
          </div>

          <hr className="border-[#333]" />

          {/* SECCIÓN 2: ITEMS (RANGOS) */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Rangos de Clasificación</h3>
              <button
                type="button"
                onClick={addItem}
                className="text-[#b30c25] hover:text-[#d41c3a] font-bold text-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-lg" aria-hidden="true">add_circle</span>{' '}
                Agregar Rango
              </button>
            </div>

            <div className="space-y-3">
              {form.items.map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-3 items-start bg-[#161616] p-4 rounded-xl border border-[#333] group hover:border-[#555] transition">
                  <div className="flex-1 w-full">
                    <label htmlFor={`marca-min-${index}`} className="text-xs text-gray-500 mb-1 block">Marca Mínima</label>
                    <input
                      id={`marca-min-${index}`}
                      type="number" step="0.01"
                      className="w-full bg-[#252525] border border-[#444] rounded-lg px-3 py-2 text-white text-sm"
                      value={item.marca_minima}
                      onChange={e => handleItemChange(index, 'marca_minima', e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label htmlFor={`marca-max-${index}`} className="text-xs text-gray-500 mb-1 block">Marca Máxima</label>
                    <input
                      id={`marca-max-${index}`}
                      type="number" step="0.01"
                      className="w-full bg-[#252525] border border-[#444] rounded-lg px-3 py-2 text-white text-sm"
                      value={item.marca_maxima}
                      onChange={e => handleItemChange(index, 'marca_maxima', e.target.value)}
                      placeholder="10.00"
                      required
                    />
                  </div>
                  <div className="flex-2 w-full">
                    <label htmlFor={`clasif-${index}`} className="text-xs text-gray-500 mb-1 block">Clasificación</label>
                    <select
                      id={`clasif-${index}`}
                      className="w-full bg-[#252525] border border-[#444] rounded-lg px-3 py-2 text-white text-sm"
                      value={item.clasificacion}
                      onChange={e => handleItemChange(index, 'clasificacion', e.target.value)}
                      required
                    >
                      <option value="">Seleccione...</option>
                      <option value="PRINCIPIANTE">PRINCIPIANTE</option>
                      <option value="INTERMEDIO">INTERMEDIO</option>
                      <option value="AVANZADO">AVANZADO</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="mt-6 md:mt-5 p-2 text-gray-500 hover:text-red-500 transition rounded-lg hover:bg-red-500/10"
                    aria-label={`Eliminar rango ${index + 1}`}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                  </button>
                </div>
              ))}
              {form.items.length === 0 && (
                <div className="text-center py-8 text-gray-500 border border-dashed border-[#444] rounded-xl">
                  No hay rangos definidos.
                </div>
              )}
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex gap-4 pt-4 border-t border-[#333]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl font-bold text-gray-400 border border-[#444] hover:bg-[#252525] transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-xl font-bold text-white bg-linear-to-r from-[#b30c25] to-[#7a0819] hover:brightness-110 shadow-lg shadow-red-900/20 transition"
            >
              {editingBaremo ? 'Guardar Cambios' : 'Crear Baremo'}
            </button>
          </div>

        </form>
      </div>
    </dialog>

  );
};

BaremoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editingBaremo: PropTypes.shape({
    id: PropTypes.number,
    prueba_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    prueba_external_id: PropTypes.string,
    sexo: PropTypes.string,
    edad_min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    edad_max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    items: PropTypes.arrayOf(PropTypes.shape({
      marca_minima: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      marca_maxima: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      clasificacion: PropTypes.string
    }))
  })
};

export default BaremoModal;
