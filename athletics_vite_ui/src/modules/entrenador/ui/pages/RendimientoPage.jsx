import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { User, Activity, Trophy, TrendingUp, Users, AlertCircle, RefreshCw } from 'lucide-react';
import ResultadoCompetenciaService from '../../../competencia/services/resultado_competencia_service';
import AtletaService from '../../../atleta/services/AtletaService';
import { format, isValid } from 'date-fns';

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
                    resResultados = resp.data || resp;
                } catch (e) {
                    console.error("Error fetching results", e);
                }

                try {
                    const resp = await AtletaService.getAthletes(1, 100);
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

        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-200 dark:border-[#332122] shadow-sm">
                    <User className="text-gray-400" />
                    <label className="text-gray-700 dark:text-gray-300 font-bold whitespace-nowrap">Seleccionar Atleta:</label>
                    <select
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
                        {atletas.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.first_name} {a.last_name} ({a.username})
                            </option>
                        ))}
                    </select>
                </div>

                {data.length === 0 ? (
                    <div className="text-center text-gray-400 py-10 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#332122] shadow-sm">
                        <Activity size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="font-medium text-gray-500 dark:text-gray-400">No hay resultados registrados para este atleta.</p>
                        <p className="text-sm mt-2 text-gray-400 dark:text-gray-500">Registra resultados en la sección de Competencias para ver estadísticas.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {/* Line Chart - Score vs Date */}
                        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-gray-200 dark:border-[#332122] shadow-sm">
                            <h3 className="text-gray-900 dark:text-white font-bold mb-6 flex items-center gap-2 text-lg">
                                <TrendingUp size={20} className="text-[#b30c25]" />
                                Historial de Rendimiento
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
                                            name="Resultado / Puntaje"
                                            stroke="#b30c25"
                                            strokeWidth={3}
                                            activeDot={{ r: 8, fill: '#fff', stroke: '#b30c25', strokeWidth: 2 }}
                                            dot={{ r: 4, fill: '#b30c25', strokeWidth: 0 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-center text-gray-400 mt-4">* Muestra todos los resultados. Eje Y varía según la unidad de medida (Metros, Segundos, Puntos).</p>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderGeneralTab = () => {
        // Top results (simplified)
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
        // Comparative logic of first 3 athletes
        const uniqueAthleteIds = [...new Set(resultados.map(r => r.atleta_id))].slice(0, 3);

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
