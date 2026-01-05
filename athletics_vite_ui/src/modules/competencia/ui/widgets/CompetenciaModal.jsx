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
      confirmButtonColor: '#ec1313'
    });

    if (result.isConfirmed) {
      setForm({...form, estado: !form.estado});

      Swal.fire({
        icon: 'success',
        title: `Competencia ${form.estado ? 'desactivada' : 'activada'}`,
        text: `La competencia ha sido ${form.estado ? 'desactivada' : 'activada'} correctamente.`,
        confirmButtonColor: '#ec1313'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-black">
            {editingCompetencia ? 'Editar Competencia' : 'Nueva Competencia'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* CAMPO NOMBRE */}
          <div>
            <label className="block text-sm font-bold mb-2 text-[#181111]">
              Nombre de la Competencia *
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={(e) => setForm({...form, nombre: e.target.value})}
              placeholder="Ej: Campeonato Nacional de Atletismo 2024"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#ec1313] outline-none transition-all"
              required
            />
          </div>

          {/* CAMPOS FECHA Y LUGAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-[#181111]">Fecha del Evento *</label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={(e) => setForm({...form, fecha: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#ec1313] outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-[#181111]">Lugar *</label>
              <input
                type="text"
                name="lugar"
                value={form.lugar}
                onChange={(e) => setForm({...form, lugar: e.target.value})}
                placeholder="Ej: Estadio Olímpico"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#ec1313] outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* CAMPO DESCRIPCIÓN */}
          <div>
            <label className="block text-sm font-bold mb-2 text-[#181111]">Descripción (Opcional)</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={(e) => setForm({...form, descripcion: e.target.value})}
              placeholder="Detalles sobre categorías, patrocinadores o requisitos especiales..."
              rows="4"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#ec1313] outline-none transition-all resize-none"
            />
          </div>

          {/* TOGGLE DE ESTADO */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#181111]">Estado</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${form.estado ? 'text-green-600' : 'text-red-500'}`}>
                {form.estado ? 'Activo / Visible' : 'Inactivo / Oculto'}
              </span>
            </div>
            
            <button
              type="button"
              onClick={toggleEstado}
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
              {editingCompetencia ? 'Guardar Cambios' : 'Crear Competencia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompetenciaModal;
