import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import EntrenamientoService from '../../services/EntrenamientoService';
import EntrenamientoForm from '../components/EntrenamientoForm';

const GestionEntrenamientosPage = () => {
    const [entrenamientos, setEntrenamientos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedEntrenamiento, setSelectedEntrenamiento] = useState(null);

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
        // El modal se cierra desde el componente hijo o podemos mantener el estado sincronizado
        // En este caso el form llama a onClose
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 font-['Lexend'] text-gray-900 p-4 md:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Cabecera */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                            Gestión de Entrenamientos
                        </h1>
                        <p className="text-gray-600 text-lg mt-2">
                            Planifica y administra las sesiones de entrenamiento
                        </p>
                    </div>

                    <button
                        onClick={handleCreate}
                        className="group flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-red-200 transition-all hover:shadow-2xl hover:scale-105 active:scale-100 duration-200"
                    >
                        <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300">
                            add
                        </span>
                        Nuevo Entrenamiento
                    </button>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600 tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600">
                                        Descripción
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600 text-center">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600 text-right">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
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
                                                <span className="text-gray-400 font-semibold">No hay entrenamientos registrados</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    entrenamientos.map((ent) => (
                                        <tr key={ent.id} className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent transition-all duration-200">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">
                                                    {ent.tipo_entrenamiento}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">
                                                {ent.descripcion}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700">
                                                    {ent.fecha_entrenamiento}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(ent)}
                                                        className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                                                        title="Editar"
                                                    >
                                                        <span className="material-symbols-outlined">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(ent.id)}
                                                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
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
            </div>
        </div>
    );
};

export default GestionEntrenamientosPage;
