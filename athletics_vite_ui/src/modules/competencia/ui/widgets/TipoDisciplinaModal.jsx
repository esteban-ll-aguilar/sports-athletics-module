import { useEffect, useState } from "react";
import TipoDisciplina from "../../domain/models/TipoDisciplina";
import Swal from "sweetalert2";

const TipoDisciplinaModal = ({ isOpen, onClose, onSubmit, editingData }) => {
  const [form, setForm] = useState(new TipoDisciplina());

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
      background: '#212121',
      color: '#fff'
    });

    if (result.isConfirmed) {
      onSubmit(form);

      await Swal.fire({
        icon: 'success',
        title: editingData ? 'Disciplina actualizada' : 'Disciplina creada',
        text: `La disciplina ha sido ${editingData ? 'actualizada' : 'creada'} correctamente.`,
        confirmButtonColor: '#b30c25',
        background: '#212121',
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
      background: '#212121',
      color: '#fff'
    });

    if (result.isConfirmed) {
      setForm({ ...form, estado: !form.estado });

      Swal.fire({
        icon: 'success',
        title: `Disciplina ${form.estado ? 'desactivada' : 'activada'}`,
        text: `La disciplina ha sido ${form.estado ? 'desactivada' : 'activada'} correctamente.`,
        confirmButtonColor: '#b30c25',
        background: '#212121',
        color: '#fff'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="
      w-full max-w-xl
      bg-gradient-to-br from-[#1f1c1d] to-[#242223]
      rounded-3xl
      border border-[#332122]
      shadow-2xl shadow-black/60
      overflow-hidden
      animate-in fade-in zoom-in duration-200
    ">              <div className="px-6 py-5 flex justify-between items-center bg-[#181111] border-b border-[#332122]">
          <h2 className="text-xl font-black text-gray-100 tracking-wide">
            {editingData ? 'Editar Tipo de Disciplina' : 'Nuevo Tipo de Disciplina'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* CAMPO NOMBRE */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Atletismo"
              className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "           required
            />
          </div>

          {/* CAMPO DESCRIPCIÓN */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Breve descripción de la disciplina..."
              className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "              rows="3"
            />
          </div>

          {/* TOGGLE DE ESTADO */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#181111] border border-[#332122]">
            <div className="flex flex-col">
              <span className="block text-xs font-black uppercase tracking-widest text-gray-400">Estado de Disciplina</span>
              <span className={`text-sm font-bold font-black uppercase tracking-widest ${form.estado ? 'text-green-400' : 'text-red-400'}`}>
                {form.estado ? 'Activa / Visible' : 'Inactiva / Oculta'}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleEstado}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${form.estado ? 'bg-green-500' : 'bg-gray-600'
                }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${form.estado ? 'translate-x-6' : 'translate-x-1'
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
              flex-1 py-3 rounded-xl
              border border-[#332122]
              text-gray-400 font-bold
              hover:bg-[#181111]
              transition-colors
            "
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="
              flex-1 py-3 rounded-xl font-bold text-white
              bg-gradient-to-r from-[#b30c25] via-[#362022] to-[#332122]
              hover:brightness-110
              transition-all duration-300
              shadow-lg shadow-black/40
              active:scale-95
            "
            >
              {editingData ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TipoDisciplinaModal;
