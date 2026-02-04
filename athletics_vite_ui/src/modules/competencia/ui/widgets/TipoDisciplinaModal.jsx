import { useEffect, useState, useId } from "react";
import PropTypes from "prop-types";
import TipoDisciplina from "../../domain/models/TipoDisciplina";
import Swal from "sweetalert2";
import { X, Trophy, FileText, PlusCircle } from "lucide-react";

const TipoDisciplinaModal = ({ isOpen, onClose, onSubmit, editingData }) => {
  const [form, setForm] = useState(new TipoDisciplina());
  const baseId = useId();

  useEffect(() => {
    if (editingData) {
      setForm(new TipoDisciplina(editingData));
    } else {
      setForm(new TipoDisciplina());
    }
  }, [editingData, isOpen]);

  if (!isOpen) return null;

  // Manejar creación o edición
  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: editingData ? '¿Desea actualizar esta disciplina?' : '¿Desea crear esta disciplina?',
      text: editingData
        ? 'Se actualizará la disciplina seleccionada.'
        : 'Se creará una nueva disciplina.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b30c25',
      cancelButtonColor: '#6b7280',
      background: '#1a1a1a',
      color: '#fff',
      customClass: {
        popup: 'dark:bg-[#1a1a1a] dark:text-white dark:border dark:border-[#332122]'
      }
    });

    if (result.isConfirmed) {
      onSubmit(form);

      await Swal.fire({
        icon: 'success',
        title: editingData ? 'Disciplina actualizada' : 'Disciplina creada',
        text: `La disciplina ha sido ${editingData ? 'actualizada' : 'creada'} correctamente.`,
        confirmButtonColor: '#b30c25',
        background: '#1a1a1a',
        color: '#fff'
      });

      onClose();
    }
  };

  // Manejar cambio de estado con alerta
  const toggleEstado = async () => {
    const action = form.estado ? 'desactivar' : 'activar';

    const result = await Swal.fire({
      title: `¿Desea ${action} esta disciplina?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b30c25',
      cancelButtonColor: '#6b7280',
      background: '#1a1a1a',
      color: '#fff'
    });

    if (result.isConfirmed) {
      setForm({ ...form, estado: !form.estado });

      Swal.fire({
        icon: 'success',
        title: `Disciplina ${form.estado ? 'desactivada' : 'activada'}`,
        text: `La disciplina ha sido ${form.estado ? 'desactivada' : 'activada'} correctamente.`,
        confirmButtonColor: '#b30c25',
        background: '#1a1a1a',
        color: '#fff'
      });
    }
  };

  return (
    <dialog
      open={isOpen}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm w-full h-full border-none outline-none"
    >
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-default bg-transparent"
        onClick={onClose}
        aria-label="Cerrar modal"
      />
      <div className="relative w-full max-w-xl bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#332122] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-[#332122] flex justify-between items-center bg-gray-50 dark:bg-[#212121]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-[#b30c25] flex items-center justify-center font-bold">
              {editingData ? <Trophy size={20} /> : <PlusCircle size={20} />}
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-wide">
              {editingData ? 'Editar Disciplina' : 'Nueva Disciplina'}
            </h2>
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* CAMPO NOMBRE */}
          <div className="space-y-1">
            <label htmlFor={`${baseId}-nombre`} className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Nombre</label>
            <div className="relative">
              <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id={`${baseId}-nombre`}
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Atletismo"
                className="
                        w-full pl-10 pr-3 py-2.5 rounded-lg
                        bg-white dark:bg-[#212121] 
                        border border-gray-300 dark:border-[#332122]
                        text-gray-900 dark:text-gray-100
                        placeholder-gray-400
                        focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
                        outline-none transition-all sm:text-sm
                    "
                required
              />
            </div>
          </div>

          {/* CAMPO DESCRIPCIÓN */}
          <div className="space-y-1">
            <label htmlFor={`${baseId}-descripcion`} className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Descripción</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
              <textarea
                id={`${baseId}-descripcion`}
                name="descripcion"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Breve descripción de la disciplina..."
                className="
                         w-full pl-10 pr-3 py-2.5 rounded-lg
                        bg-white dark:bg-[#212121] 
                        border border-gray-300 dark:border-[#332122]
                        text-gray-900 dark:text-gray-100
                        placeholder-gray-400
                        focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
                        outline-none transition-all sm:text-sm
                    "
                rows="3"
              />
            </div>
          </div>

          {/* TOGGLE DE ESTADO */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#212121] border border-gray-200 dark:border-[#332122]">
            <div className="flex flex-col">
              <span className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Estado</span>
              <span className={`text-sm font-bold uppercase tracking-widest ${form.estado ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {form.estado ? 'Activa' : 'Inactiva'}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleEstado}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${form.estado ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${form.estado ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-[#332122]">
            <button
              type="button"
              onClick={onClose}
              className="
                    flex-1 px-4 py-3 rounded-xl font-semibold
                    border border-gray-300 dark:border-[#332122] text-gray-700 dark:text-gray-300
                    hover:bg-gray-50 dark:hover:bg-[#212121] transition
                "
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="
                    flex-1 px-4 py-3 rounded-xl font-bold text-white
                    bg-linear-to-r from-[#b30c25] to-[#80091b]
                    hover:shadow-lg hover:shadow-red-900/20 active:scale-95
                    transition-all duration-300
                "
            >
              {editingData ? 'Guardar Cambios' : 'Crear Disciplina'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};


TipoDisciplinaModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editingData: PropTypes.shape({
    id: PropTypes.number,
    nombre: PropTypes.string,
    descripcion: PropTypes.string,
    estado: PropTypes.bool
  })
};

export default TipoDisciplinaModal;
