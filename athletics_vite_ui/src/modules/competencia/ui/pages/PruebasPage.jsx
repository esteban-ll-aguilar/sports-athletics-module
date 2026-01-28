import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import pruebaService from "../../services/prueba_service";
import tipoDisciplinaService from "../../services/tipo_disciplina_service";
import baremoService from "../../services/baremo_service";
import PruebaModal from "../widgets/PruebaModal.jsx";
import Swal from "sweetalert2";
import { Search, Plus, Filter, Trophy, Activity, Calendar, Target, Edit2, Power, CheckCircle, AlertCircle } from 'lucide-react';

const PruebasPage = () => {
    const [pruebas, setPruebas] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [baremos, setBaremos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPrueba, setSelectedPrueba] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

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
            console.error("Error fetching Pruebas:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (formData) => {
        try {
            const fechaHoy = new Date().toISOString().split('T')[0];

            const payload = {
                nombre: String(formData.nombre || "").trim(),
                siglas: String(formData.siglas || "").trim(),
                fecha_registro: formData.fecha_registro || fechaHoy,
                fecha_prueba: formData.fecha_prueba || null,
                tipo_prueba: formData.tipo_prueba === "NORMAL" ? "NORMAL" : "COMPETENCIA",
                tipo_medicion: formData.tipo_medicion || "TIEMPO",
                unidad_medida: String(formData.unidad_medida || "").trim(),
                estado: formData.estado === "false" || formData.estado === false ? false : true,
                tipo_disciplina_id: formData.tipo_disciplina_id ? parseInt(formData.tipo_disciplina_id, 10) : null,
            };

            if (selectedPrueba) {
                payload.external_id = selectedPrueba.external_id;
                await pruebaService.update(selectedPrueba.external_id, payload);
            } else {
                await pruebaService.create(payload);
            }

            fetchData();
            return true;

        } catch (err) {
            console.error("Error del Servidor:", err.response?.data);
            const detail = err.response?.data?.detail;
            Swal.fire({
                title: 'Error',
                text: detail ? JSON.stringify(detail) : "Error de validación",
                icon: 'error',
                confirmButtonColor: '#b30c25',
                background: '#1a1a1a',
                color: '#fff'
            });
            return false;
        }
    };

    const toggleStatus = async (prueba) => {
        const nuevoEstado = !prueba.estado;

        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: nuevoEstado
                ? `¿Desea activar la prueba ${prueba.siglas}?`
                : `¿Desea desactivar la prueba ${prueba.siglas}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#b30c25',
            cancelButtonColor: '#6b7280',
            confirmButtonText: nuevoEstado ? 'Sí, activar' : 'Sí, desactivar',
            cancelButtonText: 'Cancelar',
            background: '#1a1a1a',
            color: '#fff'
        });

        if (!result.isConfirmed) return;

        try {
            await pruebaService.update(prueba.external_id, {
                ...prueba,
                estado: nuevoEstado
            });

            setPruebas(prev =>
                prev.map(p =>
                    p.external_id === prueba.external_id
                        ? { ...p, estado: nuevoEstado }
                        : p
                )
            );

            Swal.fire({
                title: '¡Éxito!',
                text: nuevoEstado ? 'Prueba activada exitosamente' : 'Prueba desactivada exitosamente',
                icon: 'success',
                confirmButtonColor: '#b30c25',
                background: '#1a1a1a',
                color: '#fff'
            });

            fetchData();
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: 'Error al cambiar el estado de la prueba',
                icon: 'error',
                confirmButtonColor: '#b30c25',
                background: '#1a1a1a',
                color: '#fff'
            });
        }
    };

    const filteredPruebas = pruebas.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.siglas.toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] font-['Lexend'] transition-colors duration-300">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* Cabecera y Navegación */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
                    <div className="space-y-1">
                        <Link
                            to="/dashboard/competencias"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 font-semibold text-sm mb-2 transition-all duration-200 group"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform duration-200">
                                ← Volver
                            </span>
                        </Link>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                                Gestión de Pruebas
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-lg mt-1">
                                Administra las pruebas deportivas del sistema.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <button
                            onClick={() => { setSelectedPrueba(null); setIsModalOpen(true); }}
                            className="
                                group flex items-center justify-center gap-2
                                px-6 py-3 rounded-xl
                                text-sm font-bold text-white
                                bg-linear-to-r from-[#b30c25] to-[#80091b]
                                hover:brightness-110
                                shadow-lg shadow-red-900/20 active:scale-95
                                transition-all duration-300
                            "
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            Nueva Prueba
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o siglas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="
                                w-full pl-12 pr-4 py-3 rounded-xl 
                                bg-white dark:bg-[#212121]
                                border border-gray-200 dark:border-[#332122]
                                text-gray-900 dark:text-gray-100
                                placeholder-gray-400 dark:placeholder-gray-500
                                focus:border-[#b30c25] focus:ring-1 focus:ring-[#b30c25]/30
                                outline-none transition-all shadow-sm
                            "
                        />
                    </div>
                </div>

                {/* Tabla de Resultados */}
                <div className="bg-white dark:bg-[#212121] rounded-2xl border border-gray-200 dark:border-[#332122] shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#332122]">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Siglas / Nombre
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Disciplina / Baremo
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Estado
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-[#332122]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-4 border-[#b30c25] border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-gray-500 dark:text-gray-400 font-medium">Cargando pruebas...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredPruebas.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Trophy size={48} className="text-gray-300 dark:text-gray-600" />
                                                <span className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron pruebas.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPruebas.map((p) => {
                                        const disc = disciplinas.find(d => d.id === p.tipo_disciplina_id);
                                        const bar = baremos.find(b => b.id === p.baremo_id);
                                        return (
                                            <tr
                                                key={p.external_id}
                                                className={`transition-colors duration-200 ${!p.estado
                                                    ? 'bg-gray-50/50 dark:bg-[#1a1a1a]/50 opacity-60'
                                                    : 'hover:bg-gray-50 dark:hover:bg-[#2a2829]'
                                                    }`}                     >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-10 h-10 bg-linear-to-br from-red-500 to-red-600 text-white rounded-xl font-bold shadow-sm">
                                                            {p.siglas?.substring(0, 2)}
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-[#b30c25] uppercase tracking-wide">
                                                                {p.siglas}
                                                            </div>
                                                            <div className="font-bold text-gray-900 dark:text-gray-100">
                                                                {p.nombre}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {p.tipo_prueba}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${p.tipo_prueba === 'COMPETENCIA'
                                                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/30'
                                                        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/30'
                                                        }`}>
                                                        {p.tipo_prueba}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-bold text-gray-900 dark:text-gray-200">
                                                            {disc?.nombre || 'Sin Disciplina'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                            {bar ? `Clase ${bar.clasificacion} • ${bar.valor_baremo} pts` : 'Sin Baremo'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${p.estado
                                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30'
                                                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30'
                                                        }`}>
                                                        {p.estado ? "Activo" : "Inactivo"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => { setSelectedPrueba(p); setIsModalOpen(true); }}
                                                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleStatus(p)}
                                                            className={`p-2 rounded-lg transition-colors ${p.estado
                                                                ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                                : 'text-green-500 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                                }`}
                                                            title={p.estado ? 'Desactivar' : 'Activar'}
                                                        >
                                                            {p.estado ? <Power size={18} /> : <CheckCircle size={18} />}
                                                        </button>

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
