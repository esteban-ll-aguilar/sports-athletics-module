import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import EntrenamientoService from '../../services/EntrenamientoService';
import EntrenamientoForm from '../components/EntrenamientoForm';
import HorarioManager from '../components/HorarioManager';
import Swal from 'sweetalert2';
import { Power, CheckCircle } from 'lucide-react';
import { Plus, Search, Dumbbell, Calendar, Users, Edit, Trash2, Info } from 'lucide-react';

const GestionEntrenamientosPage = () => {
    const [entrenamientos, setEntrenamientos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showHorarioModal, setShowHorarioModal] = useState(false);
    const [selectedEntrenamiento, setSelectedEntrenamiento] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    const loadEntrenamientos = async () => {
        setIsLoading(true);
        try {
            const data = await EntrenamientoService.getAll();
            setEntrenamientos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar entrenamientos');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadEntrenamientos();
    }, []);

    const handleCreate = () => {
        setSelectedEntrenamiento(null);
        setShowModal(true);
    };

    const handleEdit = (entrenamiento) => {
        setSelectedEntrenamiento(entrenamiento);
        setShowModal(true);
    };

    const handleHorarios = (entrenamiento) => {
        navigate(`/dashboard/entrenamientos/${entrenamiento.id}/asistencia`);
    };

    const toggleStatus = async (entrenamiento) => {
        const nuevoEstado = !entrenamiento.estado;

        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: nuevoEstado
                ? `¿Desea activar el entrenamiento: ${entrenamiento.tipo_entrenamiento}?`
                : `¿Desea desactivar el entrenamiento: ${entrenamiento.tipo_entrenamiento}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#b30c25',
            cancelButtonColor: '#6b7280',
            confirmButtonText: nuevoEstado ? 'Sí, activar' : 'Sí, desactivar',
            cancelButtonText: 'Cancelar',
            background: '#1a1a1a',
            color: '#fff',
            customClass: {
                popup: 'dark:bg-[#1a1a1a] dark:text-white dark:border dark:border-[#332122]'
            }
        });

        if (!result.isConfirmed) return;

        try {
            await EntrenamientoService.update(entrenamiento.id, {
                ...entrenamiento,
                estado: nuevoEstado
            });

            // 🔹 actualización local inmediata
            setEntrenamientos(prev =>
                prev.map(e =>
                    e.id === entrenamiento.id
                        ? { ...e, estado: nuevoEstado }
                        : e
                )
            );

            Swal.fire({
                title: '¡Éxito!',
                text: nuevoEstado
                    ? 'Entrenamiento activado correctamente'
                    : 'Entrenamiento desactivado correctamente',
                icon: 'success',
                confirmButtonColor: '#b30c25',
                background: '#1a1a1a',
                color: '#fff'
            });

        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cambiar el estado del entrenamiento',
                icon: 'error',
                confirmButtonColor: '#b30c25',
                background: '#1a1a1a',
                color: '#fff'
            });
        }
    };


    const handleSave = () => {
        loadEntrenamientos();
    };

    // Filter logic
    const filteredEntrenamientos = entrenamientos.filter(ent =>
        ent.tipo_entrenamiento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ent.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 font-['Lexend'] transition-colors duration-300">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                            Gestión de Entrenamientos
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            Administra las sesiones, horarios y asistencia de los atletas.
                        </p>
                    </div>
                    {/* Separador */}
                    <div className="mt-8 mb-6 border-b border-gray-200 dark:border-[#332122]" />


                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <button
                            onClick={() => navigate('/dashboard/entrenamientos/resultados')}
                            className="
                                flex-1 md:flex-none flex items-center justify-center gap-2
                                px-6 py-3 rounded-xl
                                text-sm font-bold text-[#b30c25]
                                bg-red-50 dark:bg-[#b30c25]/10
                                hover:bg-red-100 dark:hover:bg-[#b30c25]/20
                                border border-[#b30c25]/20
                                active:scale-95 transition-all
                            "
                        >
                            <Dumbbell size={20} className="flex flex-col sm:flex-row gap-4 w-full md:w-auto" />
                            Ver Resultados
                        </button>
                        <button
                            onClick={handleCreate}
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
                            Nuevo Entrenamiento
                        </button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row gap-6 mb-8 mt-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por tipo o descripción..."
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
                    {/* Placeholder filter button if needed */}
                    {/* <button className="px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#332122] rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Filter size={20} />
                    </button> */}
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-[#212121] rounded-2xl border border-gray-200 dark:border-[#332122] shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text- text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#332122]">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Entrenamiento
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Descripción
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-[#332122]">
                                {(() => {
                                    if (isLoading) {
                                        return (
                                            <tr>
                                                <td colSpan="4" className="py-20 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-10 h-10 border-4 border-[#b30c25] border-t-transparent rounded-full animate-spin"></div>
                                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Cargando entrenamientos...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    if (filteredEntrenamientos.length === 0) {
                                        return (
                                            <tr>
                                                <td colSpan="4" className="py-20 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="p-4 bg-gray-100 dark:bg-[#2a2829] rounded-full">
                                                            <Dumbbell className="text-gray-400" size={32} />
                                                        </div>
                                                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                                                            No se encontraron entrenamientos.
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return filteredEntrenamientos.map((ent) => (
                                        <tr
                                            key={ent.id}
                                            className={`transition-colors ${!ent.estado
                                                    ? "bg-gray-50/50 dark:bg-[#1a1a1a]/50 opacity-60"
                                                    : "hover:bg-gray-50 dark:hover:bg-[#2a2829]"
                                                }`}                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="shrink-0 w-12 h-12 bg-red-50 dark:bg-[#b30c25]/10 rounded-xl flex items-center justify-center text-[#b30c25]">
                                                        <Dumbbell size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white text-lg">
                                                            {ent.tipo_entrenamiento}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs truncate font-medium flex items-center gap-2">
                                                    {ent.descripcion ? (
                                                        ent.descripcion
                                                    ) : (
                                                        <span className="italic text-gray-400 dark:text-gray-600 flex items-center gap-1">
                                                            <Info size={14} /> Sin descripción
                                                        </span>
                                                    )}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-[#1f1c1d] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#332122]">
                                                    <Calendar size={14} className="text-[#b30c25]" />
                                                    {ent.fecha_entrenamiento}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/dashboard/entrenamientos/${ent.id}/resultados`)}
                                                        className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-all"
                                                        title="Gestionar Resultados"
                                                    >
                                                        <Dumbbell size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleHorarios(ent)}
                                                        className="p-2 text-gray-500 hover:text-[#b30c25] hover:bg-red-50 dark:hover:bg-[#b30c25]/10 rounded-lg transition-all"
                                                        title="Gestionar Asistencia"
                                                    >
                                                        <Users size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(ent)}
                                                        className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                                                        title="Editar"
                                                    >
                                                        <Edit size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleStatus(ent)}
                                                        className={`p-2 rounded-lg transition-colors ${ent.estado
                                                            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                                                            : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10'
                                                            }`}
                                                        title={ent.estado ? "Desactivar" : "Activar"}
                                                    >
                                                        {ent.estado ? <Power size={20} /> : <CheckCircle size={20} />}
                                                    </button>

                                                </div>
                                            </td>
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>

                <EntrenamientoForm
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    entrenamientoToEdit={selectedEntrenamiento}
                    onSave={handleSave}
                />

                <HorarioManager
                    show={showHorarioModal}
                    onClose={() => {
                        setShowHorarioModal(false);
                        loadEntrenamientos();
                    }}
                    entrenamiento={selectedEntrenamiento}
                />
            </div>
        </div>
    );
};

export default GestionEntrenamientosPage;
