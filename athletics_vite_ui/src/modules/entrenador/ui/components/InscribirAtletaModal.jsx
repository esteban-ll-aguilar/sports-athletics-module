import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const InscribirAtletaModal = ({ show, onClose, atletasDisponibles, onInscribir, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAtleta, setSelectedAtleta] = useState(null);

    if (!show) return null;

    const atletasFiltrados = atletasDisponibles.filter(atleta => {
        const nombreCompleto = `${atleta.user?.first_name || ''} ${atleta.user?.last_name || ''}`.toLowerCase();
        const identificacion = (atleta.user?.identificacion || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return nombreCompleto.includes(search) || identificacion.includes(search);
    });

    const handleInscribir = () => {
        if (!selectedAtleta) {
            toast.error('Selecciona un atleta');
            return;
        }
        onInscribir(selectedAtleta.id);
        setSelectedAtleta(null);
        setSearchTerm('');
    };

    const handleClose = () => {
        setSelectedAtleta(null);
        setSearchTerm('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-700">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Inscribir Atleta</h2>
                        <p className="text-gray-400 text-sm mt-1">Busca y selecciona un atleta para inscribir en este horario</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 py-4 border-b border-gray-700">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o identificación..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Lista de Atletas */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {atletasFiltrados.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-6xl text-gray-600 mb-3">person_search</span>
                            <p className="text-gray-400">No se encontraron atletas</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {atletasFiltrados.map((atleta) => {
                                const isSelected = selectedAtleta?.id === atleta.id;
                                const profileImage = atleta.user?.profile_image;
                                const initials = `${atleta.user?.first_name?.charAt(0) || ''}${atleta.user?.last_name?.charAt(0) || ''}`.toUpperCase() || 'A';

                                return (
                                    <button
                                        key={atleta.id}
                                        onClick={() => setSelectedAtleta(atleta)}
                                        className={`w-full p-4 rounded-xl text-left transition-all ${isSelected
                                            ? 'bg-green-600 border-2 border-green-500 shadow-lg'
                                            : 'bg-gray-800 border-2 border-gray-700 hover:border-gray-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Profile Image or Avatar */}
                                            {profileImage ? (
                                                <img
                                                    src={profileImage}
                                                    alt={`${atleta.user?.first_name} ${atleta.user?.last_name}`}
                                                    className={`w-12 h-12 rounded-full object-cover border-2 ${isSelected ? 'border-green-400' : 'border-gray-600'
                                                        }`}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextElementSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${profileImage ? 'hidden' : 'flex'
                                                    } ${isSelected
                                                        ? 'bg-green-700'
                                                        : 'bg-linear-to-br from-blue-500 to-purple-500'
                                                    }`}
                                            >
                                                {initials}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-100'}`}>
                                                    {atleta.user?.first_name} {atleta.user?.last_name}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`text-sm ${isSelected ? 'text-green-100' : 'text-gray-400'}`}>
                                                        {atleta.user?.identificacion || 'Sin ID'}
                                                    </span>
                                                    {atleta.especialidad && (
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected
                                                            ? 'bg-green-700 text-green-100'
                                                            : 'bg-gray-700 text-gray-300'
                                                            }`}>
                                                            {atleta.especialidad}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <span className="material-symbols-outlined text-white">check_circle</span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleInscribir}
                        disabled={!selectedAtleta || loading}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">refresh</span>
                                Inscribiendo...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">person_add</span>
                                Inscribir Atleta
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InscribirAtletaModal;
