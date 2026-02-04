import React from 'react';
import { X, CalendarX, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const AsistenciaHistoryModal = ({ isOpen, onClose, atletaName, asistencias }) => {
    if (!isOpen) return null;

    // Sort descending
    const sortedAsistencias = [...asistencias].sort((a, b) => new Date(b.fecha_asistencia) - new Date(a.fecha_asistencia));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-[#332122] flex flex-col max-h-[80vh]">
                <div className="bg-gray-50 dark:bg-[#111] p-5 border-b border-gray-200 dark:border-[#332122] flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Historial de Asistencia
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Atleta: <span className="font-bold text-gray-900 dark:text-white ml-1">{atletaName}</span>
                    </p>

                    {sortedAsistencias.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-[#332122] rounded-xl bg-gray-50 dark:bg-[#111]">
                            <CalendarX className="mx-auto mb-2 text-gray-400 dark:text-gray-600" size={40} />
                            <p className="text-xs font-medium uppercase tracking-wide">Sin asistencias registradas</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sortedAsistencias.map((asist) => {
                                // Determine status for history item
                                const isPresente = asist.asistio;
                                const isRejection = !asist.asistio && asist.atleta_confirmo === false;

                                let Icon = CheckCircle;
                                let colorClass = "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-500 dark:border-green-500/20";
                                let statusText = "Asistió";
                                let dateColor = "text-gray-900 dark:text-white";

                                if (!isPresente) {
                                    if (isRejection) {
                                        Icon = CalendarX;
                                        colorClass = "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20";
                                        statusText = "No Asistirá";
                                        dateColor = "text-gray-500 dark:text-gray-300";
                                    } else {
                                        Icon = AlertCircle;
                                        colorClass = "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20";
                                        statusText = "Ausente";
                                        dateColor = "text-gray-500 dark:text-gray-300";
                                    }
                                }

                                return (
                                    <div key={asist.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#111] border border-gray-100 dark:border-[#332122] rounded-xl shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl border ${colorClass} flex items-center justify-center`}>
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <div className={`font-bold text-sm ${dateColor}`}>
                                                    {asist.fecha_asistencia}
                                                </div>
                                                <div className="text-[10px] text-gray-500 dark:text-gray-500 uppercase font-bold tracking-wide mt-0.5 flex items-center gap-1">
                                                    {statusText} <span className="mx-1 opacity-50">|</span> <Clock size={10} className="inline" /> {asist.hora_llegada || '--:--'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#111] border-t border-gray-200 dark:border-[#332122] text-right rounded-b-3xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors uppercase tracking-wide shadow-sm"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AsistenciaHistoryModal;
