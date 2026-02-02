import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import pruebaService from "../../services/prueba_service";
import PruebaModal from "../widgets/PruebaModal.jsx";
import Swal from "sweetalert2";
import { Search, PlusCircle, Edit3, Power, CheckCircle } from 'lucide-react';

const PruebasPage = () => {
    const [pruebas, setPruebas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPrueba, setSelectedPrueba] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const resPruebas = await pruebaService.getAll();
            setPruebas(Array.isArray(resPruebas) ? resPruebas : []);
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

    const getTipoPruebaStyles = (tipo) => {
        if (tipo === 'COMPETENCIA') {
            return 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/30';
        }
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/30';
    };

    const getEstadoStyles = (estado) => {
        if (estado) {
            return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30';
        }
        return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30';
    };

    const renderTableBody = () => {
        if (loading) {
            return [
                <tr key="loading-row">
                    <td colSpan="5" className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 border-4 border-[#b30c25] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Cargando pruebas...</span>
                        </div>
                    </td>
                </tr>
            ];
        }

        if (filteredPruebas.length === 0) {
            return [
                <tr key="no-results-row">
                    <td colSpan="5" className="py-20 text-center">
                        <div className="flex flex-col items-center text-gray-400 space-y-3">
                            <div className="bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-full border border-gray-100 dark:border-[#332122]">
                                <Search size={40} />
                            </div>
                            <p className="text-lg font-medium">No se encontraron pruebas</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-[#b30c25] hover:underline font-bold"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    </td>
                </tr>
            ];
        }

        return filteredPruebas.map((p) => (
            <tr
                key={p.id}
                className={`transition-colors duration-200 ${!p.estado
                    ? 'bg-gray-50/50 dark:bg-[#1a1a1a]/50 opacity-60'
                    : 'hover:bg-gray-50 dark:hover:bg-[#2a2829]'
                    }`}
            >
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#212121] flex items-center justify-center text-gray-500 font-black text-sm">
                            {p.siglas?.substring(0, 2)}
                        </div>
                        <div>
                            <div className="text-xs font-bold text-[#b30c25] uppercase tracking-wide">
                                {p.siglas}
                            </div>
                            <div className="font-bold text-gray-900 dark:text-gray-100">
                                {p.nombre}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTipoPruebaStyles(p.tipo_prueba)}`}>
                        {p.tipo_prueba}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-900 dark:text-gray-200 font-bold uppercase">
                            {p.tipo_medicion}
                        </span>
                        <span className="text-[10px] text-gray-500">
                            {p.unidad_medida}
                        </span>
                    </div>
                </td>
                <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoStyles(p.estado)}`}>
                        {p.estado ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => {
                                setSelectedPrueba(p);
                                setIsModalOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                            title="Editar prueba"
                        >
                            <Edit3 size={18} />
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
        ));
    };

    return (
        <div className="p-6 md:p-8 min-h-screen bg-gray-50 dark:bg-[#121212] transition-colors duration-300 font-['Lexend']">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <Link
                            to="/dashboard/competencias"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 font-semibold text-sm mb-2 transition-all duration-200 group"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform duration-200">
                                ← Volver
                            </span>
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                            Catálogo de Pruebas
                        </h1>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">
                            Gestiona las disciplinas y pruebas técnicas del sistema.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedPrueba(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-linear-to-r from-[#b30c25] to-[#80091b] text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-red-900/20 active:scale-95 transition-all font-bold w-full md:w-auto"
                    >
                        <PlusCircle size={20} />
                        Nueva Prueba
                    </button>
                </div>

                {/* Filters/Actions */}
                <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl border border-gray-200 dark:border-[#332122] shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o siglas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#212121] border border-gray-200 dark:border-[#332122] rounded-xl text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-[#b30c25] outline-none transition-all placeholder-gray-400"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Total: {filteredPruebas.length}</span>
                    </div>
                </div>

                {/* Quick Access Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Link
                        to="/dashboard/registro-pruebas/resultados"
                        className="group bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-200 dark:border-[#332122] hover:border-[#b30c25] dark:hover:border-[#b30c25] shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-2xl">assignment</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Resultados</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Registrar resultados</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/dashboard/registro-pruebas/baremos"
                        className="group bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-200 dark:border-[#332122] hover:border-[#b30c25] dark:hover:border-[#b30c25] shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-2xl">rule</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Baremos Completos</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Con rangos e ítems</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/dashboard/registro-pruebas/baremos-simple"
                        className="group bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-200 dark:border-[#332122] hover:border-[#b30c25] dark:hover:border-[#b30c25] shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-2xl">speed</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Baremos Simples</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Vista simplificada</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/dashboard/registro-pruebas/disciplinas"
                        className="group bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-200 dark:border-[#332122] hover:border-[#b30c25] dark:hover:border-[#b30c25] shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-2xl">category</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Disciplinas</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Tipos de disciplina</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#332122] shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-[#212121]/50 border-b border-gray-200 dark:border-[#332122]">
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prueba</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Medición</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-[#332122]">
                                {renderTableBody()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
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
