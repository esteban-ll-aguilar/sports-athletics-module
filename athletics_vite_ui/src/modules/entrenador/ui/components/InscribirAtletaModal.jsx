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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-800 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between bg-[#111] rounded-t-3xl">
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
                <div className="px-6 py-4 border-b border-gray-800 bg-[#1a1a1a]">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o identificación..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#111] border border-gray-700 text-white rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#E50914] transition-colors placeholder-gray-600 font-medium"
                        />
                    </div>
                </div>

                {/* Lista de Atletas */}
                <div className="flex-1 overflow-y-auto px-6 py-4 bg-[#1a1a1a] custom-scrollbar">
                    {atletasFiltrados.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-[#111] flex items-center justify-center mb-4 text-gray-600 border border-gray-800">
                                <span className="material-symbols-outlined text-4xl">person_search</span>
                            </div>
                            <p className="text-gray-400 font-medium">No se encontraron atletas</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {atletasFiltrados.map((atleta) => {
                                const isSelected = selectedAtleta?.id === atleta.id;
                                const profileImage = atleta.user?.profile_image;
                                const initials = `${atleta.user?.first_name?.charAt(0) || ''}${atleta.user?.last_name?.charAt(0) || ''}`.toUpperCase() || 'A';

                                return (
                                    <button
                                        key={atleta.id}
                                        onClick={() => setSelectedAtleta(atleta)}
                                        className={`w-full p-4 rounded-xl text-left transition-all group ${isSelected
                                            ? 'bg-[#E50914] border-2 border-[#E50914] shadow-lg shadow-red-900/20'
                                            : 'bg-[#111] border border-gray-800 hover:border-gray-600 hover:bg-[#161616]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Profile Image or Avatar */}
                                            {profileImage ? (
                                                <img
                                                    src={profileImage}
                                                    alt={`${atleta.user?.first_name} ${atleta.user?.last_name}`}
                                                    className={`w-12 h-12 rounded-full object-cover border-2 ${isSelected ? 'border-white/30' : 'border-gray-700 group-hover:border-gray-500'
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
                                                        ? 'bg-white/20'
                                                        : 'bg-linear-to-br from-gray-700 to-gray-800 border border-gray-600'
                                                    }`}
                                            >
                                                {initials}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-100'}`}>
                                                    {atleta.user?.first_name} {atleta.user?.last_name}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`text-xs font-mono tracking-wide ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                                                        {atleta.user?.identificacion || 'Sin ID'}
                                                    </span>
                                                    {atleta.especialidad && (
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide ${isSelected
                                                            ? 'bg-black/20 text-white'
                                                            : 'bg-gray-800 text-gray-400 border border-gray-700'
                                                            }`}>
                                                            {atleta.especialidad}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <span className="material-symbols-outlined text-white text-2xl animate-in zoom-in duration-200">check_circle</span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-gray-800 flex justify-end gap-3 bg-[#111] rounded-b-3xl">
                    <button
                        onClick={handleClose}
                        className="px-6 py-3 bg-[#1a1a1a] border border-gray-700 text-gray-300 rounded-xl font-bold text-sm uppercase hover:bg-gray-800 hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleInscribir}
                        disabled={!selectedAtleta || loading}
                        className="px-6 py-3 bg-[#E50914] text-white rounded-xl font-bold text-sm uppercase hover:bg-[#b00710] shadow-lg shadow-red-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105 active:scale-95"
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                                Inscribiendo...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg">person_add</span>
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
