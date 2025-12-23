import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import pruebaService from "../../services/prueba_service";
import tipoDisciplinaService from "../../services/tipo_disciplina_service";
import baremoService from "../../services/baremo_service";
import PruebaModal from "../widgets/PruebaModal.jsx";

const PruebasPage = () => {
    const [pruebas, setPruebas] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [baremos, setBaremos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPrueba, setSelectedPrueba] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resPruebas, resDisc, resBar] = await Promise.all([
                pruebaService.getAll(),
                tipoDisciplinaService.getAll(),
                baremoService.getAll()
            ]);
            setPruebas(Array.isArray(resPruebas) ? resPruebas : []);
            setDisciplinas(Array.isArray(resDisc) ? resDisc : []);
            setBaremos(Array.isArray(resBar) ? resBar : []);
        } catch (err) { 
            console.error("Error al sincronizar datos:", err); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (formData) => {
        console.log("1. Datos recibidos del Modal:", formData);
        try {
            const fechaHoy = new Date().toISOString().split('T')[0];

            // PAYLOAD CORREGIDO PARA EVITAR 422
            const payload = {
                siglas: String(formData.siglas || "").trim(),
                fecha_registro: formData.fecha_registro || fechaHoy,
                // Validación estricta del Enum PruebaType
                tipo_prueba: formData.tipo_prueba === "NORMAL" ? "NORMAL" : "COMPETENCIA",
                unidad_medida: String(formData.unidad_medida || "").trim(),
                estado: formData.estado === "false" || formData.estado === false ? false : true,
                // Conversión forzada a Entero
                tipo_disciplina_id: formData.tipo_disciplina_id ? parseInt(formData.tipo_disciplina_id, 10) : null,
                baremo_id: formData.baremo_id ? parseInt(formData.baremo_id, 10) : null,
            };

            console.log("2. Enviando Payload Final:", payload);

            if (selectedPrueba) {
                payload.external_id = selectedPrueba.external_id;
                await pruebaService.update(selectedPrueba.external_id, payload);
            } else {
                await pruebaService.create(payload);
            }
            
            setIsModalOpen(false);
            fetchData();
            alert("¡Registro guardado con éxito!");

        } catch (err) {
            console.error("3. Error del Servidor (422 Detail):", err.response?.data);
            const detail = err.response?.data?.detail;
            alert("Error: " + (detail ? JSON.stringify(detail) : "Error de validación"));
        }
    };

    const handleDesactivar = async (prueba) => {
        if (!confirm(`¿Desea desactivar la prueba ${prueba.tipo_prueba}?`)) return;
        try {
            const payload = { ...prueba, estado: false };
            await pruebaService.update(prueba.external_id, payload);
            fetchData();
        } catch (err) {
            alert("Error al desactivar el registro");
        }
    };

    return (
        <div className="min-h-screen bg-white font-['Lexend'] text-[#181111] p-4 md:p-10">
            <div className="max-w-[1200px] mx-auto">
                
                {/* Cabecera y Navegación */}
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <div className="flex gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <Link to="baremos" className="hover:text-[#ec1313]">Baremos</Link>
                            <span>/</span>
                            <Link to="disciplinas" className="hover:text-[#ec1313]">Disciplinas</Link>
                        </div>
                        <h1 className="text-4xl font-black">Gestión de Pruebas</h1>
                    </div>
                    <button 
                        onClick={() => { setSelectedPrueba(null); setIsModalOpen(true); }}
                        className="bg-[#ec1313] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-red-100 transition-all hover:bg-red-700 active:scale-95"
                    >
                        Nueva Prueba
                    </button>
                </div>

                {/* Tabla de Resultados */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-tighter">Siglas / Nombre</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Tipo</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Disciplina / Baremo</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-center">Estado</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="py-20 text-center text-gray-400 font-bold animate-pulse">Sincronizando...</td></tr>
                            ) : (
                                pruebas.map((p) => {
                                    const disc = disciplinas.find(d => d.id === p.tipo_disciplina_id);
                                    const bar = baremos.find(b => b.id === p.baremo_id);
                                    return (
                                        <tr key={p.external_id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-[#ec1313] font-black text-[10px]">{p.siglas}</div>
                                                <div className="font-bold">{p.tipo_prueba}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-black px-2 py-1 rounded-md ${p.tipo_prueba === 'COMPETENCIA' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                                    {p.tipo_prueba}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-700">{disc?.nombre || 'S/D'}</div>
                                                <div className="text-[10px] text-gray-400 font-bold italic">
                                                    {bar ? `Clase ${bar.clasificacion} (${bar.valor_baremo} pts)` : 'Sin Baremo'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${p.estado ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                    {p.estado ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => { setSelectedPrueba(p); setIsModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><span className="material-symbols-outlined">edit</span></button>
                                                    {p.estado && (
                                                        <button onClick={() => handleDesactivar(p)} className="p-2 text-[#ec1313] hover:bg-red-50 rounded-lg"><span className="material-symbols-outlined">block</span></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <PruebaModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleSubmit}
                editingData={selectedPrueba}
            />
        </div>
    );
};

export default PruebasPage;