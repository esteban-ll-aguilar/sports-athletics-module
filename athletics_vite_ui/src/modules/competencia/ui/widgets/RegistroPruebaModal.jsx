import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import registroPruebaCompetenciaService from "../../services/registro_prueba_competencia_service";
import pruebaService from "../../services/prueba_service";
import RegistroPruebaCompetenciaModal from "../widgets/RegistroPruebaModal";
import Swal from "sweetalert2";

const RegistroPruebaCompetenciaPage = () => {
    const location = useLocation();
    const [registros, setRegistros] = useState([]);
    const [pruebas, setPruebas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRegistro, setSelectedRegistro] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resRegistros, resPruebas] = await Promise.all([
                registroPruebaCompetenciaService.getAll(),
                pruebaService.getAll()
            ]);

            setRegistros(Array.isArray(resRegistros) ? resRegistros : []);
            setPruebas(Array.isArray(resPruebas) ? resPruebas : []);
        } catch (err) {
            console.error("Error cargando datos:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (data) => {
        try {
            const payload = {
                id_entrenador: parseInt(data.id_entrenador, 10),
                prueba_id: parseInt(data.prueba_id, 10),
                valor: parseFloat(data.valor),
                fecha_registro: data.fecha_registro
            };

            if (selectedRegistro) {
                await registroPruebaCompetenciaService.update(selectedRegistro.external_id, payload);
            } else {
                await registroPruebaCompetenciaService.create(payload);
            }

            fetchData();
        } catch (err) {
            console.error("Error al procesar registro:", err);
            throw err;
        }
    };

    const handleDelete = async (registro) => {
        const result = await Swal.fire({
            title: '¿Eliminar este registro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444'
        });

        if (result.isConfirmed) {
            try {
                await registroPruebaCompetenciaService.delete(registro.external_id);
                fetchData();

                Swal.fire({
                    icon: 'success',
                    title: 'Registro eliminado',
                    text: 'El registro ha sido eliminado correctamente',
                    confirmButtonColor: '#ec1313'
                });
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el registro',
                    confirmButtonColor: '#ec1313'
                });
            }
        }
    };

    const isActiveTab = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 font-['Lexend'] text-gray-900 p-4 md:p-10">
            <div className="max-w-7xl mx-auto">

                {/* Cabecera y Navegación */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
                    <div className="space-y-4">
                        {/* Tabs de Navegación */}
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <Link
                                to="/dashboard/pruebas/gestion"
                                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-600 hover:border-red-500 hover:text-red-600 transition-all duration-200 hover:shadow-md"
                            >
                                📋 Pruebas
                            </Link>
                            <span className="text-gray-300">/</span>
                            <Link
                                to="/dashboard/pruebas/baremos"
                                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-600 hover:border-red-500 hover:text-red-600 transition-all duration-200 hover:shadow-md"
                            >
                                📊 Baremos
                            </Link>
                            <span className="text-gray-300">/</span>
                            <Link
                                to="/dashboard/pruebas/disciplinas"
                                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-600 hover:border-red-500 hover:text-red-600 transition-all duration-200 hover:shadow-md"
                            >
                                🏃 Disciplinas
                            </Link>
                        </div>

                        <div>
                            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                                Registro de Pruebas de Competencia
                            </h1>
                            <p className="text-gray-600 text-lg mt-2">
                                Administra los registros de resultados de pruebas
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => { setSelectedRegistro(null); setIsModalOpen(true); }}
                        className="group flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-red-200 transition-all hover:shadow-2xl hover:scale-105 active:scale-100 duration-200"
                    >
                        <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300">
                            add
                        </span>
                        Registrar Prueba
                    </button>
                </div>

                {/* TABLA */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600 tracking-wider">
                                        Prueba
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600">
                                        Valor
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600">
                                        Entrenador
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600 text-right">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                                                <span className="text-gray-500 font-semibold">Cargando registros...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : registros.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <span className="material-symbols-outlined text-6xl text-gray-300">
                                                    assignment
                                                </span>
                                                <span className="text-gray-400 font-semibold">No hay registros de pruebas</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    registros.map((r) => {
                                        const prueba = pruebas.find(p => p.id === r.prueba_id);
                                        return (
                                            <tr key={r.external_id} className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent transition-all duration-200">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl font-bold shadow-lg">
                                                            {prueba?.siglas?.substring(0, 2) || '??'}
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-red-600 uppercase tracking-wide">
                                                                {prueba?.siglas || 'N/A'}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                ID: {r.prueba_id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold uppercase ${prueba?.tipo_prueba === 'COMPETENCIA'
                                                            ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-200'
                                                            : 'bg-blue-100 text-blue-700 ring-2 ring-blue-200'
                                                        }`}>
                                                        {prueba?.tipo_prueba || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-lg text-gray-900">
                                                        {r.valor}
                                                    </span>
                                                    <span className="text-sm text-gray-400 ml-1">
                                                        {prueba?.unidad_medida || ''}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <span className="material-symbols-outlined text-lg">
                                                            calendar_today
                                                        </span>
                                                        {new Date(r.fecha_registro).toLocaleDateString('es-ES')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-blue-600 text-sm">
                                                                person
                                                            </span>
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-700">
                                                            ID: {r.id_entrenador}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => { setSelectedRegistro(r); setIsModalOpen(true); }}
                                                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                                                            title="Editar"
                                                        >
                                                            <span className="material-symbols-outlined">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(r)}
                                                            className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                                                            title="Eliminar"
                                                        >
                                                            <span className="material-symbols-outlined">delete</span>
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

            {/* MODAL */}
            <RegistroPruebaCompetenciaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                editingData={selectedRegistro}
            />
        </div>
    );
};

export default RegistroPruebaCompetenciaPage;