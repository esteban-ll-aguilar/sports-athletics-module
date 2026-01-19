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
        <div className="min-h-screen bg-gray-900 text-white font-['Inter'] p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => navigate('/dashboard/entrenamientos')}
                        className="text-gray-400 hover:text-white flex items-center gap-2 w-fit"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Volver
                    </button>

                    <div className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-green-500 font-semibold uppercase tracking-wide">Sesión Activa</span>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-bold">{entrenamiento.tipo_entrenamiento}</h1>
                            <p className="text-gray-400 mt-2">{selectedHorario?.name} • {selectedHorario?.hora_inicio} - {selectedHorario?.hora_fin}</p>
                        </div>
                        <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-xl transition-colors border border-gray-700">
                            <span className="material-symbols-outlined">download</span>
                            Exportar Reporte
                        </button>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-blue-500">groups</span>
                            <p className="text-gray-400 text-sm uppercase font-semibold">Total Registrados</p>
                        </div>
                        <p className="text-4xl font-bold">{totalRoster}</p>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6 border border-green-700">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                            <p className="text-gray-400 text-sm uppercase font-semibold">Confirmados</p>
                        </div>
                        <p className="text-4xl font-bold text-green-500">{confirmados}</p>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6 border border-green-600">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-green-400">task_alt</span>
                            <p className="text-gray-400 text-sm uppercase font-semibold">Presentes</p>
                        </div>
                        <p className="text-4xl font-bold text-green-400">{presentes}</p>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6 border border-red-700">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-red-500">cancel</span>
                            <p className="text-gray-400 text-sm uppercase font-semibold">Ausentes</p>
                        </div>
                        <p className="text-4xl font-bold text-red-500">{totalRoster - presentes}</p>
                    </div>
                </div>

                {/* Horarios + Button */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex gap-3 flex-wrap">
                        {horarios.map(h => (
                            <button
                                key={h.id}
                                onClick={() => setSelectedHorario(h)}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all border ${selectedHorario?.id === h.id
                                    ? 'bg-green-600 border-green-500 text-white'
                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                                    }`}
                            >
                                {h.name || "Sin nombre"}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowInscribirModal(true)}
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                        <span className="material-symbols-outlined">person_add</span>
                        Inscribir Atleta
                    </button>
                </div>

                {/* Tabla */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-900 text-gray-400 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4 text-left">Información del Atleta</th>
                                    <th className="px-6 py-4 text-center">Confirmación Atleta</th>
                                    <th className="px-6 py-4 text-center">Hora Confirmación</th>
                                    <th className="px-6 py-4 text-center">Asistio al Entrenamiento</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {isEnrollmentLoading ? (
                                    <tr><td colSpan="5" className="p-12 text-center text-gray-400">
                                        <span className="material-symbols-outlined animate-spin text-3xl mb-2">refresh</span>
                                        <p>Cargando información...</p>
                                    </td></tr>
                                ) : inscritos.length === 0 ? (
                                    <tr><td colSpan="5" className="p-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <span className="material-symbols-outlined text-4xl mb-2 text-gray-600">group_off</span>
                                            <p>No hay atletas inscritos en este horario.</p>
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

                                        return (
                                            <tr key={registro.id} className="hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                            {atleta?.user?.first_name?.charAt(0) || "A"}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-100">
                                                                {atleta?.user?.first_name} {atleta?.user?.last_name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 font-medium">{atleta?.user?.identificacion}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Confirmación Atleta */}
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-${confColor}-600/20 text-${confColor}-400 border border-${confColor}-600/30`}>
                                                        <span className="material-symbols-outlined text-sm">{confIcon}</span>
                                                        {confText}
                                                    </span>
                                                </td>

                                                {/* Hora */}
                                                <td className="px-6 py-4 text-center text-gray-400 font-mono text-sm">
                                                    {horaConf}
                                                </td>

                                                {/* Estado Entrenador (Asistió) */}
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-${estadoColor}-600/20 text-${estadoColor}-400 border border-${estadoColor}-600/30`}>
                                                        <span className="material-symbols-outlined text-sm">{estadoIcon}</span>
                                                        {estadoText}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openHistory(registro)}
                                                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                                                            title="Ver Historial"
                                                        >
                                                            <span className="material-symbols-outlined">visibility</span>
                                                        </button>

                                                        {attended ? (
                                                            /* Si ya asistió, mostrar opción para marcar Ausente */
                                                            <button
                                                                onClick={() => handleMarcarAusente(asistencia)}
                                                                disabled={actionsDisabled}
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all"
                                                                title="Marcar Ausente"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">close</span>
                                                                Ausente
                                                            </button>
                                                        ) : (
                                                            /* Si NO asistió, mostrar opción para marcar Presente */
                                                            /* Constraint: Solo permitir si no ha rechazado explícitamente (atleta_confirmo !== false) */
                                                            <div className="relative group">
                                                                <button
                                                                    onClick={() => handlemarcarPresente(registro.id, asistencia)}
                                                                    disabled={actionsDisabled || (asistencia && asistencia.atleta_confirmo === false)}
                                                                    className={`inline-flex items-center gap-2 px-4 py-2 text-white rounded-xl font-semibold transition-all ${(asistencia && asistencia.atleta_confirmo === false)
                                                                        ? 'bg-gray-500 cursor-not-allowed opacity-50'
                                                                        : 'bg-green-600 hover:bg-green-700 disabled:opacity-50'
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
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-lg transition-all"
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
