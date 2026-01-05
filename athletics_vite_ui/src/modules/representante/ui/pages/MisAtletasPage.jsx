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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
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

            {loading ? (
                <div className="flex justify-center p-12">
                    <span className="material-symbols-outlined animate-spin text-4xl text-red-600">progress_activity</span>
                </div>
            ) : athletes.length === 0 ? (
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
                            {/* Actions Footer if needed */}
                            {/* <div className="bg-gray-50 px-5 py-3 flex justify-end">
                               <button className="text-sm text-gray-600 hover:text-red-600 font-medium">Ver detalles</button>
                           </div> */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MisAtletasPage;
