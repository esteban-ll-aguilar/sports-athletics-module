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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 font-['Lexend'] text-gray-900 p-4 md:p-10">
            <div className="max-w-7xl mx-auto">
                
                {/* Cabecera y Navegación */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
                    <div className="space-y-4">
                        {/* Breadcrumb Links */}
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <Link 
                                to="baremos" 
                                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-600 hover:border-red-500 hover:text-red-600 transition-all duration-200 hover:shadow-md"
                            >
                                📊 Baremos
                            </Link>
                            <span className="text-gray-300">/</span>
                            <Link 
                                to="disciplinas" 
                                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-600 hover:border-red-500 hover:text-red-600 transition-all duration-200 hover:shadow-md"
                            >
                                🏃 Disciplinas
                            </Link>
                        </div>
                        
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                                Gestión de Pruebas
                            </h1>
                            <p className="text-gray-600 text-lg mt-2">
                                Administra las pruebas deportivas del sistema
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => { setSelectedPrueba(null); setIsModalOpen(true); }}
                        className="group flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-red-200 transition-all hover:shadow-2xl hover:scale-105 active:scale-100 duration-200"
                    >
                        <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300">
                            add
                        </span>
                        Nueva Prueba
                    </button>
                </div>

                {/* Tabla de Resultados */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600 tracking-wider">
                                        Siglas / Nombre
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600">
                                        Disciplina / Baremo
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600 text-center">
                                        Estado
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600 text-right">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                                                <span className="text-gray-500 font-semibold">Sincronizando datos...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : pruebas.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <span className="material-symbols-outlined text-6xl text-gray-300">
                                                    sports_score
                                                </span>
                                                <span className="text-gray-400 font-semibold">No hay pruebas registradas</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    pruebas.map((p) => {
                                        const disc = disciplinas.find(d => d.id === p.tipo_disciplina_id);
                                        const bar = baremos.find(b => b.id === p.baremo_id);
                                        return (
                                            <tr 
                                                key={p.external_id} 
                                                className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent transition-all duration-200"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl font-bold shadow-lg">
                                                            {p.siglas?.substring(0, 2)}
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-red-600 uppercase tracking-wide">
                                                                {p.siglas}
                                                            </div>
                                                            <div className="font-bold text-gray-900">
                                                                {p.tipo_prueba}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold uppercase ${
                                                        p.tipo_prueba === 'COMPETENCIA' 
                                                            ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-200' 
                                                            : 'bg-blue-100 text-blue-700 ring-2 ring-blue-200'
                                                    }`}>
                                                        {p.tipo_prueba}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-bold text-gray-900">
                                                            {disc?.nombre || 'Sin Disciplina'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-medium">
                                                            {bar ? `Clase ${bar.clasificacion} • ${bar.valor_baremo} pts` : 'Sin Baremo'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase ${
                                                        p.estado 
                                                            ? 'bg-green-100 text-green-700 ring-2 ring-green-200' 
                                                            : 'bg-red-100 text-red-700 ring-2 ring-red-200'
                                                    }`}>
                                                        {p.estado ? "Activo" : "Inactivo"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => { setSelectedPrueba(p); setIsModalOpen(true); }} 
                                                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                                                        >
                                                            <span className="material-symbols-outlined">edit</span>
                                                        </button>
                                                        {p.estado && (
                                                            <button 
                                                                onClick={() => handleDesactivar(p)} 
                                                                className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                                                            >
                                                                <span className="material-symbols-outlined">block</span>
                                                            </button>
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
