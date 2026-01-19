import React from 'react';

const AsistenciaHistoryModal = ({ isOpen, onClose, atletaName, asistencias }) => {
    if (!isOpen) return null;

    // Group dates by month (Optional, but nice)
    // For MVP, just a nice list/grid

    // Sort descending
    const sortedAsistencias = [...asistencias].sort((a, b) => new Date(b.fecha_asistencia) - new Date(a.fecha_asistencia));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-800">
                <div className="bg-[#111] p-5 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">
                        Historial de Asistencia
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-400 mb-4">
                        Atleta: <span className="font-bold text-white ml-1">{atletaName}</span>
                    </p>

                    {sortedAsistencias.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl bg-[#111]">
                            <span className="material-symbols-outlined text-4xl mb-2 text-gray-700">event_busy</span>
                            <p className="text-xs font-medium uppercase tracking-wide">Sin asistencias registradas</p>
                        </div>
                    ) : (
                        <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {sortedAsistencias.map((asist) => {
                                // Determine status for history item
                                const isPresente = asist.asistio;
                                const isRejection = !asist.asistio && asist.atleta_confirmo === false;

                                let icon = "check_circle";
                                let colorClass = "bg-green-500/10 text-green-500 border-green-500/20";
                                let statusText = "Asistió";
                                let dateColor = "text-white";

                                if (!isPresente) {
                                    if (isRejection) {
                                        icon = "event_busy";
                                        colorClass = "bg-red-500/10 text-red-500 border-red-500/20";
                                        statusText = "No Asistirá";
                                        dateColor = "text-gray-300";
                                    } else {
                                        icon = "cancel";
                                        colorClass = "bg-red-500/10 text-red-500 border-red-500/20";
                                        statusText = "Ausente";
                                        dateColor = "text-gray-300";
                                    }
                                }

                                return (
                                    <div key={asist.id} className="flex items-center justify-between p-3 bg-[#111] border border-gray-800 rounded-xl shadow-sm hover:border-gray-600 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg border ${colorClass} flex items-center justify-center`}>
                                                <span className="material-symbols-outlined text-lg">{icon}</span>
                                            </div>
                                            <div>
                                                <div className={`font-bold text-sm ${dateColor}`}>
                                                    {asist.fecha_asistencia}
                                                </div>
                                                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">
                                                    {statusText} • {asist.hora_llegada || '--:--'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="p-4 bg-[#111] border-t border-gray-800 text-right">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-[#1a1a1a] border border-gray-700 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-gray-800 transition-colors uppercase tracking-wide"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AsistenciaHistoryModal;
