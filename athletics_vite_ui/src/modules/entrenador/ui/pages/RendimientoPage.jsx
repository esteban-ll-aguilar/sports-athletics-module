import React, { useState, useEffect, useMemo } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { User, Activity, Trophy, TrendingUp, Users } from 'lucide-react';
import ResultadoCompetenciaService from '../../../competencia/services/resultado_competencia_service';
import AtletaService from '../../../atleta/services/AtletaService';
import { format, parseISO, isValid } from 'date-fns';

const RendimientoPage = () => {
    const [activeTab, setActiveTab] = useState('individual'); // individual, general, comparativo
    const [loading, setLoading] = useState(true);
    const [resultados, setResultados] = useState([]);
    const [atletas, setAtletas] = useState([]);
    const [selectedAtleta, setSelectedAtleta] = useState('');
    const [error, setError] = useState(null);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch independently to pinpoint failures
                let resResultados = { items: [] };
                let resAtletas = { items: [] };

                try {
                    const resp = await ResultadoCompetenciaService.getAll();
                    console.log("Resultados Service Response:", resp);
                    resResultados = resp.data || resp; // Handle both wrapped and unwrapped just in case
                } catch (e) {
                    console.error("Error fetching results", e);
                }

                try {
                    const resp = await AtletaService.getAthletes(1, 100);
                    console.log("Atletas Service Response:", resp);
                    resAtletas = resp.data || resp;
                } catch (e) {
                    console.error("Error fetching athletes", e);
                }

                const itemsResultados = resResultados.items || (Array.isArray(resResultados) ? resResultados : []);
                const itemsAtletas = resAtletas.items || (Array.isArray(resAtletas) ? resAtletas : []);

                setResultados(itemsResultados);
                setAtletas(itemsAtletas);

                // Default select first available athlete
                if (itemsAtletas.length > 0) {
                    setSelectedAtleta(itemsAtletas[0].id);
                }

            } catch (err) {
                console.error("Critical Error in RendimientoPage:", err);
                setError("Ocurrió un error al cargar los datos. Por favor intenta de nuevo.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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
    const getAthleteData = (atletaId) => {
        if (!atletaId) return [];

        // Filter results for this athlete and sort by date
        const athleteResults = resultados
            .filter(r => {
                const rAtletaId = r.atleta_id || r.atleta?.id;
                return String(rAtletaId) === String(atletaId);
            })
            .sort((a, b) => new Date(a.fecha_registro || a.created_at) - new Date(b.fecha_registro || b.created_at));

        return athleteResults.map((r, index) => ({
            name: r.competencia?.nombre || `Evento ${index + 1}`,
            resultado: parseFloat(r.resultado), // Ensure number
            unit: r.unidad_medida,
            date: getDate(r),
            tipo: r.prueba?.nombre || r.unit || 'Prueba',
            original: r
        }));
    };

    const renderIndividualTab = () => {
        const data = getAthleteData(selectedAtleta);

        // Split data by unit/type if needed, or just show all points.
        // For "Score" vs "Date", we typically map `resultado` to Y and `date` to X.

        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center bg-[#1a1a1a] p-4 rounded-xl border border-[#332122]">
                    <User className="text-gray-400" />
                    <label className="text-gray-300 font-medium whitespace-nowrap">Seleccionar Atleta:</label>
                    <select
                        value={selectedAtleta}
                        onChange={(e) => setSelectedAtleta(e.target.value)}
                        className="bg-[#121212] text-white border border-[#332122] rounded-lg p-2 flex-1 w-full md:w-auto"
                    >
                        {atletas.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.first_name} {a.last_name} ({a.username})
                            </option>
                        ))}
                    </select>
                </div>

                {data.length === 0 ? (
                    <div className="text-center text-gray-400 py-10 bg-[#1a1a1a] rounded-xl border border-[#332122]">
                        <p>No hay resultados registrados para este atleta.</p>
                        <p className="text-sm mt-2 text-gray-500">Registra resultados en la sección de Competencias para ver estadísticas.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {/* Line Chart - Score vs Date */}
                        <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#332122]">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <TrendingUp size={20} className="text-[#b30c25]" />
                                Historial de Rendimiento (Puntaje/Marca vs Fecha)
                            </h3>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                                        <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#000', border: '1px solid #332122', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: '#b30c25', marginBottom: '0.5rem' }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="resultado"
                                            name="Resultado / Puntaje"
                                            stroke="#b30c25"
                                            strokeWidth={3}
                                            activeDot={{ r: 6, fill: '#fff', stroke: '#b30c25' }}
                                            dot={{ r: 4, fill: '#b30c25' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">* Muestra todos los resultados. Eje Y varía según la unidad de medida (Metros, Segundos, Puntos).</p>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderGeneralTab = () => {
        // Top results (simplified)
        // Sort items by score descending (assuming higher is better for Points/Meters, ignore Seconds logic for now)
        const sortedResults = [...resultados]
            .sort((a, b) => parseFloat(b.resultado) - parseFloat(a.resultado))
            .slice(0, 10)
            .map(r => {
                const atleta = atletas.find(a => a.id === r.atleta_id);
                return {
                    name: atleta ? `${atleta.first_name} ${atleta.last_name}` : 'Atleta Desconocido',
                    resultado: r.resultado,
                    competencia: r.competencia?.nombre || 'Competencia',
                    unit: r.unidad_medida
                };
            });

        return (
            <div className="space-y-6">
                <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#332122]">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Trophy size={20} className="text-yellow-500" />
                        Top 10 Mejores Marcas (General)
                    </h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sortedResults} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis type="number" stroke="#9ca3af" />
                                <YAxis dataKey="name" type="category" width={150} stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #332122', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Bar dataKey="resultado" name="Marca/Puntaje" fill="#fbbf24" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const renderComparativoTab = () => {
        // Comparative logic of first 3 athletes
        const uniqueAthleteIds = [...new Set(resultados.map(r => r.atleta_id))].slice(0, 3);

        if (uniqueAthleteIds.length === 0) {
            return <div className="text-center text-gray-400 py-10">No hay suficientes datos para comparar.</div>;
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
                <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#332122]">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Users size={20} className="text-blue-500" />
                        Comparativo de Rendimiento
                    </h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" type="category" allowDuplicatedCategory={true} stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #332122' }} itemStyle={{ color: '#fff' }} />
                                <Legend />
                                {series.map(s => (
                                    <Line
                                        key={s.id}
                                        data={s.data}
                                        type="monotone"
                                        dataKey="resultado"
                                        name={s.name}
                                        stroke={s.color}
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-gray-500 text-sm mt-4 text-center">
                        Comparando resultados recientes de los primeros atletas encontrados.
                    </p>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                <div className="text-[#b30c25] text-xl font-medium animate-pulse">Cargando métricas...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-red-900/20 text-red-500 p-6 rounded-xl border border-red-900/50 max-w-md">
                    <Activity size={48} className="mx-auto mb-4 opacity-50" />
                    <h2 className="text-xl font-bold mb-2">Error de Carga</h2>
                    <p>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-6 py-2 bg-[#b30c25] hover:bg-[#8f0a1e] text-white rounded-lg transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121212] text-gray-200 font-['Lexend'] p-4 md:p-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Métricas de Rendimiento</h1>
                    <p className="text-gray-400">Análisis detallado de puntajes y evolución por fechas.</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-[#332122] pb-1">
                <button
                    onClick={() => setActiveTab('individual')}
                    className={`px-4 py-2 font-medium transition-colors rounded-t-lg ${activeTab === 'individual'
                        ? 'bg-[#1a1a1a] text-[#b30c25] border-x border-t border-[#332122]'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]/50'
                        }`}
                >
                    Individual
                </button>
                <button
                    onClick={() => setActiveTab('general')}
                    className={`px-4 py-2 font-medium transition-colors rounded-t-lg ${activeTab === 'general'
                        ? 'bg-[#1a1a1a] text-[#b30c25] border-x border-t border-[#332122]'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]/50'
                        }`}
                >
                    General
                </button>
                <button
                    onClick={() => setActiveTab('comparativo')}
                    className={`px-4 py-2 font-medium transition-colors rounded-t-lg ${activeTab === 'comparativo'
                        ? 'bg-[#1a1a1a] text-[#b30c25] border-x border-t border-[#332122]'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]/50'
                        }`}
                >
                    Comparativo
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[500px] animate-in fade-in duration-500">
                {activeTab === 'individual' && renderIndividualTab()}
                {activeTab === 'general' && renderGeneralTab()}
                {activeTab === 'comparativo' && renderComparativoTab()}
            </div>
        </div>
    );
};

export default RendimientoPage;
