import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    CheckCircle,
    XCircle,
    Calendar,
    Clock,
    MapPin,
    Info,
    ChevronRight,
    Dumbbell,
    Gamepad2,
    RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AtletaService from '../../services/AtletaService';
import authService from '@modules/auth/services/auth_service';

const getStatusStyles = (isConfirmed, isRejected) => {
    if (isConfirmed) {
        return {
            container: 'bg-green-50 border-green-200 text-green-600 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-500',
            dot: 'bg-green-500'
        };
    }
    if (isRejected) {
        return {
            container: 'bg-gray-100 border-gray-200 text-gray-500 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-400',
            dot: 'bg-gray-500'
        };
    }
    return {
        container: 'bg-red-50 border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-500',
        dot: 'bg-red-500 animate-pulse'
    };
};

const ConfirmacionEntrenamientoPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [entrenamiento, setEntrenamiento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirmando, setConfirmando] = useState(false);
    const [registros, setRegistros] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Get user profile from auth service to get the numeric atleta_id
            const userProfile = await authService.getProfile();
            console.log("User profile from API:", userProfile);

            // Extract the numeric atleta_id from data.atleta.id
            const atletaId = userProfile?.data?.atleta?.id;

            if (!atletaId) {
                toast.error("No se pudo obtener el ID del atleta");
                return;
            }

            const res = await AtletaService.getPendingConfirmations(atletaId);

            console.log("All registros from API:", res);
            console.log("Confirmado values:", res.map(r => ({ id: r.id, confirmado: r.confirmado, type: typeof r.confirmado })));
            console.log("Asistencias in registros:", res.map(r => ({ id: r.id, asistencias: r.asistencias })));

            // Filter to show only pending confirmations (where confirmado is null/undefined)
            // If confirmado === true, it's already confirmed
            // If confirmado === false, it's already rejected
            // Also filter out registros that already have asistencias with atleta_confirmo = true
            const pendingRegistros = res.filter(reg => {
                const hasConfirmado = reg.confirmado === null || reg.confirmado === undefined;
                const hasNoConfirmedAsistencia = !reg.asistencias?.some(a => a.atleta_confirmo === true);
                return hasConfirmado && hasNoConfirmedAsistencia;
            });

            setRegistros(pendingRegistros);

            if (pendingRegistros.length > 0) {
                const index = id ? pendingRegistros.findIndex(r => r.external_id === id) : 0;
                const safeIndex = index >= 0 ? index : 0;
                setCurrentIndex(safeIndex);
                setEntrenamiento(pendingRegistros[safeIndex].horario?.entrenamiento);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar entrenamientos pendientes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const selectSession = (index) => {
        setCurrentIndex(index);
        setEntrenamiento(registros[index].horario?.entrenamiento);
    };

    const handleConfirmar = async () => {
        if (!registros[currentIndex]) return;
        setConfirmando(true);
        try {
            const fechaEntrenamiento = registros[currentIndex].horario?.entrenamiento?.fecha_entrenamiento;
            console.log("Confirming attendance:", {
                registro_id: registros[currentIndex].id,
                fecha_entrenamiento: fechaEntrenamiento,
                registro: registros[currentIndex]
            });
            await AtletaService.confirmAttendance(
                registros[currentIndex].id,
                true,
                fechaEntrenamiento
            );
            toast.success("Asistencia confirmada correctamente");
            fetchData();
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.detail || "Error al confirmar asistencia";
            toast.error(errorMessage);
        } finally {
            setConfirmando(false);
        }
    };

    const handleRechazar = async () => {
        if (!registros[currentIndex]) return;
        setConfirmando(true);
        try {
            const fechaEntrenamiento = registros[currentIndex].horario?.entrenamiento?.fecha_entrenamiento;
            await AtletaService.confirmAttendance(
                registros[currentIndex].id,
                false,
                fechaEntrenamiento
            );
            toast.success("Se ha registrado que no asistirás");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar estado");
        } finally {
            setConfirmando(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#b30c25] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Cargando tus sesiones...</p>
                </div>
            </div>
        );
    }

    if (registros.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white dark:bg-[#1a1a1a] p-10 rounded-3xl shadow-xl border border-gray-200 dark:border-[#332122] max-w-md w-full">
                    <div className="w-20 h-20 bg-green-50 dark:bg-green-900/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">¡Todo al día!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">No tienes confirmaciones de asistencia pendientes por el momento.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    const currentReg = registros[currentIndex];
    const isConfirmed = currentReg.confirmado === true;
    const isRejected = currentReg.confirmado === false;
    const statusStyles = getStatusStyles(isConfirmed, isRejected);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] p-4 md:p-8 font-['Lexend'] transition-colors duration-300">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

                {/* LISTA LATERAL (Sidebar en Desktop) */}
                <div className="lg:col-span-4 space-y-4 h-full">
                    <div className="flex items-center justify-between mb-2 px-2">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar size={20} className="text-[#b30c25]" />
                            Pendientes
                        </h2>
                        <span className="bg-[#b30c25] text-white text-[10px] font-black px-2 py-1 rounded-full">{registros.length} Sesiones</span>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                        {registros.map((reg, index) => {
                            const regConfirmed = reg.confirmado === true;
                            const regRejected = reg.confirmado === false;
                            const regStyles = getStatusStyles(regConfirmed, regRejected);

                            return (
                                <button
                                    key={reg.id}
                                    onClick={() => selectSession(index)}
                                    className={`
                                        w-full text-left p-4 rounded-3xl border transition-all duration-300 flex flex-col gap-2 group
                                        ${currentIndex === index
                                            ? 'bg-white dark:bg-[#1a1a1a] border-[#b30c25] shadow-lg shadow-red-900/10'
                                            : 'bg-white/50 dark:bg-[#1a1a1a]/40 border-gray-100 dark:border-[#332122] hover:border-gray-300 dark:hover:border-gray-700'}
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`w-2 h-2 rounded-full mt-1.5 ${regStyles.dot}`}></span>
                                        <div className="flex-1 ml-3">
                                            <p className={`font-bold text-sm ${currentIndex === index ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {reg.horario?.entrenamiento?.tipo_entrenamiento || 'Entrenamiento'}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">
                                                {reg.horario?.entrenamiento?.fecha_entrenamiento
                                                    ? format(new Date(reg.horario.entrenamiento.fecha_entrenamiento), "EEEE d 'de' MMMM", { locale: es })
                                                    : 'Fecha no disponible'}
                                            </p>
                                        </div>
                                        <ChevronRight size={16} className={`text-gray-300 group-hover:translate-x-1 transition-transform ${currentIndex === index ? 'text-[#b30c25] opacity-100' : 'opacity-0'}`} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* DETALLE Y ACCIONES */}
                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] shadow-2xl border border-gray-200 dark:border-[#332122] overflow-hidden flex flex-col h-full ring-1 ring-gray-100 dark:ring-white/5">

                        {/* HEADER DETALLE */}
                        <div className="relative h-48 md:h-64 overflow-hidden group">
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                            <img
                                src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=2070"
                                alt="Athletics"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />

                            <div className="absolute bottom-6 left-6 right-6 z-20">
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest mb-3 ${statusStyles.container}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`}></span>
                                    {(() => {
                                        if (isConfirmed) return 'Confirmado';
                                        if (isRejected) return 'Rechazado';
                                        return 'Pendiente';
                                    })()}
                                </span>
                                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                                    {entrenamiento?.tipo_entrenamiento}
                                </h1>
                            </div>
                        </div>

                        {/* CONTENIDO DETALLE */}
                        <div className="p-8 space-y-8 flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#212121] p-5 rounded-3xl border border-gray-100 dark:border-[#332122] group hover:border-[#b30c25]/30 transition-colors">
                                    <div className="w-12 h-12 bg-white dark:bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-[#b30c25] shadow-sm">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fecha Evento</p>
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            {entrenamiento?.fecha_entrenamiento
                                                ? format(new Date(entrenamiento.fecha_entrenamiento), "d 'de' MMMM, yyyy", { locale: es })
                                                : 'Fecha no disponible'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#212121] p-5 rounded-3xl border border-gray-100 dark:border-[#332122] group hover:border-[#b30c25]/30 transition-colors">
                                    <div className="w-12 h-12 bg-white dark:bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-[#b30c25] shadow-sm">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hora Sugerida</p>
                                        <p className="font-bold text-gray-900 dark:text-white">08:00 AM - 10:30 AM</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <Info size={20} className="text-[#b30c25]" />
                                    Instrucciones de la Sesión
                                </h3>
                                <div className="p-6 bg-red-50/50 dark:bg-[#b30c25]/5 rounded-[1.8rem] border border-[#b30c25]/10 italic text-gray-600 dark:text-gray-300 leading-relaxed shadow-sm">
                                    {entrenamiento?.descripcion
                                        ? `"${entrenamiento.descripcion}"`
                                        : '"Recordar llegar 15 minutos antes para el calentamiento grupal y traer hidratación personal."'}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-gray-50 dark:bg-[#212121] border border-gray-100 dark:border-[#332122]">
                                    <Dumbbell className="text-gray-400" size={20} />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Intensidad</span>
                                    <span className="font-bold text-gray-900 dark:text-white uppercase tracking-tighter">Media-Alta</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-gray-50 dark:bg-[#212121] border border-gray-100 dark:border-[#332122]">
                                    <MapPin className="text-gray-400" size={20} />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Ubicación</span>
                                    <span className="font-bold text-gray-900 dark:text-white uppercase tracking-tighter">Pista Principal</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-gray-50 dark:bg-[#212121] border border-gray-100 dark:border-[#332122]">
                                    <Gamepad2 className="text-gray-400" size={20} />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Equipamiento</span>
                                    <span className="font-bold text-gray-900 dark:text-white uppercase tracking-tighter">Zapatos Clavos</span>
                                </div>
                            </div>
                        </div>

                        {/* ACCIONES FOOTER */}
                        <div className="p-8 bg-gray-50 dark:bg-[#121212]/50 border-t border-gray-100 dark:border-[#332122] flex flex-col sm:flex-row gap-4">
                            {(() => {
                                if (isConfirmed) {
                                    return (
                                        <div className="flex-1 border border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-500 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 cursor-default">
                                            <CheckCircle size={24} />
                                            Asistencia Confirmada
                                        </div>
                                    );
                                }

                                if (isRejected) {
                                    return (
                                        <>
                                            <div className="flex-1 border border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 cursor-default">
                                                <XCircle size={24} />
                                                No Asistirás
                                            </div>
                                            <button
                                                onClick={handleConfirmar}
                                                className="flex-1 px-8 py-4 text-sm font-bold text-gray-500 hover:text-[#b30c25] dark:hover:text-white transition-colors flex items-center justify-center gap-2 underline underline-offset-4"
                                            >
                                                <RotateCcw size={16} /> Cambiar a "SÍ Asistiré"
                                            </button>
                                        </>
                                    );
                                }

                                return (
                                    <>
                                        <button
                                            onClick={handleRechazar}
                                            disabled={confirmando}
                                            className="flex-1 px-8 py-4 rounded-2xl font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-3 text-sm border border-transparent hover:border-gray-300 dark:hover:border-gray-700"
                                        >
                                            <XCircle size={20} />
                                            No puedo asistir
                                        </button>
                                        <button
                                            onClick={handleConfirmar}
                                            disabled={confirmando}
                                            className="flex-1 bg-linear-to-r from-[#b30c25] to-[#80091b] hover:brightness-110 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-red-900/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                        >
                                            {confirmando ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <CheckCircle size={20} />
                                            )}
                                            Confirmar Asistencia
                                        </button>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ConfirmacionEntrenamientoPage;
