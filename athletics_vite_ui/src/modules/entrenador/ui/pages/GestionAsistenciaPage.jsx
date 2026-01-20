import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import EntrenamientoService from '../../services/EntrenamientoService';
import AsistenciaService from '../../services/AsistenciaService';
import AtletaService from '../../../atleta/services/AtletaService';
import AsistenciaHistoryModal from '../components/AsistenciaHistoryModal';
import InscribirAtletaModal from '../components/InscribirAtletaModal';

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
        // FIX: Check STRICTLY for explicit true boolean
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
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Cargando...</div>
            </div>
        );
    }

    if (!entrenamiento) return null;

    // Calculate metrics
    const totalRoster = inscritos.length;
    const confirmados = inscritos.filter(r => getConfirmationStatus(r.asistencias)).length;
    const presentes = inscritos.filter(r => hasAttendedToday(r.asistencias)).length;

    return (
        <div className="min-h-screen bg-[#111] text-white font-['Lexend'] p-6 md:p-10 pb-20">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col gap-6">
                    <button
                        onClick={() => navigate('/dashboard/entrenamientos')}
                        className="text-gray-400 hover:text-white flex items-center gap-2 w-fit transition-colors group"
                    >
                        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        Volver
                    </button>

                    <div className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                        <span className="text-green-500 font-bold uppercase tracking-wider text-xs">Sesión Activa</span>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">{entrenamiento.tipo_entrenamiento}</h1>
                            <p className="text-gray-400 font-medium flex items-center gap-2">
                                <span className="bg-gray-800 text-white px-2 py-0.5 rounded text-xs uppercase">{selectedHorario?.name}</span>
                                {selectedHorario?.hora_inicio} - {selectedHorario?.hora_fin}
                            </p>
                        </div>
                        <button className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] px-6 py-3 rounded-xl transition-all border border-gray-800 hover:border-gray-700 text-sm font-bold text-gray-300">
                            <span className="material-symbols-outlined">download</span>
                            Exportar Reporte
                        </button>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800 shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <span className="material-symbols-outlined text-blue-500">groups</span>
                            </div>
                            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Total Registrados</p>
                        </div>
                        <p className="text-4xl font-bold text-white">{totalRoster}</p>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-1 h-full bg-green-500/50"></div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <span className="material-symbols-outlined text-green-500">check_circle</span>
                            </div>
                            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Confirmados</p>
                        </div>
                        <p className="text-4xl font-bold text-white">{confirmados}</p>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1 h-full bg-green-400"></div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-400/10 rounded-lg">
                                <span className="material-symbols-outlined text-green-400">task_alt</span>
                            </div>
                            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Presentes</p>
                        </div>
                        <p className="text-4xl font-bold text-white">{presentes}</p>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1 h-full bg-red-500"></div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <span className="material-symbols-outlined text-red-500">cancel</span>
                            </div>
                            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Ausentes</p>
                        </div>
                        <p className="text-4xl font-bold text-white">{totalRoster - presentes}</p>
                    </div>
                </div>

                {/* Horarios + Button */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-end border-b border-gray-800 pb-6">
                    <div className="flex gap-2 flex-wrap">
                        {horarios.map(h => (
                            <button
                                key={h.id}
                                onClick={() => setSelectedHorario(h)}
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${selectedHorario?.id === h.id
                                    ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                                    : 'bg-[#1a1a1a] border-gray-800 text-gray-500 hover:text-white hover:border-gray-600'
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
                        <span className="material-symbols-outlined">person_add</span>
                        Inscribir Atleta
                    </button>
                </div>

                {/* Tabla */}
                <div className="bg-[#1a1a1a] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl shadow-black/50">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#111] text-gray-500 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-5 text-left border-b border-gray-800">Información del Atleta</th>
                                    <th className="px-6 py-5 text-center border-b border-gray-800">Confirmación Atleta</th>
                                    <th className="px-6 py-5 text-center border-b border-gray-800">Hora Confirmación</th>
                                    <th className="px-6 py-5 text-center border-b border-gray-800">Estado Asistencia</th>
                                    <th className="px-6 py-5 text-right border-b border-gray-800">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {isEnrollmentLoading ? (
                                    <tr><td colSpan="5" className="p-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-gray-700 border-t-red-600 rounded-full animate-spin"></div>
                                            <p className="font-medium text-xs uppercase tracking-wide">Cargando...</p>
                                        </div>
                                    </td></tr>
                                ) : inscritos.length === 0 ? (
                                    <tr><td colSpan="5" className="p-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-3xl text-gray-600">group_off</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-white mb-1">Sin Inscripciones</p>
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
                                        let confIcon = "help";
                                        let horaConf = "-";

                                        if (asistencia) {
                                            if (asistencia.atleta_confirmo === true) {
                                                confText = "Confirmado";
                                                confColor = "green";
                                                confIcon = "check_circle";
                                            } else if (asistencia.atleta_confirmo === false) {
                                                confText = "No Asistirá";
                                                confColor = "red";
                                                confIcon = "cancel";
                                            }

                                            if (asistencia.fecha_confirmacion) {
                                                horaConf = new Date(asistencia.fecha_confirmacion).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit', minute: '2-digit'
                                                });
                                            }
                                        }

                                        // Lógica Estado (Entrenador)
                                        // Binary: Presente (Green) or Ausente (Red)
                                        let estadoText = "Ausente";
                                        let estadoColor = "red";
                                        let estadoIcon = "cancel";

                                        if (asistencia && asistencia.asistio) {
                                            estadoText = "Presente";
                                            estadoColor = "green";
                                            estadoIcon = "check_circle";
                                        }

                                        // Acciones
                                        const actionsDisabled = loading;

                                        /* Colores dinámicos para badges (Tailwind no permite interpolación completa segura en JIT si no está safelisted, mejor hardcodear clases o mapping) */
                                        const getBadgeClasses = (color) => {
                                            if (color === 'green') return "bg-green-500/10 text-green-500 border-green-500/20";
                                            if (color === 'red') return "bg-red-500/10 text-red-500 border-red-500/20";
                                            return "bg-gray-800 text-gray-400 border-gray-700";
                                        };

                                        return (
                                            <tr key={registro.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-white font-bold border border-gray-700 group-hover:border-gray-500 transition-colors">
                                                            {atleta?.user?.first_name?.charAt(0) || "A"}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white">
                                                                {atleta?.user?.first_name} {atleta?.user?.last_name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 font-medium tracking-wider">{atleta?.user?.identificacion}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Confirmación Atleta */}
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getBadgeClasses(confColor)}`}>
                                                        <span className="material-symbols-outlined text-sm">{confIcon}</span>
                                                        {confText}
                                                    </span>
                                                </td>

                                                {/* Hora */}
                                                <td className="px-6 py-4 text-center text-gray-500 font-mono text-xs">
                                                    {horaConf}
                                                </td>

                                                {/* Estado Entrenador (Asistió) */}
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getBadgeClasses(estadoColor)}`}>
                                                        <span className="material-symbols-outlined text-sm">{estadoIcon}</span>
                                                        {estadoText}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => openHistory(registro)}
                                                            className="p-2 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                                                            title="Ver Historial"
                                                        >
                                                            <span className="material-symbols-outlined">visibility</span>
                                                        </button>

                                                        {attended ? (
                                                            /* Si ya asistió, mostrar opción para marcar Ausente */
                                                            <button
                                                                onClick={() => handleMarcarAusente(asistencia)}
                                                                disabled={actionsDisabled}
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 rounded-lg font-bold text-xs uppercase tracking-wide transition-all"
                                                                title="Marcar Ausente"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">close</span>
                                                                Ausente
                                                            </button>
                                                        ) : (
                                                            /* Si NO asistió, mostrar opción para marcar Presente */
                                                            /* Constraint: Solo permitir si no ha rechazado explícitamente (atleta_confirmo !== false) */
                                                            <div className="relative group/btn">
                                                                <button
                                                                    onClick={() => handlemarcarPresente(registro.id, asistencia)}
                                                                    disabled={actionsDisabled || (asistencia && asistencia.atleta_confirmo === false)}
                                                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-all ${(asistencia && asistencia.atleta_confirmo === false)
                                                                        ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                                                                        : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-900/20'
                                                                        }`}
                                                                    title={asistencia && asistencia.atleta_confirmo === false ? "Atleta indicó que no asistirá" : "Marcar Presente"}
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">check</span>
                                                                    Asistió
                                                                </button>
                                                            </div>
                                                        )}

                                                        <button
                                                            onClick={() => handleEliminarInscripcion(registro.id)}
                                                            className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                            title="Eliminar Inscripción"
                                                        >
                                                            <span className="material-symbols-outlined">delete</span>
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
