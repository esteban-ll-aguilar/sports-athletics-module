import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Search, UserPlus, X, RefreshCw, CheckCircle, User } from 'lucide-react';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-200 dark:border-[#332122] animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 dark:border-[#332122] flex items-center justify-between bg-gray-50 dark:bg-[#111] rounded-t-3xl">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Inscribir Atleta</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Busca y selecciona un atleta para inscribir en este horario</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-[#332122] bg-white dark:bg-[#1a1a1a]">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o identificación..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="
                                w-full bg-gray-50 dark:bg-[#111] 
                                border border-gray-200 dark:border-[#332122] 
                                text-gray-900 dark:text-white 
                                rounded-xl pl-12 pr-4 py-4 
                                focus:outline-none focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
                                transition-all placeholder-gray-400 dark:placeholder-gray-500 font-medium
                            "
                        />
                    </div>
                </div>

                {/* Lista de Atletas */}
                <div className="flex-1 overflow-y-auto px-6 py-4 bg-white dark:bg-[#1a1a1a] custom-scrollbar">
                    {atletasFiltrados.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-[#111] flex items-center justify-center mb-4 text-gray-400 border border-gray-100 dark:border-[#332122]">
                                <Search size={32} />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron atletas</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {atletasFiltrados.map((atleta) => {
                                const isSelected = selectedAtleta?.id === atleta.id;
                                const initials = `${atleta.user?.first_name?.charAt(0) || ''}${atleta.user?.last_name?.charAt(0) || ''}`.toUpperCase() || 'A';

                                return (
                                    <button
                                        key={atleta.id}
                                        onClick={() => setSelectedAtleta(atleta)}
                                        className={`w-full p-4 rounded-xl text-left transition-all group ${isSelected
                                            ? 'bg-[#b30c25] text-white shadow-lg shadow-red-900/30 ring-2 ring-offset-2 ring-[#b30c25] dark:ring-offset-[#1a1a1a]'
                                            : 'bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-[#332122] hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-[#161616]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Avatar logic simplified for consistency */}
                                            <div
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-inner ${isSelected
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-white dark:bg-[#1a1a1a] text-[#b30c25] border border-gray-200 dark:border-[#332122]'
                                                    }`}
                                            >
                                                {initials}
                                            </div>

                                            <div className="flex-1">
                                                <p className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                                                    {atleta.user?.first_name} {atleta.user?.last_name}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`text-xs font-mono tracking-wide flex items-center gap-1 ${isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        <User size={12} />
                                                        {atleta.user?.identificacion || 'Sin ID'}
                                                    </span>
                                                    {atleta.especialidad && (
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-lg uppercase font-bold tracking-wide ${isSelected
                                                            ? 'bg-black/20 text-white'
                                                            : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                            }`}>
                                                            {atleta.especialidad}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <CheckCircle className="text-white animate-in zoom-in duration-300" size={24} />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-gray-100 dark:border-[#332122] flex justify-end gap-3 bg-gray-50 dark:bg-[#111] rounded-b-3xl">
                    <button
                        onClick={handleClose}
                        className="px-6 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm uppercase hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleInscribir}
                        disabled={!selectedAtleta || loading}
                        className="px-6 py-3 bg-[#b30c25] text-white rounded-xl font-bold text-sm uppercase hover:bg-[#990a1f] shadow-lg shadow-red-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105 active:scale-95"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="animate-spin" size={18} />
                                Inscribiendo...
                            </>
                        ) : (
                            <>
                                <UserPlus size={18} />
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
