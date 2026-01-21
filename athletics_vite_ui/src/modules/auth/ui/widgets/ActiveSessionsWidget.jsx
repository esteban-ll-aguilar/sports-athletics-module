import React, { useEffect, useState } from 'react';
import { RefreshCw, Smartphone, Trash2, AlertTriangle, Monitor, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import authService from '../../services/auth_service';
import Swal from 'sweetalert2';

const ActiveSessionsWidget = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [revokingId, setRevokingId] = useState(null);
    const [revokingAll, setRevokingAll] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const response = await authService.getSessions();
            if (response.success && response.data) {
                setSessions(response.data.sessions || []);
            } else {
                toast.error('Error cargando sesiones');
            }
        } catch (error) {
            console.error(error);
            const msg = error.message || error.detail || 'No se pudo obtener las sesiones activas';
            // Only toast if it's not a standard cancellation or 401 redirect
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (sessionId) => {
        setRevokingId(sessionId);
        try {
            const response = await authService.revokeSession(sessionId);
            if (response.success) {
                toast.success('Sesión revocada exitosamente');
                setSessions(prev => prev.filter(s => s.id !== sessionId));
            } else {
                toast.error(response.message || 'Error al revocar la sesión');
            }
        } catch (error) {
            const msg = error.message || error.detail || 'Error al revocar la sesión';
            toast.error(msg);
        } finally {
            setRevokingId(null);
        }
    };

    const handleRevokeAll = async () => {
        const result = await Swal.fire({
            title: '¿Cerrar todas las sesiones?',
            text: "Se cerrarán todas las sesiones excepto la actual. ¿Estás seguro?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#b30c25',
            cancelButtonColor: '#332122',
            confirmButtonText: 'Sí, cerrar todas',
            cancelButtonText: 'Cancelar',
            background: '#242223', // Matches dark mode
            color: '#fff'
        });

        if (!result.isConfirmed) return;

        setRevokingAll(true);
        try {
            const response = await authService.revokeAllSessions();
            if (response.success) {
                toast.success(response.message || 'Se revocaron todas las sesiones exitosamente');
                // Re-fetch to see only the current one potentially, or just filter locally if we knew distinct IDs
                fetchSessions();
            } else {
                toast.error(response.message || 'Error al revocar sesiones');
            }
        } catch (error) {
            const msg = error.message || error.detail || 'Error al revocar sesiones';
            toast.error(msg);
        } finally {
            setRevokingAll(false);
        }
    };

    // Helper to format date
    const formatDate = (isoString) => {
        if (!isoString) return 'Desconocido';
        return new Date(isoString).toLocaleString();
    };

    const getDeviceIcon = (userAgent) => {
        // Simple heuristic - backend usually doesn't send UserAgent in this specific SessionInfo schema yet 
        // but if we updated it we could. For now generic Monitor/Smartphone
        return <Monitor className="w-5 h-5 text-gray-400" />;
    };

    if (loading) {
        return (
            <div className="bg-[#212121] rounded-2xl shadow-sm border border-[#332122] p-6 animate-pulse">
                <div className="h-6 bg-[#332122] rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-16 bg-[#332122] rounded"></div>
                    <div className="h-16 bg-[#332122] rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#212121] rounded-2xl shadow-sm border border-[#332122] p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Shield className="text-[#b30c25]" size={20} />
                        Sesiones Activas
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Gestiona los dispositivos donde has iniciado sesión.
                    </p>
                </div>

                {sessions.length > 1 && (
                    <button
                        onClick={handleRevokeAll}
                        disabled={revokingAll}
                        className="mt-4 md:mt-0 flex items-center px-4 py-2 text-sm font-medium text-red-500 bg-[#2b1d1d] border border-red-900/30 rounded-lg hover:bg-red-900/10 transition-colors disabled:opacity-50"
                    >
                        {revokingAll ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Cerrar todas las sesiones
                    </button>
                )}
            </div>

            {sessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No tienes otras sesiones activas.
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#332122] bg-[#242223]/50 transition-all hover:bg-[#2a2829] ${session.is_current ? 'ring-1 ring-[#b30c25]/30' : ''}`}
                        >
                            <div className="flex items-start gap-4 mb-4 sm:mb-0">
                                <div className="p-3 bg-[#332122] rounded-full">
                                    {getDeviceIcon()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-white">
                                            Sesión {session.is_current ? '(Actual)' : ''}
                                        </h3>
                                        {session.status && (
                                            <span className="px-2 py-0.5 text-xs bg-green-900/30 text-green-400 rounded-full border border-green-900/50">
                                                Activa
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 flex flex-col gap-0.5">
                                        <span>Iniciado: {formatDate(session.created_at)}</span>
                                        <span>Expira: {formatDate(session.expires_at)}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {!session.is_current && (
                                    <button
                                        onClick={() => handleRevoke(session.id)}
                                        disabled={revokingId === session.id}
                                        className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-gray-300 bg-[#332122] hover:bg-[#402a2c] hover:text-white rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center"
                                    >
                                        {revokingId === session.id ? (
                                            <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                        ) : (
                                            "Cerrar Sesión"
                                        )}
                                    </button>
                                )}
                                {session.is_current && (
                                    <span className="text-xs text-gray-500 italic px-4">
                                        Dispositivo Actual
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActiveSessionsWidget;
