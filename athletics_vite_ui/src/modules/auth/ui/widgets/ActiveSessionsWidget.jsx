import React, { useEffect, useState } from 'react';
import { RefreshCw, Smartphone, Trash2, AlertTriangle, Monitor, Shield, Laptop } from 'lucide-react';
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
            background: '#1a1a1a',
            color: '#fff',
            customClass: {
                popup: 'dark:bg-[#1a1a1a] dark:text-white dark:border dark:border-[#332122]'
            }
        });

        if (!result.isConfirmed) return;

        setRevokingAll(true);
        try {
            const response = await authService.revokeAllSessions();
            if (response.success) {
                toast.success(response.message || 'Se revocaron todas las sesiones exitosamente');
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
        const ua = userAgent?.toLowerCase() || '';
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            return <Smartphone className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
        }
        return <Laptop className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <RefreshCw className="w-8 h-8 text-[#b30c25] animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-200 dark:border-[#332122] overflow-hidden transition-colors duration-300">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-[#332122] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-[#b30c25]" />
                        Sesiones Activas
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Gestiona los dispositivos donde tu cuenta está iniciada.
                    </p>
                </div>

                {sessions.length > 1 && (
                    <button
                        onClick={handleRevokeAll}
                        disabled={revokingAll}
                        className="
                            flex items-center gap-2 px-4 py-2 rounded-lg 
                            text-sm font-semibold text-red-600 dark:text-red-400 
                            bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 
                            transition-colors disabled:opacity-50
                        "
                    >
                        {revokingAll ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <AlertTriangle className="w-4 h-4" />
                        )}
                        Cerrar todas las demás
                    </button>
                )}
            </div>

            <div className="p-0">
                {sessions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No se encontraron sesiones activas.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-[#332122]">
                        {sessions.map((session) => (
                            <li key={session.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-[#212121] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                <div className="flex items-start gap-4">
                                    <div className="
                                        w-12 h-12 rounded-xl bg-gray-100 dark:bg-[#242223] 
                                        flex items-center justify-center shrink-0 
                                        border border-gray-200 dark:border-[#332122] group-hover:border-[#b30c25]/30
                                    ">
                                        {getDeviceIcon(session.user_agent)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-md" title={session.user_agent}>
                                                {session.user_agent ? (session.user_agent.length > 50 ? session.user_agent.substring(0, 50) + '...' : session.user_agent) : 'Dispositivo Desconocido'}
                                            </p>
                                            {session.is_current && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    Este dispositivo
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                            <span>
                                                <span className="font-semibold text-gray-700 dark:text-gray-300">IP:</span> {session.ip_address}
                                            </span>
                                            <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
                                            <span>
                                                <span className="font-semibold text-gray-700 dark:text-gray-300">Último acceso:</span> {formatDate(session.last_activity)}
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            Creada: {formatDate(session.created_at)}
                                        </p>
                                    </div>
                                </div>

                                {!session.is_current && (
                                    <button
                                        onClick={() => handleRevoke(session.id)}
                                        disabled={revokingId === session.id}
                                        className="
                                            flex items-center justify-center gap-2 px-4 py-2 rounded-lg ml-16 sm:ml-0
                                            text-sm font-medium text-gray-600 dark:text-gray-400 
                                            hover:text-red-600 dark:hover:text-white 
                                            hover:bg-red-50 dark:hover:bg-red-900/20 
                                            transition-all disabled:opacity-50
                                        "
                                        title="Cerrar sesión"
                                    >
                                        {revokingId === session.id ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" />
                                                <span className="sm:hidden">Cerrar Sesión</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ActiveSessionsWidget;
