import { useEffect, useState } from "react";
import tipoDisciplinaService from "../../services/tipo_disciplina_service";
import baremoService from "../../services/baremo_service";

const PruebaModal = ({ isOpen, onClose, onSubmit, editingData }) => {
    const [form, setForm] = useState({
        siglas: "",
        tipo_prueba: "COMPETENCIA",
        unidad_medida: "",
        estado: true,
        tipo_disciplina_id: "",
        baremo_id: ""
    });

    const [disciplinas, setDisciplinas] = useState([]);
    const [baremos, setBaremos] = useState([]);

    useEffect(() => {
        if (isOpen) {
            cargarCatalogos();
            if (editingData) {
                setForm({
                    ...editingData,
                    tipo_disciplina_id: editingData.tipo_disciplina_id?.toString() || "",
                    baremo_id: editingData.baremo_id?.toString() || ""
                });
            } else {
                setForm({
                    siglas: "",
                    tipo_prueba: "COMPETENCIA",
                    unidad_medida: "",
                    estado: true,
                    tipo_disciplina_id: "",
                    baremo_id: ""
                });
            }
        }
    }, [editingData, isOpen]);

    const cargarCatalogos = async () => {
        try {
            const [resD, resB] = await Promise.all([
                tipoDisciplinaService.getAll(),
                baremoService.getAll()
            ]);
            setDisciplinas(Array.isArray(resD) ? resD : []);
            setBaremos(Array.isArray(resB) ? resB : []);
        } catch (err) { console.error(err); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h2 className="text-xl font-black">{editingData ? 'Editar Prueba' : 'Nueva Prueba'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-black">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="p-6 space-y-4">
                    {/* Switch de Estado (Activar/Desactivar) */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <span className="block text-xs font-black uppercase text-gray-400">Estado del Registro</span>
                            <span className={`text-sm font-bold ${form.estado ? 'text-green-600' : 'text-red-600'}`}>
                                {form.estado ? 'PRUEBA ACTIVA' : 'PRUEBA DESACTIVADA'}
                            </span>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setForm({...form, estado: !form.estado})}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.estado ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.estado ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Siglas</label>
                            <input 
                                type="text" 
                                value={form.siglas} 
                                onChange={(e) => setForm({...form, siglas: e.target.value.toUpperCase()})} 
                                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-[#ec1313] font-bold" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Unidad Medida</label>
                            <input 
                                type="text" 
                                value={form.unidad_medida} 
                                onChange={(e) => setForm({...form, unidad_medida: e.target.value})} 
                                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-[#ec1313]" 
                                required 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Tipo de Prueba</label>
                        <select 
                            value={form.tipo_prueba} 
                            onChange={(e) => setForm({...form, tipo_prueba: e.target.value})} 
                            className="w-full border border-gray-200 rounded-xl p-3 outline-none bg-white font-semibold"
                            required
                        >
                            <option value="COMPETENCIA">COMPETENCIA</option>
                            <option value="NORMAL">NORMAL</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Disciplina</label>
                            <select 
                                value={form.tipo_disciplina_id} 
                                onChange={(e) => setForm({...form, tipo_disciplina_id: e.target.value})} 
                                className="w-full border border-gray-200 rounded-xl p-3 outline-none bg-white" required
                            >
                                <option value="">Seleccione...</option>
                                {disciplinas.map(d => (<option key={d.id} value={d.id}>{d.nombre}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Baremo</label>
                            <select 
                                value={form.baremo_id} 
                                onChange={(e) => setForm({...form, baremo_id: e.target.value})} 
                                className="w-full border border-gray-200 rounded-xl p-3 outline-none bg-white" required
                            >
                                <option value="">Seleccione...</option>
                                {baremos.map(b => (<option key={b.id} value={b.id}>Clase {b.clasificacion} ({b.valor_baremo} pts)</option>))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6">
                        <button type="button" onClick={onClose} className="flex-1 p-4 border border-gray-100 rounded-xl font-bold text-gray-400 text-xs uppercase">Cancelar</button>
                        <button type="submit" className="flex-1 p-4 bg-[#ec1313] text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-50 text-xs uppercase">
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PruebaModal;