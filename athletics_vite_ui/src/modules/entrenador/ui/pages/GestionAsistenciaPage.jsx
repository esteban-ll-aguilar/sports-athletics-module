import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import EntrenamientoService from '../../services/EntrenamientoService';
import AsistenciaService from '../../services/AsistenciaService';
import AtletaService from '../../../atleta/services/AtletaService';

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
                console.log("Atletas cargados en Page:", atletas);
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
            console.error(error);
            toast.error("Error al inscribir atleta");
        }
    };

    const handleMarcarAsistencia = async (registroId) => {
        try {
            // Check if already assisting today? (Ideally backend check or UI disables it, 
            // for MVP just sending 'now')
            const now = new Date();
            const timeString = now.toTimeString().split(' ')[0]; // HH:MM:SS

            await AsistenciaService.registrarAsistencia({
                registro_asistencias_id: registroId,
                fecha_asistencia: now.toISOString().split('T')[0],
                hora_llegada: timeString,
                descripcion: "Asistencia registrada desde panel"
            });
            toast.success("Asistencia registrada para hoy");
            // Optionally refresh or mark UI
        } catch (error) {
            console.error(error);
            toast.error("Error al registrar asistencia");
        }
    };

    if (loading) {
        return <div className="p-10 text-center">Cargando...</div>;
    }

    if (!entrenamiento) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-['Lexend']">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <button onClick={() => navigate('/dashboard/entrenamientos')} className="mb-4 text-gray-500 hover:text-gray-900 flex items-center gap-2">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Volver
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">{entrenamiento.tipo_entrenamiento}</h1>
                    <p className="text-gray-500 mt-2">{entrenamiento.descripcion}</p>
                    <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        {entrenamiento.fecha_entrenamiento}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar: Horarios */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 px-2">Horarios</h2>
                        <div className="flex flex-col gap-3">
                            {horarios.length === 0 && <p className="text-gray-400 px-2">No hay horarios definidos.</p>}
                            {horarios.map(h => (
                                <button
                                    key={h.id}
                                    onClick={() => setSelectedHorario(h)}
                                    className={`p-4 rounded-2xl text-left transition-all duration-200 border ${selectedHorario?.id === h.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 border-blue-600 scale-105'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                                        }`}
                                >
                                    <div className="font-bold text-lg">{h.name || "Sin nombre"}</div>
                                    <div className="flex items-center gap-2 text-sm mt-1 opacity-90">
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
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Gestión de Asistencia</h2>
                                        <p className="text-sm text-gray-500">Horario: {selectedHorario.hora_inicio} - {selectedHorario.hora_fin}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                                        <form onSubmit={handleInscribir} className="flex gap-2">
                                            <select
                                                name="atletaId"
                                                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
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
                                                className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 transition-colors"
                                            >
                                                + Inscribir
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                                            <tr>
                                                <th className="px-6 py-4">Atleta</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {isEnrollmentLoading ? (
                                                <tr><td colSpan="3" className="p-8 text-center text-gray-400">Cargando atletas...</td></tr>
                                            ) : inscritos.length === 0 ? (
                                                <tr><td colSpan="3" className="p-8 text-center text-gray-400">No hay atletas inscritos en este horario.</td></tr>
                                            ) : (
                                                inscritos.map(registro => (
                                                    <tr key={registro.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <div className="font-semibold text-gray-900">
                                                                {registro.atleta?.user?.first_name} {registro.atleta?.user?.last_name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">{registro.atleta?.user?.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Inscrito</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <button
                                                                onClick={() => handleMarcarAsistencia(registro.id)}
                                                                className="group relative inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-green-500 hover:text-green-600 transition-all shadow-sm"
                                                                title="Marcar Asistencia Hoy"
                                                            >
                                                                <span className="material-symbols-outlined text-gray-400 group-hover:text-green-500 transition-colors">check_circle</span>
                                                                <span className="text-sm font-semibold text-gray-600 group-hover:text-green-600">Presente</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-10 bg-white rounded-3xl border border-gray-100 border-dashed">
                                <span className="material-symbols-outlined text-6xl mb-4 text-gray-200">schedule</span>
                                <p>Selecciona un horario para gestionar la asistencia</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GestionAsistenciaPage;
