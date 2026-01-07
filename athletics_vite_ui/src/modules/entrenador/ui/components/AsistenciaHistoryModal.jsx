import React from 'react';

const AsistenciaHistoryModal = ({ isOpen, onClose, atletaName, asistencias }) => {
    if (!isOpen) return null;

    // Group dates by month (Optional, but nice)
    // For MVP, just a nice list/grid

    // Sort descending
    const sortedAsistencias = [...asistencias].sort((a, b) => new Date(b.fecha_asistencia) - new Date(a.fecha_asistencia));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
                <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">
                        Historial de Asistencia
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-500 mb-4">
                        Atleta: <span className="font-semibold text-gray-900">{atletaName}</span>
                    </p>

                    {sortedAsistencias.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                            <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                            <p>Sin asistencias registradas</p>
                        </div>
                    ) : (
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {sortedAsistencias.map((asist) => (
                                <div key={asist.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                            <span className="material-symbols-outlined text-lg">check_circle</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800">
                                                {asist.fecha_asistencia}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Registrado a las {asist.hora_llegada}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AsistenciaHistoryModal;
