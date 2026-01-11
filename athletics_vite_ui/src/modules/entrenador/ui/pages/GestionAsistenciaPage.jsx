import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import EntrenamientoService from '../../services/EntrenamientoService';
import AsistenciaService from '../../services/AsistenciaService';
import AtletaService from '../../../atleta/services/AtletaService';
import AsistenciaHistoryModal from '../components/AsistenciaHistoryModal';

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
                setAtletasDisponibles(Array.isArray(atletas) ? atletas : []); // Keep robust checking
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

    const handleInscribir = async (e) => {
        e.preventDefault();
        const atletaId = e.target.atletaId.value;
        if (!atletaId) return;

        try {
            await AsistenciaService.inscribirAtleta({
                horario_id: selectedHorario.id,
                atleta_id: parseInt(atletaId)
            });
            toast.success("Atleta inscrito correctamente");
            e.target.reset();
            loadInscritos(selectedHorario.id);
        } catch (error) {
            console.error("Error completo inscripción:", error);
            let msg = "Error al inscribir atleta";

            if (error.response && error.response.data && error.response.data.detail) {
                msg = error.response.data.detail;
                // If detail is array (validation error), take the first message
                if (Array.isArray(msg)) {
                    msg = msg.map(e => e.msg).join(', ');
                }
            } else if (error.message) {
                msg = error.message;
            }

            toast.error(String(msg));
        }
    };

    const handleMarcarAsistencia = async (registroId) => {
        try {
            const now = new Date();
            const timeString = now.toTimeString().split(' ')[0]; // HH:MM:SS
            const dateString = now.toISOString().split('T')[0];

            await AsistenciaService.registrarAsistencia({
                registro_asistencias_id: registroId,
                fecha_asistencia: dateString,
                hora_llegada: timeString,
                descripcion: "Asistencia registrada desde panel"
            });
            toast.success("Asistencia registrada para hoy");
            // Reload data to update UI (show green status)
            loadInscritos(selectedHorario.id);
        } catch (error) {
            console.error(error);
            toast.error("Error al registrar asistencia");
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
        return asistencias.some(a => a.fecha_asistencia === today);
    };

    if (loading) {
        return <div className="p-10 text-center">Cargando...</div>;
    }

    if (!entrenamiento) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-['Lexend']">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <button onClick={() => navigate('/dashboard/entrenamientos')} className="mb-4 text-gray-500 hover:text-gray-900 flex items-center gap-2">
                            <span className="material-symbols-outlined">arrow_back</span>
                            Volver
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">{entrenamiento.tipo_entrenamiento}</h1>
                        <p className="text-gray-500 mt-2">{entrenamiento.descripcion}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl text-sm font-semibold border border-blue-100">
                        <span className="material-symbols-outlined text-xl">calendar_month</span>
                        {entrenamiento.fecha_entrenamiento}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar: Horarios */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 px-2 lg:mb-6">Horarios</h2>
                        <div className="flex flex-col gap-3">
                            {horarios.length === 0 && <p className="text-gray-400 px-2">No hay horarios definidos.</p>}
                            {horarios.map(h => (
                                <button
                                    key={h.id}
                                    onClick={() => setSelectedHorario(h)}
                                    className={`p-4 rounded-2xl text-left transition-all duration-200 border relative overflow-hidden group ${selectedHorario?.id === h.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 border-blue-600 scale-105'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                                        }`}
                                >
                                    <div className="font-bold text-lg relative z-10">{h.name || "Sin nombre"}</div>
                                    <div className={`flex items-center gap-2 text-sm mt-1 relative z-10 ${selectedHorario?.id === h.id ? 'opacity-90' : 'text-gray-400'}`}>
                                        <span className="material-symbols-outlined text-sm">schedule</span>
                                        {h.hora_inicio} - {h.hora_fin}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content: Enrollment & Attendance */}
                    <div className="lg:col-span-3">
                        {selectedHorario ? (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
                                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Gestión de Asistencia</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            <p className="text-sm text-gray-500 font-medium">Horario Activo: {selectedHorario.hora_inicio} - {selectedHorario.hora_fin}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 w-full sm:w-auto">
                                        <form onSubmit={handleInscribir} className="flex gap-2">
                                            <select
                                                name="atletaId"
                                                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none"
                                                required
                                            >
                                                <option value="">Seleccionar Atleta...</option>
                                                {atletasDisponibles.map(atleta => (
                                                    <option key={atleta.id} value={atleta.id}>
                                                        {atleta.user?.first_name} {atleta.user?.last_name} ({atleta.user?.identificacion})
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="submit"
                                                className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 transition-colors whitespace-nowrap"
                                            >
                                                + Inscribir
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">Atleta</th>
                                                <th className="px-6 py-4 text-center">Estado Hoy</th>
                                                <th className="px-6 py-4 text-end">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {isEnrollmentLoading ? (
                                                <tr><td colSpan="3" className="p-12 text-center text-gray-400">
                                                    <span className="material-symbols-outlined animate-spin text-3xl mb-2">refresh</span>
                                                    <p>Cargando información...</p>
                                                </td></tr>
                                            ) : inscritos.length === 0 ? (
                                                <tr><td colSpan="3" className="p-12 text-center text-gray-400">
                                                    <div className="flex flex-col items-center">
                                                        <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">group_off</span>
                                                        <p>No hay atletas inscritos en este horario.</p>
                                                    </div>
                                                </td></tr>
                                            ) : (
                                                inscritos.map(registro => {
                                                    const attended = hasAttendedToday(registro.asistencias);
                                                    return (
                                                        <tr key={registro.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                                        {registro.atleta?.user?.first_name?.charAt(0) || "A"}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-semibold text-gray-900">
                                                                            {registro.atleta?.user?.first_name} {registro.atleta?.user?.last_name}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 font-medium">{registro.atleta?.user?.identificacion}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                {attended ? (
                                                                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 shadow-sm">
                                                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                                                        Asistió
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                                                                        <span className="material-symbols-outlined text-sm">pending</span>
                                                                        Pendiente
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => openHistory(registro)}
                                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                        title="Ver Historial"
                                                                    >
                                                                        <span className="material-symbols-outlined">visibility</span>
                                                                    </button>

                                                                    {!attended && (
                                                                        <button
                                                                            onClick={() => handleMarcarAsistencia(registro.id)}
                                                                            className="group relative inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-green-500 hover:text-green-600 hover:shadow-md transition-all shadow-sm"
                                                                            title="Marcar Asistencia Hoy"
                                                                        >
                                                                            <span className="material-symbols-outlined text-gray-400 group-hover:text-green-500 transition-colors">check</span>
                                                                            <span className="text-sm font-semibold text-gray-600 group-hover:text-green-600">Presente</span>
                                                                        </button>
                                                                    )}
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
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-10 bg-white rounded-3xl border border-gray-100 border-dashed">
                                <span className="material-symbols-outlined text-6xl mb-4 text-gray-200">schedule</span>
                                <p className="text-lg font-medium">Selecciona un horario</p>
                                <p className="text-sm">para gestionar la asistencia de los atletas</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* History Modal */}
            <AsistenciaHistoryModal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                atletaName={selectedHistoryAthlete ? `${selectedHistoryAthlete.atleta?.user?.first_name} ${selectedHistoryAthlete.atleta?.user?.last_name}` : ''}
                asistencias={selectedHistoryAthlete?.asistencias || []}
            />

        </div>
    );
};

export default GestionAsistenciaPage;
