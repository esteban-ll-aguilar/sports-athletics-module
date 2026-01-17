import { useEffect, useState } from "react";
import Competencia from "../../domain/models/Competencia";
import Swal from "sweetalert2";

const CompetenciaModal = ({ isOpen, onClose, onSubmit, editingCompetencia }) => {
  const [form, setForm] = useState(new Competencia());

  useEffect(() => {
    if (editingCompetencia) setForm(editingCompetencia);
    else setForm(new Competencia());
  }, [editingCompetencia, isOpen]);

  if (!isOpen) return null;

  // Manejar creación o edición
  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: editingCompetencia ? '¿Desea actualizar esta competencia?' : '¿Desea crear esta competencia?',
      text: editingCompetencia
        ? 'Se actualizará la competencia seleccionada.'
        : 'Se creará una nueva competencia.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ec1313'
    });

    if (result.isConfirmed) {
      onSubmit(form);

      await Swal.fire({
        icon: 'success',
        title: editingCompetencia ? 'Competencia actualizada' : 'Competencia creada',
        text: `La competencia ha sido ${editingCompetencia ? 'actualizada' : 'creada'} correctamente.`,
        confirmButtonColor: '#ec1313'
      });

      onClose();
    }
  };

  // Manejar cambio de estado con alerta
  const toggleEstado = async () => {
    const action = form.estado ? 'desactivar' : 'activar';

    const result = await Swal.fire({
      title: `¿Desea ${action} esta competencia?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: "#b30c25",
    });

    if (result.isConfirmed) {
      setForm({ ...form, estado: !form.estado });

      Swal.fire({
        icon: 'success',
        title: `Competencia ${form.estado ? 'desactivada' : 'activada'}`,
        text: `La competencia ha sido ${form.estado ? 'desactivada' : 'activada'} correctamente.`,
        confirmButtonColor: "#b30c25"
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-[#212121] rounded-2xl shadow-2xl border border-[#332122]">
        {/* HEADER */}
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-[#332122] flex items-center justify-between bg-[#1a1a1a] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(179,12,37,0.15)] text-[#b30c25] flex items-center justify-center font-black">
              {editingCompetencia ? "✎" : "C"}
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-100">
                {editingCompetencia ? "Editar Competencia" : "Nueva Competencia"}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-6">

          {/* CAMPO NOMBRE */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-300">
              Nombre de la Competencia *
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Campeonato Nacional de Atletismo 2024"
              className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm"             required
            />
          </div>

          {/* CAMPOS FECHA Y LUGAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-300">Fecha del Evento *</label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                   required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-300">Lugar *</label>
              <input
                type="text"
                name="lugar"
                value={form.lugar}
                onChange={(e) => setForm({ ...form, lugar: e.target.value })}
                placeholder="Ej: Estadio Olímpico"
                className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                   required
              />
            </div>
          </div>

          {/* CAMPO DESCRIPCIÓN */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Descripción (Opcional)</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Detalles sobre categorías, patrocinadores o requisitos especiales..."
              rows="4"
              className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "               />
          </div>

          {/* TOGGLE DE ESTADO */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#1c1c1c] border border-[#332122]">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-200">Estado</span>
              <span className={`text-[11px] font-black uppercase tracking-wider ${form.estado ? 'text-green-400' : 'text-red-400'}`}>
                {form.estado ? 'Activo / Visible' : 'Inactivo / Oculto'}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleEstado}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${form.estado ? 'bg-green-500' : 'bg-gray-600'
                }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-md ${form.estado ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="
                flex-1 px-4 py-3 rounded-xl font-semibold
                border border-[#332122] text-gray-400
                hover:bg-[#242223] transition
              "            >
              Cancelar
            </button>
            <button
              type="submit"
              className="
                flex-1 px-4 py-3 rounded-xl font-semibold text-white
                bg-gradient-to-r from-[#b30c25] via-[#362022] to-[#332122]
                hover:brightness-110 transition active:scale-95
              "
            >
              {editingCompetencia ? 'Guardar Cambios' : 'Crear Competencia'}
            </button>
          </div>
        </form>
      </div >
    </div >
  );
};

export default CompetenciaModal;
