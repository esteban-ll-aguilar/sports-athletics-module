import { useEffect, useState } from "react";
import Baremo from "../../domain/models/Baremo";

const BaremoModal = ({ isOpen, onClose, onSubmit, editingBaremo }) => {
  const [form, setForm] = useState(new Baremo());

  useEffect(() => {
    if (editingBaremo) setForm(editingBaremo);
    else setForm(new Baremo());
  }, [editingBaremo, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-black">{editingBaremo ? 'Editar Baremo' : 'Nuevo Baremo'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="p-6 space-y-5">
          {/* CAMPO VALOR PUNTOS */}
          <div>
            <label className="block text-sm font-bold mb-2 text-[#181111]">Valor (Puntos)</label>
            <input
              type="number"
              name="valor_baremo"
              value={form.valor_baremo}
              onChange={(e) => setForm({...form, valor_baremo: e.target.value})}
              placeholder="Ej: 100"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#ec1313] outline-none transition-all"
              required
            />
          </div>

          {/* CAMPO CLASIFICACIÓN (SELECT) */}
          <div>
            <label className="block text-sm font-bold mb-2 text-[#181111]">Clasificación</label>
            <select
              name="clasificacion"
              value={form.clasificacion}
              onChange={(e) => setForm({...form, clasificacion: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#ec1313] outline-none bg-white appearance-none cursor-pointer"
              required
            >
              <option value="" disabled>Seleccione una Categoria</option>
              <option value="A">Clasificación A</option>
              <option value="B">Clasificación B</option>
              <option value="C">Clasificación C</option>
            </select>
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
              onClick={() => setForm({...form, estado: !form.estado})}
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
              {editingBaremo ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BaremoModal;