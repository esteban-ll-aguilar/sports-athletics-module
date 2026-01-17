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
        <div className="min-h-screen bg-[#121212] font-['Lexend'] text-gray-200 px-6 py-8">
            <div className="max-w-7xl mx-auto">

                {/* Cabecera y Navegación */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
                    <div className="space-y-4">
                        {/* Breadcrumb Links */}
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <Link
                                to="baremos"
                                className="
  px-4 py-2 rounded-xl text-sm font-semibold
  bg-[#1a1a1a] border border-[#332122] text-gray-300
  hover:text-[#b30c25] hover:border-[#b30c25]
  transition
"
                            >
                                📊 Baremos
                            </Link>
                            <span className="text-gray-300">/</span>
                            <Link
                                to="disciplinas"
                                className="
  px-4 py-2 rounded-xl text-sm font-semibold
  bg-[#1a1a1a] border border-[#332122] text-gray-300
  hover:text-[#b30c25] hover:border-[#b30c25]
  transition
"
                            >
                                🏃 Disciplinas
                            </Link>
                        </div>

                        <div>
                            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
                                Gestión de Pruebas
                            </h1>
                            <p className="text-gray-400 text-lg mt-2">
                                Administra las pruebas deportivas del sistema
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => { setSelectedPrueba(null); setIsModalOpen(true); }}
                        className="
        group flex items-center gap-3
        px-8 py-4 rounded-2xl
        text-sm font-semibold text-white
        bg-gradient-to-r from-[#b30c25] via-[#362022] to-[#332122]
        hover:brightness-110
        focus:outline-none focus:ring-2 focus:ring-[#b30c25]
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-300
        shadow-lg shadow-[#b30c25]/40
        active:scale-95
    "                       >
                        <span className="material-symbols-outlined transition-transform duration-300 group-hover:rotate-90">
                            add
                        </span>
                        Nueva Prueba
                    </button>
                </div>

                {/* Tabla de Resultados */}
                <div className="bg-[#212121] rounded-2xl border border-[#332122] shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#1a1a1a] border-b border-[#332122]">
                                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-gray-400">
                                        Siglas / Nombre
                                    </th>
                                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-gray-400">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-gray-400">
                                        Disciplina / Baremo
                                    </th>
                                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-gray-400">
                                        Estado
                                    </th>
                                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-gray-400">
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
                                                className="
  transition-colors
  hover:bg-[#242223]
"
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
                                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold uppercase ${p.tipo_prueba === 'COMPETENCIA'
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
                                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase ${p.estado
                                                        ? 'bg-green-900/20 text-green-400 border border-green-800'
                                                        : 'bg-red-900/20 text-red-400 border border-red-800'
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
