import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import pruebaService from "../../services/prueba_service";
import { X, Activity, Users, Ruler, PlusCircle, Trash2, Edit3, Save, AlertCircle } from "lucide-react";

const BaremoModal = ({ isOpen, onClose, onSubmit, editingBaremo }) => {
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
        // Mapear datos existentes
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
      background: '#1a1a1a',
      color: '#fff',
      customClass: {
        popup: 'dark:bg-[#1a1a1a] dark:text-white dark:border dark:border-[#332122]'
      }
    });

    if (result.isConfirmed) {
      onSubmit(payload);
    }
  };

  const InputField = ({ label, ...props }) => (
    <div className="space-y-1 w-full">
      <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{label}</label>
      <input
        {...props}
        className={`
                    w-full px-3 py-2.5 rounded-lg
                    bg-white dark:bg-[#252525] 
                    border border-gray-300 dark:border-[#444]
                    text-gray-900 dark:text-white
                    placeholder-gray-400
                    focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
                    outline-none transition-all text-sm
                `}
      />
    </div>
  );


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 overflow-y-auto">
      <div className="absolute inset-0 transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#333] my-8 flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-[#333] flex justify-between items-center bg-gray-50 dark:bg-[#252525] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-[#b30c25] flex items-center justify-center font-bold">
              {editingBaremo ? <Edit3 size={20} /> : <PlusCircle size={20} />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {editingBaremo ? 'Editar Baremo' : 'Nuevo Baremo'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Configura las reglas de puntuación</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto">

          {/* SECCIÓN 1: CONTEXTO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Prueba</label>
              <div className="relative">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-[#121212] border border-gray-300 dark:border-[#444] text-gray-900 dark:text-white focus:border-[#b30c25] focus:ring-1 focus:ring-[#b30c25] outline-none transition appearance-none"
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
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Sexo</label>
              <div className="flex bg-gray-100 dark:bg-[#121212] rounded-xl p-1 border border-gray-200 dark:border-[#444]">
                {['M', 'F'].map(sex => (
                  <button
                    type="button"
                    key={sex}
                    onClick={() => setForm({ ...form, sexo: sex })}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${form.sexo === sex
                      ? 'bg-white dark:bg-[#b30c25] text-[#b30c25] dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    <Users size={16} />
                    {sex === 'M' ? 'Masculino' : 'Femenino'}
                  </button>
                ))}
              </div>
            </div>

            <InputField
              label="Edad Mínima (años)"
              type="number"
              value={form.edad_min}
              onChange={e => setForm({ ...form, edad_min: e.target.value })}
              required
            />

            <InputField
              label="Edad Máxima (años)"
              type="number"
              value={form.edad_max}
              onChange={e => setForm({ ...form, edad_max: e.target.value })}
              required
            />
          </div>

          <hr className="border-gray-200 dark:border-[#333]" />

          {/* SECCIÓN 2: ITEMS (RANGOS) */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Ruler size={20} className="text-[#b30c25]" />
                Rangos de Clasificación
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="text-[#b30c25] hover:text-[#d41c3a] font-bold text-sm flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-900/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <PlusCircle size={18} />
                Agregar Rango
              </button>
            </div>

            <div className="space-y-3">
              {form.items.map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-4 items-start bg-gray-50 dark:bg-[#161616] p-4 rounded-xl border border-gray-200 dark:border-[#333] group hover:border-gray-300 dark:hover:border-[#555] transition">
                  <InputField
                    label="Marca Mínima"
                    type="number" step="0.01"
                    value={item.marca_minima}
                    onChange={e => handleItemChange(index, 'marca_minima', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                  <InputField
                    label="Marca Máxima"
                    type="number" step="0.01"
                    value={item.marca_maxima}
                    onChange={e => handleItemChange(index, 'marca_maxima', e.target.value)}
                    placeholder="10.00"
                    required
                  />
                  <InputField
                    label="Clasificación"
                    type="text"
                    value={item.clasificacion}
                    onChange={e => handleItemChange(index, 'clasificacion', e.target.value)}
                    placeholder="Ej: AVANZADO"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="mt-6 md:mt-5 p-2 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Eliminar Rango"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              {form.items.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-[#444] rounded-xl flex flex-col items-center gap-2">
                  <AlertCircle size={32} className="text-gray-300 dark:text-gray-600" />
                  No hay rangos definidos.
                </div>
              )}
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-[#333]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl font-bold text-gray-700 dark:text-gray-400 border border-gray-300 dark:border-[#444] hover:bg-gray-50 dark:hover:bg-[#252525] transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-xl font-bold text-white bg-linear-to-r from-[#b30c25] to-[#7a0819] hover:brightness-110 shadow-lg shadow-red-900/20 transition active:scale-95"
            >
              {editingBaremo ? 'Guardar Cambios' : 'Crear Baremo'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default BaremoModal;
