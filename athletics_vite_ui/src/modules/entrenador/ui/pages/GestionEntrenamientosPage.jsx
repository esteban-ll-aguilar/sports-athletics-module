import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import EntrenamientoService from '../../services/EntrenamientoService';
import EntrenamientoForm from '../components/EntrenamientoForm';
import HorarioManager from '../components/HorarioManager';
import { Link } from "react-router-dom";


const GestionEntrenamientosPage = () => {
    const [entrenamientos, setEntrenamientos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showHorarioModal, setShowHorarioModal] = useState(false);
    const [selectedEntrenamiento, setSelectedEntrenamiento] = useState(null);

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

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este entrenamiento?')) return;
        try {
            await EntrenamientoService.delete(id);
            toast.success('Entrenamiento eliminado');
            loadEntrenamientos();
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar');
        }
    };

    const handleSave = () => {
        loadEntrenamientos();
    };

    return (
        <div className="min-h-screen bg-[#121212] text-gray-200 font-['Lexend']">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <Link
                    to="/dashboard/entrenamientos"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 font-semibold text-sm mb-6 transition-all duration-200 group"
                >
                    <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform duration-200">

                    </span>
                </Link>

                {/* Cabecera */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
                    <div className="space-y-1">
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-100">
                            Gestión de Entrenamientos
                        </h1>
                        <p className="text-gray-400 text-lg">
                        </p>
                    </div>

                    <button
                        onClick={handleCreate}
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
    "                    >
                        <span className="material-symbols-outlined transition-transform duration-300 group-hover:rotate-90">
                            add
                        </span>
                        Nuevo Entrenamiento
                    </button>
                </div>


                {/* Tabla */}
                <div className="bg-[#212121] rounded-2xl border border-[#332122] shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#1a1a1a] border-b border-[#332122]">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        Descripción
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#332122]">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                                                <span className="text-gray-500 font-semibold">Cargando entrenamientos...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : entrenamientos.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <span className="material-symbols-outlined text-6xl text-gray-300">
                                                    fitness_center
                                                </span>
                                                <span className="text-gray-400 font-semibold">
                                                    No hay entrenamientos registrados
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    entrenamientos.map((ent) => (
                                        <tr
                                            key={ent.id}
                                            className="transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#b30c25] to-[#5a1a22] rounded-xl flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-white text-xl">
                                                            exercise
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-200">
                                                            {ent.tipo_entrenamiento}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-gray-400 text-sm max-w-xs truncate font-medium">
                                                    {ent.descripcion || <span className="italic text-gray-600">Sin descripción</span>}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1f1c1d] text-gray-200 border border-[#332122]">
                                                    {ent.fecha_entrenamiento}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleHorarios(ent)}
                                                        className="p-2.5 text-gray-400 hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                                                        title="Gestionar Asistencia"
                                                    >
                                                        <span className="material-symbols-outlined">groups</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(ent)}
                                                        className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                                                        title="Editar"
                                                    >
                                                        <span className="material-symbols-outlined">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(ent.id)}
                                                        className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                                                        title="Eliminar"
                                                    >
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
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
