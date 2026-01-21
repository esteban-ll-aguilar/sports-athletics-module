import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AsistenciaService from '../../../entrenador/services/AsistenciaService';
import authService from '../../../auth/services/auth_service';
import gymHero from '../../../../assets/images/gym_hero.jpg';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const ConfirmacionEntrenamientoPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [registro, setRegistro] = useState([]); // Store array of records
    const [recordIndex, setRecorIndex] = useState(0); // Current view index
    const [confirmando, setConfirmando] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [teamStats, setTeamStats] = useState({ loading: false, count: 0, avatars: [] });
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'

    useEffect(() => {
        if (registro && registro.length > 0) {
            setViewMode('list');
        }
    }, [registro]);

    // Helper to get selected record
    const currentRegistro = (registro && registro.length > 0) ? registro[recordIndex] : null;

    useEffect(() => {
        const loadTeamStats = async () => {
            if (!currentRegistro?.horario?.id) return;

            setTeamStats(prev => ({ ...prev, loading: true }));
            try {
                // Fetch enrolled athletes for this schedule
                const inscritos = await AsistenciaService.listarInscritos(currentRegistro.horario.id);

                if (Array.isArray(inscritos)) {
                    // Filter confirmed
                    const confirmed = inscritos.filter(r => {
                        const today = currentRegistro.horario.entrenamiento.fecha_entrenamiento;
                        const asistencia = r.asistencias?.find(a => a.fecha_asistencia === today);
                        return asistencia?.atleta_confirmo === true;
                    });

                    // Get avatars (first 4)
                    const avatars = confirmed.slice(0, 4).map(c => c.atleta.user.first_name.charAt(0));

                    setTeamStats({
                        loading: false,
                        count: Math.max(0, confirmed.length - 4), // Count existing beyond the 4 shown
                        avatars: avatars
                    });
                }
            } catch (error) {
                console.error("Error loading team stats", error);
                setTeamStats(prev => ({ ...prev, loading: false }));
            }
        };

        loadTeamStats();
    }, [currentRegistro]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // 1. Get Profile
                const response = await authService.getProfile();
                const profile = response.data || response;
                setUserProfile(profile);

                if (!profile.atleta) {
                    toast.error("No se encontró perfil de atleta asociado.");
                    return;
                }

                // 2. Fetch mis registros
                const registros = await AsistenciaService.obtenerMisRegistros(profile.atleta.id);

                if (registros && registros.length > 0) {
                    // Sort by Date + Time
                    const sorted = registros.sort((a, b) => {
                        const dateA = new Date(`${a.horario.entrenamiento.fecha_entrenamiento}T${a.horario.hora_inicio}`);
                        const dateB = new Date(`${b.horario.entrenamiento.fecha_entrenamiento}T${b.horario.hora_inicio}`);
                        return dateA - dateB;
                    });

                    // Find first upcoming or default to 0
                    const now = new Date();
                    const properIndex = sorted.findIndex(r => {
                        const end = new Date(`${r.horario.entrenamiento.fecha_entrenamiento}T${r.horario.hora_fin}`);
                        return end >= now;
                    });

                    setRegistro(sorted);
                    setRecorIndex(properIndex >= 0 ? properIndex : 0);
                } else {
                    setRegistro([]);
                    setRecorIndex(0);
                }

            } catch (error) {
                console.error(error);
                toast.error("Error al cargar la información");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [navigate]);

    const nextRecord = () => {
        if (registro && recordIndex < registro.length - 1) setRecorIndex(prev => prev + 1);
    };

    const prevRecord = () => {
        if (registro && recordIndex > 0) setRecorIndex(prev => prev - 1);
    };

    const handleConfirmar = async () => {
        if (!currentRegistro) return;
        try {
            setConfirmando(true);
            const fechaEntrenamiento = currentRegistro.horario.entrenamiento.fecha_entrenamiento;

            await AsistenciaService.confirmarAsistencia(currentRegistro.id, fechaEntrenamiento);
            toast.success("¡Asistencia confirmada!");

            // Reload and maintain position
            const updatedResponse = await AsistenciaService.obtenerMisRegistros(userProfile.atleta.id);
            const updated = updatedResponse;

            if (updated && updated.length > 0) {
                const sorted = updated.sort((a, b) => {
                    const dateA = new Date(`${a.horario.entrenamiento.fecha_entrenamiento}T${a.horario.hora_inicio}`);
                    const dateB = new Date(`${b.horario.entrenamiento.fecha_entrenamiento}T${b.horario.hora_inicio}`);
                    return dateA - dateB;
                });
                setRegistro(sorted);

                // Try to keep looking at the same ID
                const sameIdIndex = sorted.findIndex(r => r.id === currentRegistro.id);
                if (sameIdIndex >= 0) setRecorIndex(sameIdIndex);
            }

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.detail || "Ya has confirmado o hay un error");
        } finally {
            setConfirmando(false);
        }
    };



    if (loading) {
        return (
            <div className="min-h-screen bg-[#111] flex items-center justify-center font-['Inter']">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-4xl text-red-600 animate-spin">refresh</span>
                    <p className="text-gray-400">Cargando tu próximo entrenamiento...</p>
                </div>
            </div>
        );
    }

    if (!currentRegistro) {
        return (
            <div className="min-h-screen bg-[#111] text-white p-6 font-['Inter'] flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-gray-500">calendar_today</span>
                    </div>
                    <h2 className="text-2xl font-bold">Sin entrenamientos programados</h2>
                    <p className="text-gray-400">No tienes sesiones próximas asignadas. Consulta con tu entrenador.</p>
                    <button onClick={() => navigate('/dashboard')} className="text-red-500 font-semibold hover:text-red-400 mt-4 inline-block">
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Unpack Data for Current View
    const entrenamiento = currentRegistro.horario?.entrenamiento || {};
    const horario = currentRegistro.horario || {};
    const entrenador = entrenamiento.entrenador?.user || {};
    const asistencias = currentRegistro.asistencias || [];

    // --- Statistics & Status (Per Enrollment) ---
    const trainingDateStr = entrenamiento.fecha_entrenamiento?.toString();

    // Check status
    const asistenciaRecord = asistencias.find(a => a.fecha_asistencia === trainingDateStr && a.fecha_confirmacion);
    const isConfirmed = asistenciaRecord?.atleta_confirmo === true;
    const isRejected = asistenciaRecord?.atleta_confirmo === false;

    // Coach Info
    const coachName = entrenador.first_name ? `${entrenador.first_name} ${entrenador.last_name}` : "Entrenador";
    const coachImage = entrenador.profile_image
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${entrenador.profile_image}`
        : `https://ui-avatars.com/api/?name=${coachName}&background=random`;

    // ... Date Formats (omitted for brevity in replacement, focusing on changes) ...
    // Note: Re-injecting Date Formats to ensure context validity if replacing large chunk.
    let formattedDateCap = "Fecha no disponible";
    if (trainingDateStr) {
        const [year, month, day] = trainingDateStr.split('-');
        const activeDate = new Date(Date.UTC(year, month - 1, day + 1));
        const fDate = format(activeDate, "EEEE, d 'de' MMMM", { locale: es });
        formattedDateCap = fDate.charAt(0).toUpperCase() + fDate.slice(1);
    }

    const formatTime = (timeStr) => {
        if (!timeStr) return "-";
        return timeStr.substring(0, 5);
    };

    const hasNext = registro && recordIndex < registro.length - 1;
    const hasPrev = registro && recordIndex > 0;

    const handleRechazar = async () => {
        if (!currentRegistro) return;
        try {
            const fechaEntrenamiento = currentRegistro.horario.entrenamiento.fecha_entrenamiento;

            await AsistenciaService.rechazarAsistencia(currentRegistro.id, fechaEntrenamiento);
            toast.success("Has indicado que no asistirás. El entrenador será notificado.");

            // Reload data
            const updatedResponse = await AsistenciaService.obtenerMisRegistros(userProfile.atleta.id);
            const updated = updatedResponse;

            if (updated && updated.length > 0) {
                const sorted = updated.sort((a, b) => {
                    const dateA = new Date(`${a.horario.entrenamiento.fecha_entrenamiento}T${a.horario.hora_inicio}`);
                    const dateB = new Date(`${b.horario.entrenamiento.fecha_entrenamiento}T${b.horario.hora_inicio}`);
                    return dateA - dateB;
                });
                setRegistro(sorted);
                const sameIdIndex = sorted.findIndex(r => r.id === currentRegistro.id);
                if (sameIdIndex >= 0) setRecorIndex(sameIdIndex);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.detail || "Error al rechazar asistencia");
        }
    };



    // ... existing helpers ...

    // Toggle View
    const selectSession = (index) => {
        setRecorIndex(index);
        setViewMode('detail');
    };

    const backToList = () => {
        setViewMode('list');
    };

    // Render List View
    const renderListView = () => {
        if (!registro || registro.length === 0) return null; // Should be handled by empty state check above if primary, but safe guard

        return (
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Próximos Entrenamientos</h1>
                    <p className="text-gray-400">Selecciona una sesión para ver detalles o confirmar asistencia.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {registro.map((reg, index) => {
                        const ent = reg.horario?.entrenamiento || {};
                        const hor = reg.horario || {};
                        const coach = ent.entrenador?.user || {};
                        const asist = reg.asistencias?.find(a => a.fecha_asistencia === ent.fecha_entrenamiento);

                        // Status
                        const confirmed = asist?.atleta_confirmo === true;
                        const rejected = asist?.atleta_confirmo === false;

                        // Date formatting
                        const [year, month, day] = ent.fecha_entrenamiento.split('-');
                        const dateObj = new Date(Date.UTC(year, month - 1, day + 1));
                        const dayName = format(dateObj, "EEEE", { locale: es });
                        const dateStr = format(dateObj, "d 'de' MMMM", { locale: es });

                        return (
                            <div
                                key={reg.id}
                                onClick={() => selectSession(index)}
                                className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800 hover:border-gray-600 hover:bg-[#222] transition-all cursor-pointer group relative overflow-hidden"
                            >
                                {/* Status Stripe */}
                                <div className={`absolute top-0 left-0 w-1 h-full ${confirmed ? 'bg-green-500' : rejected ? 'bg-red-500' : 'bg-gray-700'}`}></div>

                                <div className="pl-3">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{dayName}</span>
                                            <span className="text-xl font-bold text-white capitalize">{dateStr}</span>
                                        </div>
                                        {confirmed ? (
                                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                                        ) : rejected ? (
                                            <span className="material-symbols-outlined text-red-500">cancel</span>
                                        ) : (
                                            <span className="material-symbols-outlined text-gray-600 group-hover:text-white transition-colors">chevron_right</span>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">{ent.tipo_entrenamiento || "Entrenamiento"}</h3>

                                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                                        <span className="material-symbols-outlined text-base">schedule</span>
                                        {formatTime(hor.hora_inicio)} - {formatTime(hor.hora_fin)}
                                    </div>

                                    <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                            {coach.profile_image ? (
                                                <img src={`${import.meta.env.VITE_API_URL}/${coach.profile_image}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold">{coach.first_name?.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="text-sm">
                                            <p className="text-gray-300 font-medium">{coach.first_name || "Entrenador"}</p>
                                            <p className="text-gray-500 text-xs">Coach</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#111] text-white font-['Inter'] pb-12">
            {/* Header / Breadcrumb */}
            <div className="border-b border-gray-800 bg-[#111] sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="hover:text-white cursor-pointer" onClick={() => navigate('/dashboard')}>Inicio</span>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <span
                            className={`cursor-pointer ${viewMode === 'list' ? 'text-white font-medium' : 'hover:text-white'}`}
                            onClick={backToList}
                        >
                            Mis Horarios
                        </span>
                        {viewMode === 'detail' && (
                            <>
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                                <span className="text-white font-medium">Detalle</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {viewMode === 'list' ? renderListView() : (
                <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
                    <button
                        onClick={backToList}
                        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Volver a la lista
                    </button>

                    {/* Copied Detail View Content */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-3 ${isConfirmed ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                isRejected ? 'bg-gray-700/50 border-gray-600 text-gray-400' :
                                    'bg-red-500/10 border-red-500/20 text-red-500'
                                }`}>
                                <span className={`w-2 h-2 rounded-full ${isConfirmed ? 'bg-green-500' :
                                    isRejected ? 'bg-gray-500' :
                                        'bg-red-500 animate-pulse'
                                    }`}></span>
                                {isConfirmed ? 'Listo para entrenar' : isRejected ? 'No asistirás' : 'Acción Requerida'}
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Tu Horario</h1>
                            <p className="text-gray-400">Detalles de tu sesión programada.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Main Card */}
                        <div className="xl:col-span-2">
                            <div className="bg-[#1a1a1a] rounded-4xl overflow-hidden border border-gray-800 shadow-2xl relative group transition-all duration-300">

                                {/* Hero Section */}
                                <div className="relative h-[500px] lg:h-[400px] flex flex-col lg:flex-row">
                                    {/* Image Half */}
                                    <div className="lg:w-5/12 relative h-64 lg:h-full overflow-hidden">
                                        <div className="absolute top-4 left-4 z-20">
                                            <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                                                {horario.name || "Entrenamiento"}
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 bg-gray-900/20 z-10"></div>
                                        <img
                                            src={gymHero}
                                            alt="Gym"
                                            className={`w-full h-full object-cover transform transition-transform duration-700 ${isRejected ? 'grayscale' : 'group-hover:scale-105'}`}
                                        />
                                    </div>

                                    {/* Info Half */}
                                    <div className="lg:w-7/12 p-8 lg:p-10 flex flex-col justify-between relative bg-linear-to-b from-[#1a1a1a] to-[#151515]">

                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <p className="text-red-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">Tipo de Entrenamiento</p>
                                                    <h2 className="text-3xl lg:text-3xl font-bold leading-tight text-white mb-2">
                                                        {entrenamiento.tipo_entrenamiento || "Sesión General"}
                                                    </h2>
                                                    {entrenamiento.descripcion && (
                                                        <p className="text-gray-400 text-sm italic line-clamp-2">{entrenamiento.descripcion}</p>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-gray-700 to-gray-600 flex items-center justify-center p-[2px] mb-1 overflow-hidden">
                                                        <img src={coachImage} className="w-full h-full object-cover rounded-full" alt="Coach" />
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-medium text-center leading-tight max-w-[80px]">{coachName}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                                                <div>
                                                    <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs font-bold uppercase tracking-wide">
                                                        <span className="material-symbols-outlined text-lg">calendar_month</span>
                                                        Fecha
                                                    </div>
                                                    <p className="text-white font-medium capitalize">{formattedDateCap}</p>
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs font-bold uppercase tracking-wide">
                                                        <span className="material-symbols-outlined text-lg">schedule</span>
                                                        Horario
                                                    </div>
                                                    <p className="text-white font-medium">
                                                        {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fin)}
                                                    </p>
                                                </div>

                                                <div className="col-span-2">
                                                    <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs font-bold uppercase tracking-wide">
                                                        <span className="material-symbols-outlined text-lg">location_on</span>
                                                        Ubicación
                                                    </div>
                                                    <p className="text-white font-medium">Centro de Alto Rendimiento, Sector B</p>
                                                </div>
                                            </div>

                                            {/* Note Section */}
                                            <div className="bg-[#252525] rounded-xl p-4 border border-gray-800 relative">
                                                <span className="material-symbols-outlined absolute top-3 right-3 text-gray-700 text-xl">format_quote</span>
                                                <p className="text-[#888] text-xs font-bold uppercase mb-1">Nota del día</p>
                                                <p className="text-gray-300 text-sm leading-relaxed italic">
                                                    {entrenamiento.descripcion
                                                        ? `"${entrenamiento.descripcion}"`
                                                        : "\"Recodar llegar 15 minutos antes para el calentamiento grupal.\""}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="bg-[#151515] p-6 lg:px-10 lg:py-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <p className="text-gray-300 font-medium text-sm">¿ASISTIRÁS A ESTA SESIÓN?</p>
                                    <div className="flex gap-4 w-full sm:w-auto">
                                        {isConfirmed ? (
                                            <div className="flex-1 sm:flex-none border border-green-500/30 bg-green-500/10 text-green-500 px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-default">
                                                <span className="material-symbols-outlined">check_circle</span>
                                                Asistencia Confirmada
                                            </div>
                                        ) : isRejected ? (
                                            <>
                                                <div className="flex-1 sm:flex-none border border-gray-700 bg-gray-800 text-gray-400 px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-default">
                                                    <span className="material-symbols-outlined">cancel</span>
                                                    No Asistirás
                                                </div>
                                                <button
                                                    onClick={handleConfirmar}
                                                    className="flex-1 sm:flex-none px-6 py-3 text-sm text-gray-500 hover:text-white underline hover:no-underline"
                                                >
                                                    Cambiar a "SÍ Asistiré"
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={handleRechazar}
                                                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm border border-transparent hover:border-gray-700"
                                                >
                                                    <span className="material-symbols-outlined text-lg">cancel</span>
                                                    No puedo asistir
                                                </button>
                                                <button
                                                    onClick={handleConfirmar}
                                                    disabled={confirmando}
                                                    className="flex-1 sm:flex-none bg-[#E50914] hover:bg-[#b00710] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2 text-sm"
                                                >
                                                    {confirmando ? (
                                                        <span className="material-symbols-outlined animate-spin">refresh</span>
                                                    ) : (
                                                        <span className="material-symbols-outlined">check_circle</span>
                                                    )}
                                                    Confirmar Asistencia
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Widgets - Keeping static for now as requested unless meaningful dynamic data is available */}
                        <div className="space-y-6">
                            {/* Asistencia del Equipo */}
                            <div className="bg-[#1a1a1a] rounded-3xl p-6 border border-gray-800">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-green-500">groups</span>
                                    </div>
                                    <h3 className="font-bold text-lg">Asistencia del Equipo</h3>
                                </div>
                                <p className="text-gray-400 text-sm mb-4">Compañeros listos para entrenar.</p>

                                <div className="flex -space-x-3 overflow-hidden py-2 pl-1 h-14 items-center">
                                    {teamStats.loading ? (
                                        <span className="text-xs text-gray-500 animate-pulse">Cargando...</span>
                                    ) : (
                                        <>
                                            {teamStats.avatars.map((initial, i) => (
                                                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1a1a1a] bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                                                    {initial}
                                                </div>
                                            ))}
                                            {teamStats.count > 0 && (
                                                <div className="w-10 h-10 rounded-full border-2 border-[#1a1a1a] bg-green-600 flex items-center justify-center text-xs font-bold text-white relative z-10">
                                                    +{teamStats.count}
                                                </div>
                                            )}
                                            {teamStats.count === 0 && teamStats.avatars.length === 0 && (
                                                <span className="text-xs text-gray-500 italic">Se el primero en confirmar</span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Nutrición */}
                            <div className="bg-[#1a1a1a] rounded-3xl p-6 border border-gray-800">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-red-500">restaurant</span>
                                    </div>
                                    <h3 className="font-bold text-lg">Nutrición Previa</h3>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        <strong className="text-white block mb-1">Recomendado:</strong>
                                        40g de carbohidratos complejos 90 min antes.
                                    </p>
                                    <button className="text-red-500 text-sm font-bold hover:underline">Ver Plan de Comidas</button>
                                </div>
                            </div>

                            {/* Clima */}
                            <div className="bg-[#1a1a1a] rounded-3xl p-6 border border-gray-800">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-blue-500">thermostat</span>
                                    </div>
                                    <h3 className="font-bold text-lg">Clima y Entorno</h3>
                                </div>
                                <div className="space-y-2 text-sm text-gray-400">
                                    <p>Sesión interior.</p>
                                    <div className="flex justify-between items-center py-2 border-t border-gray-800">
                                        <span>Temperatura</span>
                                        <span className="text-white font-mono">20°C</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConfirmacionEntrenamientoPage;
