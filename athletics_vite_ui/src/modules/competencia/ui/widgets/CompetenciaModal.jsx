import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Competencia from "../../domain/models/Competencia";
import Swal from "sweetalert2";
import { Edit3, PlusCircle, Trophy, Calendar, MapPin, FileText, X } from "lucide-react";

const InputField = ({ icon: Icon, id, ...props }) => (
  <div className="relative w-full">
    {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />}
    <input
      {...props}
      id={id}
      className={`w-full bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#332122]
    text-gray-900 dark:text-gray-100 rounded-xl py-2.5 ${Icon ? 'pl-10' : 'pl-4'} pr-4
    focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none transition-all placeholder-gray-400`}
    />
  </div>
);

InputField.propTypes = {
  icon: PropTypes.elementType,
  id: PropTypes.string.isRequired
};

const CompetenciaModal = ({ isOpen, onClose, onSubmit, editingCompetencia }) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(new Competencia());

  useEffect(() => {
    if (editingCompetencia) setForm(editingCompetencia);
    else setForm(new Competencia());
  }, [editingCompetencia, isOpen]);

  if (!isOpen) return null;

  // Manejar creación o edición
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const result = await Swal.fire({
      title: editingCompetencia ? '¿Desea actualizar esta competencia?' : '¿Desea crear esta competencia?',
      text: editingCompetencia
        ? 'Se actualizará la competencia seleccionada.'
        : 'Se creará una nueva competencia.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b30c25',
      background: '#1a1a1a',
      color: '#fff',
      customClass: {
        popup: 'dark:bg-[#1a1a1a] dark:text-white dark:border dark:border-[#332122]'
      }
    });

    if (result.isConfirmed) {
      setSubmitting(true);
      try {
        const success = await onSubmit(form);

        if (success) {
          await Swal.fire({
            icon: 'success',
            title: editingCompetencia ? 'Competencia actualizada' : 'Competencia creada',
            text: `La competencia ha sido ${editingCompetencia ? 'actualizada' : 'creada'} correctamente.`,
            confirmButtonColor: '#b30c25',
            background: '#1a1a1a',
            color: '#fff'
          });
          onClose();
        }
      } catch (error) {
        console.error("Error Modal", error);
      } finally {
        setSubmitting(false);
      }
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
      background: '#1a1a1a',
      color: '#fff'
    });

    if (result.isConfirmed) {
      setForm({ ...form, estado: !form.estado });

      Swal.fire({
        icon: 'success',
        title: `Competencia ${form.estado ? 'desactivada' : 'activada'}`,
        text: `La competencia ha sido ${form.estado ? 'desactivada' : 'activada'} correctamente.`,
        confirmButtonColor: "#b30c25",
        background: '#1a1a1a',
        color: '#fff'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div
        className="absolute inset-0 transition-opacity"
        onClick={onClose}
        role="presentation"
      />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#332122] flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-[#332122] flex items-center justify-between rounded-t-2xl bg-gray-50 dark:bg-[#212121]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-[#b30c25] flex items-center justify-center font-black">
              {editingCompetencia ? <Edit3 size={20} /> : <PlusCircle size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {editingCompetencia ? "Editar Competencia" : "Nueva Competencia"}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">

          {/* CAMPO NOMBRE */}
          <div className="space-y-1">
            <label htmlFor="comp-nombre" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Nombre de la Competencia <span className="text-red-500">*</span>
            </label>
            <InputField
              id="comp-nombre"
              icon={Trophy}
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Campeonato Nacional de Atletismo 2024"
              required
            />
          </div>

          {/* CAMPOS FECHA Y LUGAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="comp-fecha" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fecha del Evento <span className="text-red-500">*</span></label>
              <InputField
                id="comp-fecha"
                icon={Calendar}
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="comp-lugar" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Lugar <span className="text-red-500">*</span></label>
              <InputField
                id="comp-lugar"
                icon={MapPin}
                type="text"
                name="lugar"
                value={form.lugar}
                onChange={(e) => setForm({ ...form, lugar: e.target.value })}
                placeholder="Ej: Estadio Olímpico"
                required
              />
            </div>
          </div>

          {/* CAMPO DESCRIPCIÓN */}
          <div className="space-y-1">
            <label htmlFor="comp-descripcion" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Descripción (Opcional)</label>
            <div className="relative w-full">
              <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
              <textarea
                id="comp-descripcion"
                name="descripcion"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Detalles sobre categorías, patrocinadores..."
                rows="4"
                className="w-full bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#332122]
                text-gray-900 dark:text-gray-100 rounded-xl py-2.5 pl-10 pr-4
                focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none transition-all placeholder-gray-400"
              />
            </div>
          </div>

          {/* TOGGLE DE ESTADO */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#212121] border border-gray-200 dark:border-[#332122] transition-colors">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Estado</span>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${form.estado ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {form.estado ? 'Activo / Visible' : 'Inactivo / Oculto'}
              </span>
            </div>

            <button
              id="comp-estado-toggle"
              type="button"
              onClick={toggleEstado}
              aria-pressed={form.estado}
              aria-label={form.estado ? "Desactivar competencia" : "Activar competencia"}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${form.estado ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${form.estado ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-[#332122]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="
                flex-1 px-4 py-3 rounded-xl font-semibold
                border border-gray-300 dark:border-[#332122] text-gray-700 dark:text-gray-300
                hover:bg-gray-50 dark:hover:bg-[#212121] transition
                disabled:opacity-50
              "            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="
                flex-1 px-4 py-3 rounded-xl font-bold text-white
                bg-linear-to-r from-[#b30c25] to-[#80091b]
                hover:shadow-lg hover:shadow-red-900/20 active:scale-95
                disabled:opacity-70 disabled:cursor-not-allowed
                transition-all duration-300
              "
            >
              {submitting ? (editingCompetencia ? 'Guardando...' : 'Creando...') : (editingCompetencia ? 'Guardar Cambios' : 'Crear Competencia')}
            </button>
          </div>
        </form>
      </div >
    </div >
  );
};

CompetenciaModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editingCompetencia: PropTypes.shape({
    id: PropTypes.number,
    nombre: PropTypes.string,
    fecha: PropTypes.string,
    lugar: PropTypes.string,
    descripcion: PropTypes.string,
    estado: PropTypes.bool
  })
};

export default CompetenciaModal;
