import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RepresentanteService from '../../services/RepresentanteService';
import { toast } from 'react-hot-toast';

const MisAtletasPage = () => {
    const navigate = useNavigate();
    const [athletes, setAthletes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAthletes();
    }, []);

    const fetchAthletes = async () => {
        try {
            const response = await RepresentanteService.getMyAthletes();
            // ApiClient already unwraps response.data
            setAthletes(response || []);
        } catch (error) {
            console.error("Error fetching athletes:", error);
            toast.error("Error al cargar los atletas");
        } finally {
            setLoading(false);
        }
    };

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAtletaId, setSelectedAtletaId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        first_name: '',
        last_name: '',
        identificacion: '',
        direccion: '',
        phone: '',
        anios_experiencia: 0
    });

    const handleEditClick = async (atletaId) => {
        try {
            setSelectedAtletaId(atletaId);
            setLoading(true);
            const detail = await RepresentanteService.getAtletaDetail(atletaId);
            setEditFormData({
                first_name: detail.user.first_name || '',
                last_name: detail.user.last_name || '',
                identificacion: detail.user.identificacion || detail.user.cedula || '',
                direccion: detail.user.direccion || '',
                phone: detail.user.phone || '',
                anios_experiencia: detail.anios_experiencia || 0,
            });
            setShowEditModal(true);
        } catch (error) {
            toast.error("Error cargando información para editar.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                first_name: editFormData.first_name,
                last_name: editFormData.last_name,
                identificacion: editFormData.identificacion,
                direccion: editFormData.direccion,
                phone: editFormData.phone,
                atleta_data: {
                    anios_experiencia: parseInt(editFormData.anios_experiencia)
                }
            };

            await RepresentanteService.updateChildAthlete(selectedAtletaId, payload);
            toast.success("Información actualizada correctamente.");
            setShowEditModal(false);
            fetchAthletes(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar la información.");
        }
    };

    const handleChange = (e) => {
        setEditFormData({
            ...editFormData,
            [e.target.name]: e.target.value
        });
    };

    if (loading && !showEditModal) { // Only show full loading if not in modal flow (though verified loading state usage)
        return (
            <div className="flex justify-center p-12">
                <span className="material-symbols-outlined animate-spin text-4xl text-red-600">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                {/* Header content */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Mis Atletas</h1>
                    <p className="text-gray-500">Gestiona los atletas que tienes registrados.</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/representante/register-athlete')}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                    <span className="material-symbols-outlined">add</span>
                    Registrar Atleta
                </button>
            </div>

            {athletes.length === 0 && !loading ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-4xl text-gray-400">groups</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No tienes atletas registrados</h3>
                    <p className="text-gray-500 mt-2 mb-6 max-w-sm mx-auto">Registra a tus hijos o representados para gestionar sus entrenamientos.</p>
                    <button
                        onClick={() => navigate('/dashboard/representante/register-athlete')}
                        className="text-red-600 font-medium hover:text-red-700 hover:underline"
                    >
                        Registrar mi primer atleta
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {athletes.map((atleta) => (
                        <div key={atleta.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xl">
                                        {atleta.user?.first_name?.charAt(0) || 'A'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{atleta.user?.first_name} {atleta.user?.last_name}</h3>
                                        <p className="text-sm text-gray-500">{atleta.user?.email}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="block text-gray-400 text-xs">Identificación</span>
                                        <span className="font-medium text-gray-700">{atleta.user?.identificacion}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 text-xs">Experiencia</span>
                                        <span className="font-medium text-gray-700">{atleta.anios_experiencia} años</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-5 py-3 flex justify-end gap-2">
                                <button
                                    onClick={() => handleEditClick(atleta.id)}
                                    className="text-sm text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-base">edit</span>
                                    Editar
                                </button>
                                <button
                                    onClick={() => navigate(`/dashboard/representante/atleta/${atleta.id}`)}
                                    className="text-sm text-gray-600 hover:text-red-600 font-medium flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-base">monitoring</span>
                                    Ver Rendimiento
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold dark:text-white">Editar Información del Atleta</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={editFormData.first_name}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Apellido</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={editFormData.last_name}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Identificación</label>
                                    <input
                                        type="text"
                                        name="identificacion"
                                        value={editFormData.identificacion}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={editFormData.phone}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección</label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={editFormData.direccion}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Años de Experiencia</label>
                                    <input
                                        type="number"
                                        name="anios_experiencia"
                                        value={editFormData.anios_experiencia}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MisAtletasPage;
