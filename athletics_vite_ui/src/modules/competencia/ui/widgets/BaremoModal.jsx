import { useEffect, useState } from "react";
import Baremo from "../../domain/models/Baremo";
import Swal from "sweetalert2";

const BaremoModal = ({ isOpen, onClose, onSubmit, editingBaremo }) => {
  const [form, setForm] = useState(new Baremo());

  useEffect(() => {
    if (editingBaremo) setForm(editingBaremo);
    else setForm(new Baremo());
  }, [editingBaremo, isOpen]);

  if (!isOpen) return null;

  // Manejar creación o edición
  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: editingBaremo ? '¿Desea actualizar este Baremo?' : '¿Desea crear este Baremo?',
      text: editingBaremo
        ? 'Se actualizará el Baremo seleccionado.'
        : 'Se creará un nuevo Baremo.',
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
        title: editingBaremo ? 'Baremo actualizado' : 'Baremo creado',
        text: `El Baremo ha sido ${editingBaremo ? 'actualizado' : 'creado'} correctamente.`,
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
      title: `¿Desea ${action} este Baremo?`,
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
        title: `Baremo ${form.estado ? 'desactivado' : 'activado'}`,
        text: `El Baremo ha sido ${form.estado ? 'desactivado' : 'activado'} correctamente.`,
        confirmButtonColor: '#b30c25',
        background: '#212121',
        color: '#fff'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-[#212121] rounded-2xl shadow-2xl border border-[#332122]">

        {/* HEADER */}
        <div className="px-6 py-5 border-b border-[#332122] flex items-center justify-between bg-[#1a1a1a] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(179,12,37,0.15)] text-[#b30c25] flex items-center justify-center font-black">
              {editingBaremo ? '✎' : 'B'}
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-100">
                {editingBaremo ? 'Editar Baremo' : 'Nuevo Baremo'}
              </h2>
              <p className="text-xs text-gray-400">
                Gestión de puntuaciones
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-6">
          {/* CAMPO VALOR PUNTOS */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Valor (Puntos)</label>
            <input
              type="number"
              name="valor_baremo"
              value={form.valor_baremo}
              onChange={(e) => setForm({ ...form, valor_baremo: e.target.value })}
              placeholder="Ej: 100"
              className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "             required
            />
          </div>

          {/* CAMPO CLASIFICACIÓN (SELECT) */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Clasificación</label>
            <select
              name="clasificacion"
              value={form.clasificacion}
              onChange={(e) => setForm({ ...form, clasificacion: e.target.value })}
              className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "              required
            >
              <option value="" disabled>Seleccione una Categoria</option>
              <option value="A">Clasificación A</option>
              <option value="B">Clasificación B</option>
              <option value="C">Clasificación C</option>
            </select>
          </div>

          {/* TOGGLE DE ESTADO */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#1c1c1c] border border-[#332122]">

            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-200">Estado</span>
              <span className={`text-[11px] font-bold uppercase tracking-wider  ${form.estado ? 'text-green-400' : 'text-red-400'}`}>
                {form.estado ? 'Activo / Visible' : 'Inactivo / Oculto'}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleEstado}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${form.estado ? 'bg-green-500' : 'bg-gray-300'
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
              bg-gradient-to-r from-[#b30c25] to-[#5a0f1d]
              hover:brightness-110 transition active:scale-95
            "            >
              {editingBaremo ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BaremoModal;
