import { useEffect, useState } from "react";
import TipoDisciplina from "../../domain/models/TipoDisciplina";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-black text-[#181111]">
            {editingData ? 'Editar Tipo de Disciplina' : 'Nuevo Tipo de Disciplina'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="p-6 space-y-5">
          {/* CAMPO NOMBRE */}
          <div>
            <label className="block text-sm font-bold mb-2 text-[#181111]">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={(e) => setForm({...form, nombre: e.target.value})}
              placeholder="Ej: Atletismo"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#ec1313] focus:ring-1 focus:ring-[#ec1313] outline-none transition-all"
              required
            />
          </div>

          {/* CAMPO DESCRIPCIÓN */}
          <div>
            <label className="block text-sm font-bold mb-2 text-[#181111]">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={(e) => setForm({...form, descripcion: e.target.value})}
              placeholder="Breve descripción de la disciplina..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#ec1313] focus:ring-1 focus:ring-[#ec1313] outline-none transition-all resize-none"
              rows="3"
            />
          </div>

          {/* CONTROL DE ESTADO TIPO TOGGLE (TOUCH FRIENDLY) */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#181111]">Estado de Disciplina</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${form.estado ? 'text-green-600' : 'text-red-500'}`}>
                {form.estado ? 'Activa / Visible' : 'Inactiva / Oculta'}
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
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
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
              {editingData ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TipoDisciplinaModal;