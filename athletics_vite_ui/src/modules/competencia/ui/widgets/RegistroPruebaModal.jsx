import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const RegistroPruebaModal = ({ isOpen, onClose, onSubmit, editingItem, competencias = [], atletas = [], pruebas = [] }) => {
    const [form, setForm] = useState({
        atleta_id: "",
        prueba_id: "",
        marca_obtenida: "",
        unidad_medida: "METROS",
        estado: true,
        fecha: new Date().toISOString().substring(0, 16)
    });

    // Auto-fill unit based on selected test
    useEffect(() => {
        if (form.prueba_id) {
            const p = pruebas.find(x => x.external_id === form.prueba_id || x.id === form.prueba_id);
            if (p) {
                setForm(prev => ({
                    ...prev,
                    unidad_medida: p.tipo_medicion === "TIEMPO" ? "s" : "m"
                }));
            }
        }
    }, [form.prueba_id, pruebas]);

    useEffect(() => {
        if (editingItem) {
            console.log("EditingItem recibido:", editingItem);

            const atletaId = editingItem.atleta_external_id || editingItem.atleta_id || "";
            const pruebaId = editingItem.prueba_external_id || editingItem.prueba_id || "";

            console.log("🔍 Atleta ID para select:", atletaId);
            console.log("🔍 Prueba ID para select:", pruebaId);
            console.log("🔍 Atletas disponibles:", atletas.map(a => ({ id: a.id, external_id: a.external_id, name: `${a.first_name} ${a.last_name}` })));

            setForm({
                atleta_id: atletaId,
                prueba_id: pruebaId,
                marca_obtenida: editingItem.marca_obtenida || "",
                unidad_medida: editingItem.unidad_medida || "m",
                estado: editingItem.estado,
                fecha: editingItem.fecha ? new Date(editingItem.fecha).toISOString().substring(0, 16) : new Date().toISOString().substring(0, 16)
            });
        } else {
            setForm({
                atleta_id: "",
                prueba_id: "",
                marca_obtenida: "",
                unidad_medida: "m",
                estado: true,
                fecha: new Date().toISOString().substring(0, 16)
            });
        }
    }, [editingItem, atletas, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            atleta_id: form.atleta_id,
            prueba_id: form.prueba_id,
            marca_obtenida: Number(form.marca_obtenida),
            fecha: new Date(form.fecha).toISOString(),
            estado: form.estado
        };

        const result = await Swal.fire({
            title: editingItem ? '¿Actualizar Resultado?' : '¿Registrar Resultado?',
            text: "Verifique que los datos sean correctos.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#b30c25',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar',
            background: '#212121',
            color: '#fff'
        });

        if (result.isConfirmed) {
            onSubmit(payload);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-left font-['Lexend']">
            <div className="bg-[#1e1e1e] w-full max-w-lg rounded-2xl border border-[#333] shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-[#333] flex justify-between items-center bg-[#252525]">
                    <h2 className="text-xl font-black text-white">{editingItem ? 'Editar Resultado' : 'Registrar Resultado'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* ATLETA */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Atleta</label>
                        <select
                            name="atleta_id"
                            value={form.atleta_id}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#b30c25] focus:ring-1 focus:ring-[#b30c25] outline-none transition-all"
                        >
                            <option value="">Seleccione Atleta</option>
                            {atletas.map(a => (
                                <option key={a.id} value={a.external_id}>{a.first_name} {a.last_name}</option>
                            ))}
                        </select>
                    </div>

                    {/* PRUEBA */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prueba</label>
                        <select
                            name="prueba_id"
                            value={form.prueba_id}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#b30c25] focus:ring-1 focus:ring-[#b30c25] outline-none transition-all"
                        >
                            <option value="">Seleccione Prueba</option>
                            {pruebas.map(p => (
                                <option key={p.id} value={p.external_id}>{p.nombre} ({p.tipo_medicion})</option>
                            ))}
                        </select>
                    </div>

                    {/* MARCA & UNIDAD */}
                    <div className="grid grid-cols-2 gap-4">
                        {form.unidad_medida === "s" ? (
                            // For TIME: Show Minutes and Seconds
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Minutos</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        name="minutos"
                                        value={Math.floor(form.marca_obtenida / 60) || 0}
                                        onChange={(e) => {
                                            const mins = parseInt(e.target.value) || 0;
                                            const secs = form.marca_obtenida % 60;
                                            setForm(prev => ({ ...prev, marca_obtenida: mins * 60 + secs }));
                                        }}
                                        placeholder="0"
                                        className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#b30c25] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Segundos</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="59.99"
                                        step="0.01"
                                        name="segundos"
                                        value={(form.marca_obtenida % 60).toFixed(2)}
                                        onChange={(e) => {
                                            const mins = Math.floor(form.marca_obtenida / 60);
                                            const secs = parseFloat(e.target.value) || 0;
                                            setForm(prev => ({ ...prev, marca_obtenida: mins * 60 + secs }));
                                        }}
                                        required
                                        placeholder="0.00"
                                        className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#b30c25] outline-none"
                                    />
                                </div>
                            </>
                        ) : (
                            // For DISTANCE: Show single input
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Marca ({form.unidad_medida})</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="marca_obtenida"
                                        value={form.marca_obtenida}
                                        onChange={handleChange}
                                        required
                                        placeholder="0.00"
                                        className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#b30c25] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unidad</label>
                                    <input
                                        type="text"
                                        value={form.unidad_medida}
                                        disabled
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* FECHA */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha y Hora</label>
                        <input
                            type="datetime-local"
                            name="fecha"
                            value={form.fecha}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#b30c25] outline-none"
                            style={{ colorScheme: "dark" }}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-gray-400 font-bold hover:bg-[#333] transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#b30c25] hover:bg-[#8a0a1d] text-white font-bold transition-colors shadow-lg shadow-red-900/20">
                            {editingItem ? 'Actualizar' : 'Guardar Resultado'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistroPruebaModal;



