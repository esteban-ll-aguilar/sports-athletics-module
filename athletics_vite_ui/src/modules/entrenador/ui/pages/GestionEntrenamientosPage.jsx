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
                <div className="bg-[#1a1a1a] rounded-3xl border border-gray-800 shadow-2xl shadow-black/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#111] border-b border-gray-800">
                                    <th className="px-6 py-5 text-xs font-bold uppercase text-gray-500 tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase text-gray-500">
                                        Descripción
                                    </th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase text-gray-500 text-center">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase text-gray-500 text-right">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 border-4 border-gray-700 border-t-red-600 rounded-full animate-spin"></div>
                                                <span className="text-gray-500 font-semibold">Cargando entrenamientos...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : entrenamientos.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-4xl text-gray-600">
                                                        fitness_center
                                                    </span>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-white font-bold text-lg">No hay entrenamientos</p>
                                                    <p className="text-gray-500">Comienza creando tu primera sesión.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    entrenamientos.map((ent) => (
                                        <tr key={ent.id} className="hover:bg-white/5 transition-colors duration-200 group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                                                        <span className="material-symbols-outlined">exercise</span>
                                                    </div>
                                                    <span className="font-bold text-white text-lg">
                                                        {ent.tipo_entrenamiento}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-gray-400 text-sm max-w-xs truncate font-medium">
                                                    {ent.descripcion || <span className="italic text-gray-600">Sin descripción</span>}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-800 text-gray-300 border border-gray-700">
                                                    {ent.fecha_entrenamiento}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleHorarios(ent)}
                                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                                                        title="Gestionar Asistencia"
                                                    >
                                                        <span className="material-symbols-outlined">groups</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(ent)}
                                                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all"
                                                        title="Editar"
                                                    >
                                                        <span className="material-symbols-outlined">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(ent.id)}
                                                        className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
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
