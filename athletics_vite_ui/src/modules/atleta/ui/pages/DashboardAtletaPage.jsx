import React, { useEffect, useState } from 'react';
import AtletaService from '../../services/AtletaService';
import ResultadoCompetenciaService from '../../../competencia/services/resultado_competencia_service';
import resultadoEntrenamientoService from '../../../entrenador/services/resultado_entrenamiento_service';
import ResultadoPruebaService from '../../../competencia/services/resultado_prueba_service';
import { Trophy, Medal, Calendar, Activity, TrendingUp, Award, Target, Zap, BarChart3, Timer, Ruler, User, ClipboardList, Dumbbell, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, Legend } from 'recharts';
import { format, isValid } from 'date-fns';
import authService from '../../../auth/services/auth_service';

const DashboardAtletaPage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [trainingSessions, setTrainingSessions] = useState([]);
    const [competitions, setCompetitions] = useState([]);
    const [testResults, setTestResults] = useState([]);
    const [stats, setStats] = useState({
        totalSessions: 0,
        attendanceRate: 0,
        upcomingSessions: 0,
        completedSessions: 0,
        totalCompetitions: 0,
        medals: { oro: 0, plata: 0, bronce: 0 }
    });

    useEffect(() => {
        // Get current user from localStorage or token
        const getCurrentUser = async () => {
            try {
                const userStr = localStorage.getItem('user');
                console.log('📦 User from localStorage:', userStr);
                if (userStr) {
                    const userData = JSON.parse(userStr);
                    console.log('👤 Parsed User Data:', userData);
                    setUser(userData);
                    // Fetch data AFTER user is set
                    await fetchData(userData);
                } else {
                    console.warn('⚠️ No user found in localStorage');
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error getting user:", error);
                setLoading(false);
            }
        };

        getCurrentUser();
    }, []);

    const fetchData = async (currentUser) => {
        try {
            setLoading(true);
            console.log('🔍 Fetching training data...');
            console.log('👤 User for filtering:', currentUser);
            console.log('🆔 User ID:', currentUser.id);

            let atletaId = null;

            // Estrategia 1: Buscar en los perfiles del usuario (Optimización solicitada)
            // Filtramos por rol 'ATLETA' directamente en el objeto de usuario si existe
            if (currentUser && currentUser.perfiles && Array.isArray(currentUser.perfiles)) {
                console.log('🔍 Buscando perfil de ATLETA en objeto usuario...');
                // Buscamos perfil activo de tipo ATLETA
                const profile = currentUser.perfiles.find(p => p.rol === 'ATLETA' || p.tipo === 'ATLETA');
                if (profile) {
                    atletaId = profile.id;
                    console.log('✅ ID de atleta encontrado en perfiles local:', atletaId);
                }
            }

            // Estrategia 2: Consultar API Auth /users/me (Corrección solicitada)
            if (!atletaId) {
                console.log('📋 Buscando perfil vía authService.getProfile()...');
                try {
                    const profileResponse = await authService.getProfile();
                    console.log('👤 Auth Profile Response:', profileResponse);

                    // El response puede ser directamente el objeto o contenida en .data
                    const userProfile = profileResponse.data || profileResponse;

                    // Buscamos perfiles dentro del usuario recuperado
                    if (userProfile && userProfile.perfiles && Array.isArray(userProfile.perfiles)) {
                        const profile = userProfile.perfiles.find(p => p.rol === 'ATLETA' || p.tipo === 'ATLETA');
                        if (profile) {
                            atletaId = profile.id;
                        }
                    }

                    if (!atletaId && userProfile.id && userProfile.role === 'ATLETA') {
                        console.warn('⚠️ User es ATLETA pero no tiene lista de perfiles. Usando ID de usuario como fallback.');
                        atletaId = userProfile.id;
                    }

                } catch (profileError) {
                    console.warn('⚠️ Could not fetch auth profile:', profileError);

                    if ((profileError.response && profileError.response.status === 404) ||
                        profileError.message.includes('404')) {
                        console.log('✅ Handled 404 - Profile endpoint not found');
                        setLoading(false);
                        return;
                    }
                    // No re-throw para permitir renderizar vacío si falla
                }
            }

            if (!atletaId) {
                console.warn('⚠️ No athlete profile found for user');
                setLoading(false);
                return;
            }

            // 1. Fetch CURRENT Authenticated User from API (Single Source of Truth)
            // This avoids stale localStorage data from other projects
            let currentUserApi = currentUser;
            try {
                const profileRes = await authService.getProfile();
                console.log('📡 API /users/me Response:', profileRes);
                if (profileRes && (profileRes.data || profileRes.id)) {
                    currentUserApi = profileRes.data || profileRes;
                }
            } catch (err) {
                console.warn('⚠️ Could not fetch /users/me, using localStorage fallback:', err);
            }

            console.log('✅ Usando Usuario:', currentUserApi);

            // Obtener datos reales usando la estrategia de RendimientoPage
            const results = await Promise.allSettled([
                ResultadoCompetenciaService.getAll().catch(() => ({ data: { items: [] } })),
                ResultadoPruebaService.getAll().catch(() => ({ data: { items: [] } })),
                resultadoEntrenamientoService.getAll().catch(() => []),
                AtletaService.getAll().catch(() => ({ data: [] }))
            ]);

            const [resCompetencias, resPruebas, resEntrenamientos, resAtletas] = results;

            // Helper extraction logic comparable to RendimientoPage
            // Robust extraction logic (Single Source of Truth)
            const extractData = (res, name = 'unknown') => {
                if (res.status !== 'fulfilled') {
                    console.warn(`⚠️ Resource ${name} failed to load:`, res.reason);
                    return [];
                }

                const val = res.value;
                if (!val) return [];

                // 1. Direct array
                if (Array.isArray(val)) return val;

                // 2. BaseResponse wrapper (val.data is the payload)
                if (val.data) {
                    if (Array.isArray(val.data)) return val.data;
                    if (val.data.items && Array.isArray(val.data.items)) return val.data.items;
                    // Double nesting sometimes seen in some services
                    if (val.data.data && Array.isArray(val.data.data)) return val.data.data;
                    if (val.data.data?.items && Array.isArray(val.data.data.items)) return val.data.data.items;
                }

                // 3. Directly in .items
                if (val.items && Array.isArray(val.items)) return val.items;

                console.warn(`❓ Could not find array in ${name} response:`, val);
                return [];
            };

            const rawCompetitions = extractData(resCompetencias, 'Competencias');
            const rawTests = extractData(resPruebas, 'Tests');
            const rawTrainings = extractData(resEntrenamientos, 'Trainings');
            const rawAthletes = extractData(resAtletas, 'Athletes');

            console.log('📦 API RESPONSES:');
            console.log('  Competencias response:', resCompetencias);
            console.log('  Tests response:', resPruebas);
            console.log('  Trainings response:', resEntrenamientos);


            setDebugStats({
                rawComp: rawCompetitions.length,
                rawTest: rawTests.length,
                rawTrain: rawTrainings.length
            });

            // DEBUG: Detailed check of first items structure
            if (rawCompetitions.length > 0) console.log('🔍 Comp[0] structure:', rawCompetitions[0]);
            if (rawTests.length > 0) console.log('🔍 Test[0] structure:', rawTests[0]);

            // Improved Filtering Strategy
            console.log('🔍 Filtering Strategy: Matching by ID or UserID');

            const validIds = new Set();
            if (atletaId) validIds.add(String(atletaId));
            if (currentUser.id) validIds.add(String(currentUser.id));
            if (user && user.id) validIds.add(String(user.id));

            if (currentUserApi && currentUserApi.perfiles) {
                const athleteProfile = currentUserApi.perfiles.find(p => p.rol === 'ATLETA');
                if (athleteProfile) validIds.add(String(athleteProfile.id));
            }

            if (currentUserApi.id && rawAthletes.length > 0) {
                const foundProfile = rawAthletes.find(a =>
                    String(a.user_id || a.user?.id) === String(currentUserApi.id)
                );
                if (foundProfile) validIds.add(String(foundProfile.id));
            }

            console.log('🔑 Valid IDs for User:', Array.from(validIds));

            const belongsToUser = (item) => {
                const itemAtletaId = String(item.atleta_id || item.atleta?.id || '');
                const itemUserId = String(item.atleta?.user_id || item.atleta?.user?.id || '');
                return validIds.has(itemAtletaId) || validIds.has(itemUserId);
            };

            console.log('🔍 RAW DATA BEFORE FILTERING:');
            console.log('  - Competitions:', rawCompetitions.length, rawCompetitions.length > 0 ? rawCompetitions[0] : 'empty');
            console.log('  - Tests:', rawTests.length, rawTests.length > 0 ? rawTests[0] : 'empty');
            console.log('  - Trainings:', rawTrainings.length);

            const allCompetitions = rawCompetitions.filter(belongsToUser);
            const allTests = rawTests.filter(belongsToUser);
            const allTrainings = rawTrainings.filter(belongsToUser);

            console.log(`✅ FILTERED Results: Tests ${allTests.length}, Comps ${allCompetitions.length}, Trainings ${allTrainings.length}`);

            setTrainingSessions(allTrainings);
            setCompetitions(allCompetitions);
            setTestResults(allTests);

            // Calcular estadísticas con seguridad adicional
            const totalSessions = allTrainings.length;
            const completedSessions = allTrainings.filter(t =>
                t.asistencias && Array.isArray(t.asistencias) && t.asistencias.some(a => a.presente)
            ).length;
            const attendanceRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

            console.log('📊 Stats - Total Sessions:', totalSessions, 'Completed:', completedSessions, 'Rate:', attendanceRate);

            const apiStats = {
                total_competencias: allCompetitions.length,
                medallas: allCompetitions.reduce((acc, comp) => {
                    const pos = String(comp.posicion_final || '').toLowerCase();
                    if (pos === '1' || pos.includes('oro')) acc.oro++;
                    else if (pos === '2' || pos.includes('plata')) acc.plata++;
                    else if (pos === '3' || pos.includes('bronce')) acc.bronce++;
                    return acc;
                }, { oro: 0, plata: 0, bronce: 0 })
            };

            setStats({
                totalSessions,
                completedSessions,
                attendanceRate,
                upcomingSessions: totalSessions - completedSessions,
                totalCompetitions: apiStats.total_competencias || 0,
                medals: apiStats.medallas || { oro: 0, plata: 0, bronce: 0 }
            });

        } catch (error) {
            console.error("❌ Error cargando dashboard:", error);
            console.error("Error details:", error.response?.data || error.message);
            setTrainingSessions([]);
        } finally {
            setLoading(false);
        }
    };

    // Helper to extract date
    const getDate = (item) => {
        const dateStr = item.fecha_registro || item.fecha || item.created_at || item.horario?.dia_semana;
        if (!dateStr) return 'N/A';
        // Handle "Lunes", "Martes" etc if coming from schedule
        if (['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].includes(dateStr)) return dateStr;

        try {
            const dateObj = new Date(dateStr);
            return isValid(dateObj) ? format(dateObj, 'dd/MM/yyyy') : dateStr;
        } catch {
            return dateStr;
        }
    };

    const [debugStats, setDebugStats] = useState({ rawTrain: 0, rawComp: 0, rawTest: 0 });

    const getUnifiedHistory = () => {
        // 1. Competitions
        const compData = competitions.map(c => ({
            name: c.competencia?.nombre || 'Competencia',
            resultado: parseFloat(c.resultado) || 0, // Changed from marca_obtenida based on RendimientoPage
            unit: c.unidad_medida || '',
            date: getDate(c),
            realDate: new Date(c.fecha || c.fecha_registro || 0),
            type: c.prueba?.nombre || 'Competencia',
            source: 'COMPETENCIA',
            original: c
        }));

        // 2. Tests
        const testData = testResults.map(t => ({
            name: 'Test Físico',
            resultado: parseFloat(t.marca_obtenida || 0),
            unit: t.unidad_medida || '',
            date: getDate(t),
            realDate: new Date(t.fecha || 0),
            type: t.prueba?.nombre || 'Test',
            source: 'PRUEBA',
            original: t
        }));

        // 3. Trainings (New Addition)
        const trainingData = trainingSessions.map(t => ({
            name: 'Entrenamiento',
            resultado: t.evaluacion ? parseFloat(t.evaluacion) : (t.distancia || t.tiempo || 0),
            unit: t.unidad_medida || (t.evaluacion ? 'pts' : ''),
            date: getDate(t),
            realDate: new Date(t.fecha || 0),
            type: t.entrenamiento?.tipo_entrenamiento || 'Entrenamiento',
            source: 'ENTRENAMIENTO',
            original: t
        }));

        return [...compData, ...testData, ...trainingData]
            .sort((a, b) => b.realDate - a.realDate); // Sort descending like RendimientoPage
    };

    const unifiedData = getUnifiedHistory();

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-[#332122] rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                    <p className="text-sm text-[#b30c25] font-bold">
                        {payload[0].value.toFixed(2)}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-[#121212]">
                <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-[#b30c25]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 transition-colors duration-300">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                        Mis Entrenamientos
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg mt-2">
                        Gestiona tus sesiones de entrenamiento y asistencias
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Sessions */}
                    <div className="bg-white dark:bg-[#212121] rounded-2xl shadow-sm border border-gray-200 dark:border-[#332122] p-6 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Entrenamientos</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalSessions}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <Calendar className="h-8 w-8 text-blue-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs">
                            <Activity className="h-4 w-4 text-blue-500 mr-1" />
                            <span className="text-blue-600 dark:text-blue-400 font-medium">Inscritos</span>
                        </div>
                    </div>

                    {/* Completed Sessions */}
                    <div className="bg-white dark:bg-[#212121] rounded-2xl shadow-sm border border-gray-200 dark:border-[#332122] p-6 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completados</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.completedSessions}</h3>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                <Trophy className="h-8 w-8 text-green-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs">
                            <Target className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-green-600 dark:text-green-400 font-medium">Asistencias</span>
                        </div>
                    </div>

                    {/* Attendance Rate */}
                    <div className="bg-white dark:bg-[#212121] rounded-2xl shadow-sm border border-gray-200 dark:border-[#332122] p-6 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasa de Asistencia</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.attendanceRate}%</h3>
                            </div>
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                <TrendingUp className="h-8 w-8 text-purple-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs">
                            <Zap className="h-4 w-4 text-purple-500 mr-1" />
                            <span className="text-purple-600 dark:text-purple-400 font-medium">Rendimiento</span>
                        </div>
                    </div>

                    {/* Upcoming Sessions -> Cambiado a Competencias si hay datos */}
                    <div className="bg-white dark:bg-[#212121] rounded-2xl shadow-sm border border-gray-200 dark:border-[#332122] p-6 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Competencias</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalCompetitions}</h3>
                            </div>
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                                <Award className="h-8 w-8 text-yellow-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs">
                            <Target className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-yellow-600 dark:text-yellow-400 font-medium">Participaciones</span>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                {/* Unified Performance Chart */}
                <div className="mb-8 bg-white dark:bg-[#212121] rounded-2xl shadow-sm border border-gray-200 dark:border-[#332122] p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Historial de Rendimiento (Todos los Eventos)</h3>
                    </div>

                    {unifiedData.length > 0 ? (
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={unifiedData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#9ca3af"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="resultado"
                                        name="Marca / Resultado"
                                        stroke="#b30c25"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#b30c25', strokeWidth: 0 }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-gray-400 dark:text-gray-500">
                            <div className="text-center">
                                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No hay datos de rendimiento suficientes</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Training Sessions Table */}
                <div className="bg-white dark:bg-[#212121] p-6 rounded-xl border border-gray-200 dark:border-[#332122] shadow-sm mb-6">
                    <h3 className="text-gray-900 dark:text-white font-bold mb-4 flex items-center gap-2 text-lg">
                        <Dumbbell size={20} className="text-green-500" />
                        Historial de Entrenamientos
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-[#121212] border-b border-gray-200 dark:border-[#332122]">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Fecha</th>
                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Entrenamiento</th>
                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Horario</th>
                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-[#332122]">
                                {trainingSessions.map((session, index) => (
                                    <tr key={session.id || index} className="hover:bg-gray-50 dark:hover:bg-[#212121]">
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{getDate(session)}</td>
                                        <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                                            {session.entrenamiento?.tipo_entrenamiento || session.entrenamiento?.descripcion || 'Sin nombre'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                            {session.entrenamiento?.horarios && session.entrenamiento.horarios.length > 0
                                                ? `${session.entrenamiento.horarios[0].hora_inicio} - ${session.entrenamiento.horarios[0].hora_fin}`
                                                : 'Sin horario'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${session.asistencias && session.asistencias.some(a => a.presente)
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                                }`}>
                                                {session.asistencias && session.asistencias.some(a => a.presente) ? 'Presente' : 'Ausente/Pendiente'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {trainingSessions.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 italic">
                                            No tienes entrenamientos registrados aún.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Competitions Table */}
                <div className="bg-white dark:bg-[#212121] p-6 rounded-xl border border-gray-200 dark:border-[#332122] shadow-sm mb-6">
                    <h3 className="text-gray-900 dark:text-white font-bold mb-4 flex items-center gap-2 text-lg">
                        <Trophy size={20} className="text-[#b30c25]" />
                        Detalle de Competencias
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-[#121212] border-b border-gray-200 dark:border-[#332122]">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Fecha</th>
                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Competencia</th>
                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Prueba</th>
                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Resultado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-[#332122]">
                                {competitions
                                    .sort((a, b) => new Date(b.fecha_registro || b.created_at || 0) - new Date(a.fecha_registro || a.created_at || 0))
                                    .map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#212121]">
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{getDate(item)}</td>
                                            <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{item.competencia?.nombre || 'N/A'}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{item.prueba?.nombre || 'N/A'}</td>
                                            <td className="px-4 py-3 text-gray-900 dark:text-white font-mono font-bold">
                                                {item.resultado} {item.unidad_medida || item.prueba?.unidad_medida}
                                            </td>
                                        </tr>
                                    ))}
                                {competitions.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 italic">
                                            No hay resultados de competencias.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Test Results Table */}
                <div className="bg-white dark:bg-[#212121] p-6 rounded-xl border border-gray-200 dark:border-[#332122] shadow-sm mb-6">
                    <h3 className="text-gray-900 dark:text-white font-bold mb-4 flex items-center gap-2 text-lg">
                        <ClipboardList size={20} className="text-blue-500" />
                        Historial de Pruebas Físicas (Tests)
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-[#121212] border-b border-gray-200 dark:border-[#332122]">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Fecha</th>
                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Tipo Test</th>
                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Prueba</th>
                                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Marca</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-[#332122]">
                                {testResults
                                    .sort((a, b) => new Date(b.fecha || b.created_at || 0) - new Date(a.fecha || a.created_at || 0))
                                    .map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#212121]">
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{getDate(item)}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                    Test Físico
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{item.prueba?.nombre || 'N/A'}</td>
                                            <td className="px-4 py-3 text-gray-900 dark:text-white font-mono font-bold">
                                                {item.marca_obtenida} {item.prueba?.unidad_medida}
                                            </td>
                                        </tr>
                                    ))}
                                {testResults.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 italic">
                                            No hay pruebas físicas registradas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardAtletaPage;