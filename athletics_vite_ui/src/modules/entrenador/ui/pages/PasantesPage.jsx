import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, UserPlus, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import pasanteService from '../../services/pasanteService';
import PasanteForm from '../widgets/PasanteForm';

const PasantesPage = () => {
    const [pasantes, setPasantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedPasante, setSelectedPasante] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchPasantes();
    }, []);

    const fetchPasantes = async () => {
        try {
            setLoading(true);
            const data = await pasanteService.getAll();
            setPasantes(data);
        } catch (error) {
            console.error("Error fetching pasantes:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los pasantes'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedPasante(null);
        setShowModal(true);
    };

    const handleEdit = (pasante) => {
        setSelectedPasante(pasante);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#b30c25',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1a1a1a',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await pasanteService.delete(id);
                setPasantes(prev => prev.filter(p => p.external_id !== id));
                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'El pasante ha sido eliminado.',
                    icon: 'success',
                    confirmButtonColor: '#b30c25',
                    background: '#1a1a1a',
                    color: '#fff'
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo eliminar el pasante',
                    icon: 'error',
                    confirmButtonColor: '#b30c25',
                    background: '#1a1a1a',
                    color: '#fff'
                });
            }
        }
    };

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            if (selectedPasante) {
                await pasanteService.update(selectedPasante.external_id, data);
                Swal.fire({
                    icon: 'success',
                    title: 'Actualizado',
                    text: 'Pasante actualizado correctamente',
                    confirmButtonColor: '#b30c25',
                    background: '#1a1a1a',
                    color: '#fff'
                });
            } else {
                await pasanteService.create(data);
                Swal.fire({
                    icon: 'success',
                    title: 'Registrado',
                    text: 'Pasante registrado correctamente',
                    confirmButtonColor: '#b30c25',
                    background: '#1a1a1a',
                    color: '#fff'
                });
            }
            setShowModal(false);
            fetchPasantes();
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || error.response?.data?.summary || error.response?.data?.detail || 'Ocurrió un error al guardar',
                confirmButtonColor: '#b30c25',
                background: '#1a1a1a',
                color: '#fff'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredPasantes = pasantes.filter(p =>
        p.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.identificacion?.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 font-['Lexend'] p-4 sm:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Registro de Pasantes Deportistas</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Ingrese la información para dar de alta a nuevos deportistas en formación.
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-[#b30c25] hover:bg-[#80091b] text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-red-900/20 transition-all active:scale-95"
                >
                    <UserPlus size={20} />
                    Registrar Pasante
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Search & Stats Section (Left on Desktop, Top on Mobile) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Search Card */}
                    <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Buscar pasante</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Nombre, ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#b30c25]/50 transition-all placeholder:text-gray-500"
                            />
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-[#b30c25] p-6 rounded-2xl shadow-lg shadow-red-900/20 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-red-100 font-medium mb-1">Total Pasantes</p>
                            <h2 className="text-4xl font-bold">{pasantes.length}</h2>
                            <div className="mt-4 flex items-center gap-2 text-sm text-red-200">
                                <Clock size={16} />
                                <span>Actualizado recientemente</span>
                            </div>
                        </div>
                        <div className="absolute right-[-20px] top-[-20px] opacity-10">
                            <UserPlus size={120} />
                        </div>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                            <h2 className="font-semibold text-gray-900 dark:text-white text-lg">Pasantes Registrados</h2>
                            <span className="text-xs bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full font-medium">
                                {filteredPasantes.length} Totales
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-[#252525] border-b border-gray-100 dark:border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Especialidad</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inicio</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Estado</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                Cargando pasantes...
                                            </td>
                                        </tr>
                                    ) : filteredPasantes.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                No se encontraron pasantes.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPasantes.map((pasante) => (
                                            <tr key={pasante.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {pasante.first_name} {pasante.last_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5">
                                                            ID: {pasante.identificacion}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                                                        {pasante.especialidad}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                                                        {pasante.fecha_inicio}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${pasante.estado
                                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30'
                                                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30'
                                                        }`}>
                                                        {pasante.estado ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(pasante)}
                                                            className="p-1.5 text-gray-400 hover:text-[#b30c25] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(pasante.external_id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={16} />
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
                </div>
            </div>

            {/* Modal Overlay */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                {selectedPasante ? 'Editar Pasante' : 'Registrar Nuevo Pasante'}
                            </h2>
                            <PasanteForm
                                onSubmit={handleSubmit}
                                initialData={selectedPasante}
                                onClose={() => setShowModal(false)}
                                isLoading={isSubmitting}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PasantesPage;
