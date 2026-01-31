import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import EntrenamientoService from '../../services/EntrenamientoService';
import AsistenciaService from '../../services/AsistenciaService';
import AtletaService from '../../../atleta/services/AtletaService';
import AsistenciaHistoryModal from '../components/AsistenciaHistoryModal';
import InscribirAtletaModal from '../components/InscribirAtletaModal';
import {
    ArrowLeft, Download, Users, CheckCircle, Clock, XCircle,
    Calendar, UserPlus, Trash2, Eye, Check, X, AlertCircle,
    User
} from 'lucide-react';

const GestionAsistenciaPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State
    const [entrenamiento, setEntrenamiento] = useState(null);
    const [horarios, setHorarios] = useState([]);
    const [selectedHorario, setSelectedHorario] = useState(null);

    // Asistencia & Enrollment
    const [inscritos, setInscritos] = useState([]);
    const [atletasDisponibles, setAtletasDisponibles] = useState([]);
    const [isEnrollmentLoading, setIsEnrollmentLoading] = useState(false);

    const [loading, setLoading] = useState(true);

    // Modal State
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedHistoryAthlete, setSelectedHistoryAthlete] = useState(null);
    const [showInscribirModal, setShowInscribirModal] = useState(false);

    // Initial Load
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Load Training details (includes horarios)
                const entData = await EntrenamientoService.getById(id);
                setEntrenamiento(entData);
                setHorarios(entData.horarios || []);

                // Select first horario by default if exists
                if (entData.horarios && entData.horarios.length > 0) {
                    setSelectedHorario(entData.horarios[0]);
                }

                // Pre-load athletes for dropdown
                const atletas = await AtletaService.getAll();
                setAtletasDisponibles(Array.isArray(atletas) ? atletas : []);
            } catch (error) {
                console.error(error);
                toast.error("Error al cargar datos del entrenamiento");
                navigate('/dashboard/entrenamientos');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, navigate]);

    // Load Enrollment when Horario changes
    useEffect(() => {
        if (selectedHorario) {
            loadInscritos(selectedHorario.id);
        }
    }, [selectedHorario]);

    const loadInscritos = async (horarioId) => {
        setIsEnrollmentLoading(true);
        try {
            const data = await AsistenciaService.listarInscritos(horarioId);
            setInscritos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar inscritos");
        } finally {
            setIsEnrollmentLoading(false);
        }
    };

    const handleInscribir = async (atletaId) => {
        if (!atletaId) return;

        try {
            setIsEnrollmentLoading(true);
            await AsistenciaService.inscribirAtleta({
                horario_id: selectedHorario.id,
                atleta_id: parseInt(atletaId)
            });
            toast.success("Atleta inscrito correctamente");
            setShowInscribirModal(false);
            loadInscritos(selectedHorario.id);
        } catch (error) {
            console.error("Error completo inscripción:", error);
            let msg = "Error al inscribir atleta";

            if (error.response && error.response.data && error.response.data.detail) {
                msg = error.response.data.detail;
                if (Array.isArray(msg)) {
                    msg = msg.map(e => e.msg).join(', ');
                }
            } else if (error.message) {
                msg = error.message;
            }

            toast.error(String(msg));
        } finally {
            setIsEnrollmentLoading(false);
        }
    };

    const handleEliminarInscripcion = async (registroId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar a este atleta del horario?")) return;

        try {
            await AsistenciaService.eliminarInscripcion(registroId);
            toast.success("Atleta eliminado del horario");
            loadInscritos(selectedHorario.id);
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar inscripción");
        }
    };


    const handleMarcarAusente = async (asistencia) => {
        if (!asistencia) return;

        try {
            await AsistenciaService.marcarAusente(asistencia.id);
            toast.success("Atleta marcado como Ausente");
            loadInscritos(selectedHorario.id);
        } catch (error) {
            console.error(error);
            toast.error("Error al marcar como ausente");
        }
    };

    const handlemarcarPresente = async (registroId, asistencia) => {
        try {
            if (asistencia) {
                // Si existe registro, usamos marcarPresente
                await AsistenciaService.marcarPresente(asistencia.id);
            } else {
                // Si no existe, creamos uno nuevo con asistio=true
                const now = new Date();
                const timeString = now.toTimeString().split(' ')[0];
                const dateString = now.toISOString().split('T')[0];

                await AsistenciaService.registrarAsistencia({
                    registro_asistencias_id: registroId,
                    fecha_asistencia: dateString,
                    hora_llegada: timeString,
                    descripcion: "Asistencia registrada desde panel",
                    asistio: true
                });
            }
            toast.success("Atleta marcado como Presente");
            loadInscritos(selectedHorario.id);
        } catch (error) {
            console.error(error);
            toast.error("Error al marcar como presente");
        }
    };

    const openHistory = (registro) => {
        setSelectedHistoryAthlete(registro);
        setHistoryModalOpen(true);
    };

    // Helper to check if attended today
    const hasAttendedToday = (asistencias) => {
        if (!asistencias || asistencias.length === 0) return false;
        const today = new Date().toISOString().split('T')[0];
        return asistencias.some(a => a.fecha_asistencia === today && a.asistio === true);
    };

    // Get confirmation status
    const getConfirmationStatus = (asistencias) => {
        if (!asistencias || asistencias.length === 0) return null;
        const today = new Date().toISOString().split('T')[0];
        return asistencias.find(a => a.fecha_asistencia === today && a.fecha_confirmacion);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-[#b30c25] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Cargando gestión...</span>
                </div>
            </div>
        );
    }

    if (!entrenamiento) return null;

    // Calculate metrics
    const totalRoster = inscritos.length;
    const confirmados = inscritos.filter(r => getConfirmationStatus(r.asistencias)).length;
    const presentes = inscritos.filter(r => hasAttendedToday(r.asistencias)).length;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 font-['Lexend'] p-6 md:p-10 pb-20 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Top Navigation & Info */}
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => navigate('/dashboard/entrenamientos')}
                            className="text-gray-500 dark:text-gray-400 hover:text-[#b30c25] hover:dark:text-white flex items-center gap-2 w-fit transition-colors group px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#212121]"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="font-semibold">Volver</span>
                        </button>
                    </div>


                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-[#212121] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#332122]">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                                <span className="text-green-600 dark:text-green-500 font-bold uppercase tracking-wider text-xs">Sesión Activa</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                                {entrenamiento.tipo_entrenamiento}
                            </h1>
                            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 font-medium text-sm">
                                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                                    <Clock size={16} />
                                    {selectedHorario?.name}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    {selectedHorario?.hora_inicio} - {selectedHorario?.hora_fin}
                                </span>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 bg-white dark:bg-[#2a2829] border border-gray-200 dark:border-[#332122] hover:bg-gray-50 dark:hover:bg-[#332122] text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-xl transition-all text-sm font-bold shadow-sm">
                            <Download size={18} />
                            Exportar Reporte
                        </button>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total */}
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#332122] shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Total Registrados</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{totalRoster}</p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-blue-600 dark:text-blue-500">
                            <Users size={24} />
                        </div>
                    </div>

                    {/* Confirmados */}
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#332122] shadow-sm flex items-center justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1 h-full bg-green-500"></div>
                        <div>
                            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Confirmados</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{confirmados}</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-xl text-green-600 dark:text-green-500">
                            <CheckCircle size={24} />
                        </div>
                    </div>

                    {/* Presentes */}
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#332122] shadow-sm flex items-center justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1 h-full bg-green-400"></div>
                        <div>
                            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Presentes</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{presentes}</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-400/10 rounded-xl text-green-500 dark:text-green-400">
                            <Check size={24} />
                        </div>
                    </div>

                    {/* Ausentes */}
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#332122] shadow-sm flex items-center justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1 h-full bg-red-500"></div>
                        <div>
                            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Ausentes</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{totalRoster - presentes}</p>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl text-red-600 dark:text-red-500">
                            <XCircle size={24} />
                        </div>
                    </div>
                </div>

                {/* Horarios + Button */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-end border-b border-gray-200 dark:border-[#332122] pb-6">
                    <div className="flex gap-2 flex-wrap">
                        {horarios.map(h => (
                            <button
                                key={h.id}
                                onClick={() => setSelectedHorario(h)}
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${selectedHorario?.id === h.id
                                    ? 'bg-[#b30c25] text-white border-[#b30c25] shadow-md shadow-red-900/20'
                                    : 'bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#332122] text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                {h.name || "Sin nombre"}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowInscribirModal(true)}
                        className="flex items-center justify-center gap-2 bg-[#E50914] hover:bg-[#b00710] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-900/20 text-sm uppercase tracking-wide hover:scale-105 active:scale-95"
                    >
                        <UserPlus size={18} />
                        Inscribir Atleta
                    </button>
                </div>

                {/* Tabla */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#332122] overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-[#111] text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider border-b border-gray-200 dark:border-[#332122]">
                                <tr>
                                    <th className="px-6 py-5 text-left">Información del Atleta</th>
                                    <th className="px-6 py-5 text-center">Confirmación Atleta</th>
                                    <th className="px-6 py-5 text-center">Hora Confirmación</th>
                                    <th className="px-6 py-5 text-center">Estado Asistencia</th>
                                    <th className="px-6 py-5 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-[#332122]">
                                {isEnrollmentLoading ? (
                                    <tr><td colSpan="5" className="p-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-[#b30c25] border-t-transparent rounded-full animate-spin"></div>
                                            <p className="font-medium text-xs uppercase tracking-wide">Cargando inscritos...</p>
                                        </div>
                                    </td></tr>
                                ) : inscritos.length === 0 ? (
                                    <tr><td colSpan="5" className="p-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                <Users size={32} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white mb-1">Sin Inscripciones</p>
                                                <p className="text-xs">No hay atletas inscritos en este horario.</p>
                                            </div>
                                        </div>
                                    </td></tr>
                                ) : (
                                    inscritos.map(registro => {
                                        // Obtener asistencia de HOY
                                        const today = new Date().toISOString().split('T')[0];
                                        const asistencia = registro.asistencias?.find(a => a.fecha_asistencia === today);
                                        const atleta = registro.atleta;

                                        // Definir attended para usar en la columna de acciones
                                        const attended = hasAttendedToday(registro.asistencias);

                                        // Lógica Confirmación (Atleta)
                                        let confText = "Sin Respuesta";
                                        let confColor = "gray";
                                        let confIcon = AlertCircle;
                                        let horaConf = "-";

                                        if (asistencia) {
                                            if (asistencia.atleta_confirmo === true) {
                                                confText = "Confirmado";
                                                confColor = "green";
                                                confIcon = CheckCircle;
                                            } else if (asistencia.atleta_confirmo === false) {
                                                confText = "No Asistirá";
                                                confColor = "red";
                                                confIcon = XCircle;
                                            }

                                            if (asistencia.fecha_confirmacion) {
                                                horaConf = new Date(asistencia.fecha_confirmacion).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit', minute: '2-digit'
                                                });
                                            }
                                        }

                                        // Lógica Estado (Entrenador)
                                        let estadoText = "Ausente";
                                        let estadoColor = "red";
                                        let estadoIcon = XCircle;

                                        if (asistencia && asistencia.asistio) {
                                            estadoText = "Presente";
                                            estadoColor = "green";
                                            estadoIcon = CheckCircle;
                                        }

                                        // Acciones
                                        const actionsDisabled = loading;

                                        /* Estilos dinámicos para badges */
                                        const getBadgeStyles = (color) => {
                                            if (color === 'green') return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-500 dark:border-green-900/30";
                                            if (color === 'red') return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-500 dark:border-red-900/30";
                                            return "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
                                        };

                                        return (
                                            <tr key={registro.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2829] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-gray-600 dark:text-white font-bold border border-gray-200 dark:border-gray-700 shadow-sm">
                                                            {atleta?.user?.first_name?.charAt(0) || "A"}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                                {atleta?.user?.first_name} {atleta?.user?.last_name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wider flex items-center gap-1">
                                                                <User size={10} />
                                                                {atleta?.user?.identificacion}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Confirmación Atleta */}
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getBadgeStyles(confColor)}`}>
                                                        <confIcon size={14} />
                                                        {confText}
                                                    </span>
                                                </td>

                                                {/* Hora */}
                                                <td className="px-6 py-4 text-center text-gray-500 font-mono text-xs">
                                                    {horaConf}
                                                </td>

                                                {/* Estado Entrenador (Asistió) */}
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getBadgeStyles(estadoColor)}`}>
                                                        <estadoIcon size={14} />
                                                        {estadoText}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => openHistory(registro)}
                                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-white dark:hover:bg-gray-700 rounded-lg transition-all"
                                                            title="Ver Historial"
                                                        >
                                                            <Eye size={18} />
                                                        </button>

                                                        {attended ? (
                                                            <button
                                                                onClick={() => handleMarcarAusente(asistencia)}
                                                                disabled={actionsDisabled}
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 rounded-lg font-bold text-xs uppercase tracking-wide transition-all
                                                                dark:bg-red-500/10 dark:text-red-500 dark:hover:bg-red-500 dark:hover:text-white dark:border-red-500/20"
                                                                title="Marcar Ausente"
                                                            >
                                                                <X size={14} />
                                                                Ausente
                                                            </button>
                                                        ) : (
                                                            <div className="relative group/btn">
                                                                <button
                                                                    onClick={() => handlemarcarPresente(registro.id, asistencia)}
                                                                    disabled={actionsDisabled || (asistencia && asistencia.atleta_confirmo === false)}
                                                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-all ${(asistencia && asistencia.atleta_confirmo === false)
                                                                        ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700'
                                                                        : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20'
                                                                        }`}
                                                                    title={asistencia && asistencia.atleta_confirmo === false ? "Atleta indicó que no asistirá" : "Marcar Presente"}
                                                                >
                                                                    <Check size={14} />
                                                                    Asistió
                                                                </button>
                                                            </div>
                                                        )}

                                                        <button
                                                            onClick={() => handleEliminarInscripcion(registro.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                            title="Eliminar Inscripción"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


            </div>

            {/* Modals */}
            <AsistenciaHistoryModal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                atletaName={selectedHistoryAthlete ? `${selectedHistoryAthlete.atleta?.user?.first_name} ${selectedHistoryAthlete.atleta?.user?.last_name}` : ''}
                asistencias={selectedHistoryAthlete?.asistencias || []}
            />

            <InscribirAtletaModal
                show={showInscribirModal}
                onClose={() => setShowInscribirModal(false)}
                atletasDisponibles={atletasDisponibles}
                onInscribir={handleInscribir}
                loading={isEnrollmentLoading}
            />
        </div>
    );
};

export default GestionAsistenciaPage;
