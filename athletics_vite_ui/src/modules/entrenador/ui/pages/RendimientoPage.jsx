import React, { useState, useEffect, useId } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import ResultadoPruebaService from '../../../competencia/services/resultado_prueba_service';
import ResultadoCompetenciaService from '../../../competencia/services/resultado_competencia_service';
import resultadoEntrenamientoService from '../../services/resultado_entrenamiento_service';
import CompetenciaService from '../../../competencia/services/competencia_service';
import PruebaService from '../../../competencia/services/prueba_service';
import AtletaService from '../../../atleta/services/AtletaService';
import { User, Activity, Trophy, TrendingUp, Users, AlertCircle, RefreshCw, Filter, FilterX, ClipboardList, Dumbbell } from 'lucide-react';
import { format, isValid } from 'date-fns';

const RendimientoPage = () => {
    const baseId = useId();

    // Filters
    const [selectedAtleta, setSelectedAtleta] = useState('');
    const [selectedCompetencia, setSelectedCompetencia] = useState('');
    const [selectedPrueba, setSelectedPrueba] = useState('');

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('individual');

    const [competencias, setCompetencias] = useState([]);
    const [pruebas, setPruebas] = useState([]);
    const [resultados, setResultados] = useState([]);
    const [resultadosPruebas, setResultadosPruebas] = useState([]);
    const [resultadosEntrenamientos, setResultadosEntrenamientos] = useState([]);
    const [atletas, setAtletas] = useState([]);

    // Data fetching helpers
    const extractData = (res, isTrain = false) => {
        if (res.status !== 'fulfilled') return [];
        const val = res.value;
        if (isTrain) {
            return Array.isArray(val) ? val : (val.data || []);
        }
        return val.items || val.data?.items || val.data || val || [];
    };

    const processAtletas = (itemsAthletes, itemsTrainResults) => {
        const existingIds = new Set(itemsAthletes.map(a => String(a.id)));
        const ghostAthletes = [];

        itemsTrainResults.forEach(r => {
            const hasValidAtleta = r.atleta && r.atleta_id;
            const isNotExisting = !existingIds.has(String(r.atleta_id));

            if (hasValidAtleta && isNotExisting) {
                ghostAthletes.push({
                    id: r.atleta.id,
                    first_name: r.atleta.user?.first_name || 'Atleta',
                    last_name: r.atleta.user?.last_name || 'Desconocido',
                    user: r.atleta.user,
                    isGhost: true
                });
                existingIds.add(String(r.atleta_id));
            }
        });

        return [...itemsAthletes, ...ghostAthletes];
    };

    const getInitialAthleteId = (finalAthletes, itemsTrainResults) => {
        if (finalAthletes.length === 0) return '';

        const params = new URLSearchParams(window.location.search);
        const urlAtletaId = params.get('atleta_id');

        if (urlAtletaId) {
            const validUrlId = finalAthletes.some(a => String(a.id) === String(urlAtletaId));
            if (validUrlId) return String(urlAtletaId);
        }

        // Search for first athlete with data
        const athleteWithData = finalAthletes.find(a => {
            return itemsTrainResults.some(r => String(r.atleta_id) === String(a.id));
        });

        return String(athleteWithData ? athleteWithData.id : finalAthletes[0].id);
    };

    // Fetch data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                setError(null);

                const results = await Promise.allSettled([
                    ResultadoCompetenciaService.getAll().catch(() => ({ data: { items: [] } })),
                    ResultadoPruebaService.getAll().catch(() => ({ data: { items: [] } })),
                    resultadoEntrenamientoService.getAll().catch(() => []),
                    AtletaService.getAthletes(1, 100).catch(() => ({ data: { items: [] } })),
                    CompetenciaService.getAll().catch(() => ({ data: [] })),
                    PruebaService.getAll().catch(() => ({ data: [] }))
                ]);

                const [resResultados, resResultadosPruebas, resResultadosEntrenamientos, resAtletas, resCompetencias, resPruebas] = results;

                const itemsResults = extractData(resResultados);
                const itemsTestResults = extractData(resResultadosPruebas);
                const itemsTrainResults = extractData(resResultadosEntrenamientos, true);
                const itemsAthletes = extractData(resAtletas);

                setCompetencias(extractData(resCompetencias));
                setPruebas(extractData(resPruebas));

                const finalAthletes = processAtletas(itemsAthletes, itemsTrainResults);

                setResultados(Array.isArray(itemsResults) ? itemsResults : []);
                setResultadosPruebas(Array.isArray(itemsTestResults) ? itemsTestResults : []);
                setResultadosEntrenamientos(itemsTrainResults);
                setAtletas(finalAthletes);

                const initialId = getInitialAthleteId(finalAthletes, itemsTrainResults);
                if (initialId) setSelectedAtleta(initialId);

            } catch (err) {
                console.error("Critical Error:", err);
                setError("Ocurrió un error al cargar los datos. Por favor reintenta.");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // Helper to extract date
    const getDate = (item) => {
        // Prefer proper date field, fallback to creation
        const dateStr = item.fecha_registro || item.created_at || item.fecha;
        if (!dateStr) return 'N/A';
        try {
            const dateObj = new Date(dateStr);
            return isValid(dateObj) ? format(dateObj, 'dd/MM/yyyy') : 'Invalid Date';
        } catch {
            return 'Invalid Date';
        }
    }

    // Process data for charts
    const getFilteredResults = () => {
        return resultados.filter(r => {
            const matchesCompetencia = selectedCompetencia ? String(r.competencia_id || r.competencia?.id) === String(selectedCompetencia) : true;
            const matchesPrueba = selectedPrueba ? String(r.prueba_id || r.prueba?.id) === String(selectedPrueba) : true;
            return matchesCompetencia && matchesPrueba;
        });
    };

    const getAthleteData = (atletaId) => {
        if (!atletaId) return [];

        // 🆔 Smart Filtering: Merge profiles for the same Person (User)
        // 1. Find the selected athlete's User ID and Name
        const selectedAthleteObj = atletas.find(a => String(a.id) === String(atletaId));
        const targetUserId = selectedAthleteObj?.user_id || selectedAthleteObj?.user?.id;
        const targetName = `${selectedAthleteObj?.first_name || selectedAthleteObj?.user?.first_name || ''} ${selectedAthleteObj?.last_name || selectedAthleteObj?.user?.last_name || ''}`.trim().toLowerCase();

        // 2. Find ALL athlete IDs that belong to this User (by ID OR Name)
        let linkedAtletaIds = [String(atletaId)]; // Default to current

        try {
            linkedAtletaIds = atletas
                .filter(a => {
                    const aUserId = a.user_id || a.user?.id;
                    const aName = `${a.first_name || a.user?.first_name || ''} ${a.last_name || a.user?.last_name || ''}`.trim().toLowerCase();

                    const sameId = targetUserId && aUserId && String(aUserId) === String(targetUserId);
                    const sameName = targetName && aName && aName === targetName;

                    return sameId || sameName;
                })
                .map(a => String(a.id));
        } catch (e) {
            console.error("Linking error:", e);
        }

        console.log("DEBUG: Enhanced Unified Filter", {
            selected: atletaId,
            userID: targetUserId,
            targetName,
            linkedIDs: linkedAtletaIds
        });

        // Helper to check if a result belongs to the "Person"
        const belongsToPerson = (r) => {
            const rAtletaId = r.atleta_id || r.atleta?.id;
            return linkedAtletaIds.includes(String(rAtletaId));
        };

        // 1. Filter Competition Results
        const filteredCompResults = getFilteredResults();
        const athleteCompResults = filteredCompResults
            .filter(r => belongsToPerson(r))
            .map(r => ({
                name: r.competencia?.nombre || `Competencia`,
                resultado: parseFloat(r.resultado),
                unit: r.unidad_medida,
                date: getDate(r),
                realDateObject: new Date(r.fecha_registro || r.created_at || r.fecha),
                tipo: r.prueba?.nombre || 'Competencia',
                source: 'COMPETENCIA',
                original: r
            }));

        // 2. Filter Test Results (Pruebas)
        const athleteTestResults = resultadosPruebas
            .filter(r => {
                const matchesAtleta = belongsToPerson(r);
                const matchesPrueba = selectedPrueba ? String(r.prueba_id || r.prueba?.id) === String(selectedPrueba) : true;

                if (selectedCompetencia) return false; // Exclude tests if filtering by competition

                return matchesAtleta && matchesPrueba;
            })
            .map(r => ({
                name: 'Prueba Física',
                resultado: parseFloat(r.marca_obtenida),
                unit: r.unidad_medida,
                date: getDate(r),
                realDateObject: new Date(r.fecha || r.created_at),
                tipo: r.prueba?.nombre || 'Prueba',
                source: 'PRUEBA',
                original: r
            }));

        // 3. Filter Training Results (Entrenamientos)
        const athleteTrainingResults = resultadosEntrenamientos
            .filter(r => {
                // Ensure ID comparison works (UUID vs Int issue might arise here, check backend)
                // Backend might return int ID if mapped, or UUID. The schema fix ensured UUID for creation.
                // Let's assume matching works or use String cast.
                // Note: result.atleta_id might be int or UUID depending on schema. Atleta.id is int.

                const matchesAtleta = belongsToPerson(r);
                const matchesAtletaNest = r.atleta && belongsToPerson({ atleta_id: r.atleta.id }); // Double check nested

                const canShow = matchesAtleta || matchesAtletaNest;

                if (selectedCompetencia) return false; // Exclude trainings if filtering by competition

                return canShow;
            })
            .map(r => ({
                name: 'Entrenamiento',
                resultado: r.evaluacion ? parseFloat(r.evaluacion) : (r.distancia || r.tiempo || 0),
                unit: r.unidad_medida || (r.evaluacion ? 'pts' : ''),
                date: getDate(r),
                realDateObject: new Date(r.fecha),
                tipo: r.entrenamiento?.tipo_entrenamiento || 'Entrenamiento',
                source: 'ENTRENAMIENTO',
                original: r
            }));

        // Sorting
        return [...athleteCompResults, ...athleteTestResults, ...athleteTrainingResults]
            .sort((a, b) => b.realDateObject - a.realDateObject);
    };

    // Filter unique athletes for dropdown (Deduplicate by User ID OR Name)
    const uniqueAthletes = atletas.reduce((acc, current) => {
        // Normalization
        const userId = current.user_id || current.user?.id;
        const fullName = `${current.first_name || current.user?.first_name || ''} ${current.last_name || current.user?.last_name || ''}`.trim().toLowerCase();

        const hasData = resultadosEntrenamientos.some(r => String(r.atleta_id) === String(current.id));

        // Strategy: 
        // 1. Try to find existing entry by User ID
        // 2. Fallback to Name match if User ID is missing (common in some backends)
        const existingIndex = acc.findIndex(a => {
            const aUserId = a.user_id || a.user?.id;
            const aName = `${a.first_name || a.user?.first_name || ''} ${a.last_name || a.user?.last_name || ''}`.trim().toLowerCase();

            if (userId && aUserId) return String(userId) === String(aUserId);
            return aName === fullName && fullName !== ''; // Avoid matching empty names
        });

        if (existingIndex !== -1) {
            // Merge logic: prefer the one with HasData or default to existing
            if (hasData && !acc[existingIndex].hasData) {
                acc[existingIndex] = { ...current, hasData: true };
            }
        } else {
            acc.push({ ...current, hasData });
        }
        return acc;
    }, []);
    const renderIndividualTab = () => {
        const data = getAthleteData(selectedAtleta);

        // DEBUG: Inspect data passed to tables
        // const trainingData = data.filter(i => i.source === 'ENTRENAMIENTO');
        // console.log("DEBUG: renderIndividualTab Data:", {
        //     selectedAtleta,
        //     totalResults: data.length,
        //     trainingCount: trainingData.length,
        //     trainingSample: trainingData[0]
        // });

        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-200 dark:border-[#332122] shadow-sm">
                    <User className="text-gray-400" />
                    <label htmlFor={`${baseId}-atleta`} className="text-gray-700 dark:text-gray-300 font-bold whitespace-nowrap">Seleccionar Atleta:</label>
                    <select
                        id={`${baseId}-atleta`}
                        value={selectedAtleta}
                        onChange={(e) => setSelectedAtleta(e.target.value)}
                        className="
                            bg-gray-50 dark:bg-[#121212] 
                            text-gray-900 dark:text-white 
                            border border-gray-200 dark:border-[#332122] 
                            rounded-lg p-2.5 flex-1 w-full md:w-auto
                            focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
                            outline-none transition-all
                        "
                    >
                        {uniqueAthletes.map((atleta) => {
                            // Check if ANY of the linked IDs have data? 
                            // actually uniqueAthletes logic already flags 'hasData' if the representative has it. 
                            // Ideally, we want 'hasData' to be true if any linked profile has data. 
                            // Simplified for now: use the indicator computed in reduce.
                            return (
                                <option key={atleta.id} value={atleta.id}>
                                    {atleta.first_name || atleta.user?.first_name} {atleta.last_name || atleta.user?.last_name} (ID: {atleta.id}) {atleta.hasData ? '✅' : ''}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {data.length === 0 ? (
                    <div className="text-center text-gray-400 py-10 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#332122] shadow-sm">
                        <Activity size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="font-medium text-gray-500 dark:text-gray-400">No hay resultados registrados para este atleta con los filtros actuales.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {/* Line Chart - Score vs Date */}
                        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-gray-200 dark:border-[#332122] shadow-sm">
                            <h3 className="text-gray-900 dark:text-white font-bold mb-6 flex items-center gap-2 text-lg">
                                <TrendingUp size={20} className="text-[#b30c25]" />
                                Historial de Rendimiento (Todos los Eventos)
                            </h3>
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#333]" />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#6b7280"
                                            className="text-xs"
                                            tick={{ fill: '#6b7280' }}
                                        />
                                        <YAxis
                                            stroke="#6b7280"
                                            className="text-xs"
                                            tick={{ fill: '#6b7280' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(0,0,0,0.8)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fff'
                                            }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: '#b30c25', marginBottom: '0.5rem', fontWeight: 'bold' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Line
                                            type="monotone"
                                            dataKey="resultado"
                                            name="Marca / Evaluacion / Puntaje"
                                            stroke="#b30c25"
                                            strokeWidth={3}
                                            activeDot={{ r: 8, fill: '#fff', stroke: '#b30c25', strokeWidth: 2 }}
                                            dot={{ r: 4, fill: '#b30c25', strokeWidth: 0 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Tabla 1: Competencias */}
                        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-gray-200 dark:border-[#332122] shadow-sm">
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
                                        {data.filter(i => i.source === 'COMPETENCIA').map((item) => (
                                            <tr key={`${item.source}-${item.original.id}`} className="hover:bg-gray-50 dark:hover:bg-[#212121]">
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.date}</td>
                                                <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{item.name}</td>
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{item.tipo}</td>
                                                <td className="px-4 py-3 text-gray-900 dark:text-white font-mono font-bold">
                                                    {item.resultado} {item.unit}
                                                </td>
                                            </tr>
                                        ))}
                                        {data.filter(i => i.source === 'COMPETENCIA').length === 0 && (
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

                        {/* Tabla 2: Pruebas (Tests) */}
                        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-gray-200 dark:border-[#332122] shadow-sm">
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
                                        {data.filter(i => i.source === 'PRUEBA').map((item) => (
                                            <tr key={`${item.source}-${item.original.id}`} className="hover:bg-gray-50 dark:hover:bg-[#212121]">
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.date}</td>
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                        Test Físico
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{item.tipo}</td>
                                                <td className="px-4 py-3 text-gray-900 dark:text-white font-mono font-bold">
                                                    {item.resultado} {item.unit}
                                                </td>
                                            </tr>
                                        ))}
                                        {data.filter(i => i.source === 'PRUEBA').length === 0 && (
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

                        {/* Tabla 3: Entrenamientos (Training) - NEW */}
                        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-gray-200 dark:border-[#332122] shadow-sm">
                            <h3 className="text-gray-900 dark:text-white font-bold mb-4 flex items-center gap-2 text-lg">
                                <Dumbbell size={20} className="text-green-500" />
                                Historial de Entrenamientos
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-[#121212] border-b border-gray-200 dark:border-[#332122]">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Fecha</th>
                                            <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Tipo Entrenamiento</th>
                                            <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Evaluación / Resultado</th>
                                            <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Observaciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-[#332122]">
                                        {data.filter(i => i.source === 'ENTRENAMIENTO').map((item) => (
                                            <tr key={`${item.source}-${item.original.id}`} className="hover:bg-gray-50 dark:hover:bg-[#212121]">
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.date}</td>
                                                <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                                                    {item.tipo}
                                                </td>
                                                <td className="px-4 py-3 text-gray-900 dark:text-white font-mono font-bold">
                                                    {item.resultado} {item.unit}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 italic truncate max-w-xs">
                                                    {item.original.observaciones || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                        {data.filter(i => i.source === 'ENTRENAMIENTO').length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 italic">
                                                    No hay resultados de entrenamientos registrados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        );
    };

    const renderGeneralTab = () => {
        // Top results (simplified)
        // Apply filters first
        const filtered = getFilteredResults();

        const sortedResults = [...filtered]
            .sort((a, b) => parseFloat(b.resultado) - parseFloat(a.resultado))
            .slice(0, 10)
            .map(r => {
                const atleta = atletas.find(a => a.id === r.atleta_id);
                return {
                    name: atleta ? `${atleta.first_name} ${atleta.last_name}` : 'Atleta Desconocido',
                    resultado: parseFloat(r.resultado), // Ensure number
                    competencia: r.competencia?.nombre || 'Competencia',
                    unit: r.unidad_medida
                };
            });

        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-gray-200 dark:border-[#332122] shadow-sm">
                    <h3 className="text-gray-900 dark:text-white font-bold mb-6 flex items-center gap-2 text-lg">
                        <Trophy size={20} className="text-yellow-500" />
                        Top 10 Mejores Marcas (General)
                    </h3>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sortedResults} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#333]" />
                                <XAxis type="number" stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={150}
                                    stroke="#6b7280"
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(179, 12, 37, 0.1)' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar
                                    dataKey="resultado"
                                    name="Marca/Puntaje"
                                    fill="#fbbf24"
                                    radius={[0, 4, 4, 0]}
                                    barSize={24}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const renderComparativoTab = () => {
        const filtered = getFilteredResults();
        // Comparative logic of first 3 unique athletes in the filtered set
        const uniqueAthleteIds = [...new Set(filtered.map(r => r.atleta_id))].slice(0, 3);

        if (uniqueAthleteIds.length === 0) {
            return (
                <div className="text-center text-gray-400 py-20 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#332122] shadow-sm">
                    <Users size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                    No hay suficientes datos para comparar.
                </div>
            );
        }

        const series = uniqueAthleteIds.map((id, index) => {
            const athlete = atletas.find(a => a.id === id);
            const rawData = getAthleteData(id);
            const color = ['#b30c25', '#fbbf24', '#3b82f6'][index % 3];
            return {
                id,
                name: athlete ? athlete.first_name : `Atleta ${id}`,
                data: rawData,
                color
            };
        });

        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-gray-200 dark:border-[#332122] shadow-sm">
                    <h3 className="text-gray-900 dark:text-white font-bold mb-6 flex items-center gap-2 text-lg">
                        <Users size={20} className="text-blue-500" />
                        Comparativo de Rendimiento
                    </h3>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#333]" />
                                <XAxis
                                    dataKey="date"
                                    type="category"
                                    allowDuplicatedCategory={true}
                                    stroke="#6b7280"
                                    tick={{ fill: '#6b7280' }}
                                />
                                <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                {series.map(s => (
                                    <Line
                                        key={s.id}
                                        data={s.data}
                                        type="monotone"
                                        dataKey="resultado"
                                        name={s.name}
                                        stroke={s.color}
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 0, fill: s.color }}
                                        activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-gray-500 text-sm mt-6 text-center italic">
                        Comparando resultados recientes de los primeros atletas encontrados.
                    </p>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center transition-colors">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-[#b30c25] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Cargando métricas...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex flex-col items-center justify-center p-6 text-center transition-colors">
                <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-2xl border border-gray-200 dark:border-[#332122] shadow-lg max-w-md">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error de Carga</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#b30c25] hover:bg-[#920a1e] text-white rounded-xl font-bold transition-all shadow-lg shadow-red-900/20 active:scale-95"
                    >
                        <RefreshCw size={18} />
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 font-['Lexend'] p-6 md:p-10 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                            Métricas de Rendimiento
                        </h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            Análisis detallado de puntajes y evolución por fechas.
                        </p>
                    </div>

                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-200 dark:border-[#332122] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-bold">
                        <Filter size={20} className="text-[#b30c25]" />
                        <span>Filtros:</span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 flex-1 w-full md:w-auto">
                        {/* Filter Competencia */}
                        <div className="flex-1">
                            <select
                                value={selectedCompetencia}
                                onChange={(e) => setSelectedCompetencia(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white border border-gray-200 dark:border-[#332122] rounded-lg p-2.5 focus:ring-2 focus:ring-[#b30c25] outline-none"
                            >
                                <option value="">Todas las Competencias</option>
                                {competencias.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filter Prueba */}
                        <div className="flex-1">
                            <select
                                value={selectedPrueba}
                                onChange={(e) => setSelectedPrueba(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white border border-gray-200 dark:border-[#332122] rounded-lg p-2.5 focus:ring-2 focus:ring-[#b30c25] outline-none"
                            >
                                <option value="">Todas las Pruebas</option>
                                {pruebas.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Reset Filters */}
                        {(selectedCompetencia || selectedPrueba) && (
                            <button
                                onClick={() => {
                                    setSelectedCompetencia('');
                                    setSelectedPrueba('');
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#212121] text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
                            >
                                <FilterX size={18} />
                                <span className="hidden md:inline">Limpiar</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-[#332122]">
                    <div className="flex gap-1 overflow-x-auto pb-1">
                        {[
                            { id: 'individual', label: 'Individual', icon: User },
                            { id: 'general', label: 'General', icon: Activity },
                            { id: 'comparativo', label: 'Comparativo', icon: Users }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-6 py-3 font-bold text-sm whitespace-nowrap rounded-t-xl transition-all
                                    ${activeTab === tab.id
                                        ? 'bg-white dark:bg-[#1a1a1a] text-[#b30c25] border-x border-t border-gray-200 dark:border-[#332122] shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#212121]'}
                                `}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="animate-in fade-in duration-500">
                    {activeTab === 'individual' && renderIndividualTab()}
                    {activeTab === 'general' && renderGeneralTab()}
                    {activeTab === 'comparativo' && renderComparativoTab()}
                </div>
            </div>
        </div>
    );
};

export default RendimientoPage;
