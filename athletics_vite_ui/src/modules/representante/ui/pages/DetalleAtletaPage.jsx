import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RepresentanteService from '../../services/RepresentanteService';
import { Trophy, Medal, ArrowLeft, Activity, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DetalleAtletaPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [historial, setHistorial] = useState([]);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, historialRes] = await Promise.all([
                RepresentanteService.getAtletaEstadisticas(id),
                RepresentanteService.getAtletaHistorial(id)
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (historialRes.success) setHistorial(historialRes.data);

            if (!statsRes.success || !historialRes.success) {
                toast.error(statsRes.message || historialRes.message || "Error parcial al cargar datos.");
            }
        } catch (error) {
            console.error("Error cargando detalles del atleta:", error);
            const errorMsg = error.response?.data?.message || "Error al cargar los datos. Verifique que sea su atleta representado.";
            toast.error(errorMsg);
            navigate("/dashboard/representante/mis-atletas");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[80vh] gap-4">
                <div className="w-12 h-12 border-4 border-[#b30c25] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Cargando detalles...</span>
            </div>
        );
    }

    return (
        <div className="p-6 min-h-screen bg-gray-50 dark:bg-[#121212] transition-colors duration-300 font-['Lexend']">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/dashboard/representante/mis-atletas")}
                            className="p-2 rounded-xl bg-white dark:bg-[#212121] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-[#332122] shadow-sm transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                Detalle de Rendimiento
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Estadísticas y resultados históricos.</p>
                        </div>
                    </div>
                </div>

                {/* Resumen de Estadísticas */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Oro */}
                        <div className="bg-white dark:bg-[#212121] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-[#332122] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Medal size={80} className="text-yellow-500" />
                            </div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Oro</p>
                                    <h3 className="text-4xl font-black text-gray-900 dark:text-white mt-2">{stats.medallas.oro}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 dark:text-yellow-500">
                                    <Medal size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Plata */}
                        <div className="bg-white dark:bg-[#212121] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-[#332122] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Medal size={80} className="text-gray-400" />
                            </div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Plata</p>
                                    <h3 className="text-4xl font-black text-gray-900 dark:text-white mt-2">{stats.medallas.plata}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                                    <Medal size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Bronce */}
                        <div className="bg-white dark:bg-[#212121] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-[#332122] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Medal size={80} className="text-orange-500" />
                            </div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Bronce</p>
                                    <h3 className="text-4xl font-black text-gray-900 dark:text-white mt-2">{stats.medallas.bronce}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-500">
                                    <Medal size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Total Competencias */}
                        <div className="bg-white dark:bg-[#212121] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-[#332122] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Trophy size={80} className="text-blue-500" />
                            </div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Total Eventos</p>
                                    <h3 className="text-4xl font-black text-gray-900 dark:text-white mt-2">{stats.total_competencias}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-500">
                                    <Trophy size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Additional Stats Row */}
                        <div className="md:col-span-2 lg:col-span-4 bg-white dark:bg-[#212121] rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-[#332122] relative overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-500 rounded-xl">
                                        <Activity size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Años de Experiencia</h4>
                                        <p className="text-gray-500 dark:text-gray-400">{stats.experiencia} años activos en competencias</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-gray-100 dark:border-[#332122] pt-4 md:pt-0 md:pl-8">
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-500 rounded-xl">
                                        <TrendingUp size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Efectividad de Podio</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-24 bg-gray-200 dark:bg-[#332122] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-purple-500"
                                                    style={{ width: `${stats.total_competencias > 0 ? ((stats.medallas.oro + stats.medallas.plata + stats.medallas.bronce) / stats.total_competencias) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                {stats.total_competencias > 0
                                                    ? `${Math.round(((stats.medallas.oro + stats.medallas.plata + stats.medallas.bronce) / stats.total_competencias) * 100)}%`
                                                    : "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Historial Card */}
                <div className="bg-white dark:bg-[#212121] rounded-2xl shadow-sm border border-gray-200 dark:border-[#332122] overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 dark:border-[#332122] flex justify-between items-center bg-gray-50/50 dark:bg-[#252525]">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-red-50 dark:bg-[#b30c25]/10 text-[#b30c25] rounded-lg">
                                <Clock size={20} />
                            </div>
                            Historial de Resultados
                        </h2>
                        <span className="text-xs font-semibold px-3 py-1 bg-gray-200 dark:bg-[#332122] text-gray-600 dark:text-gray-400 rounded-full">
                            Total: {historial.length}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#332122]">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Competencia</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prueba</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resultado</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Posición</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-[#332122]">
                                {historial.length > 0 ? (
                                    historial.map((item) => {
                                        const getPosicionStyles = (posicion) => {
                                            const styles = {
                                                primero: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/50',
                                                segundo: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-600/50',
                                                tercero: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900/50'
                                            };
                                            return styles[posicion] || 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30';
                                        };

                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2829] transition-colors">
                                                <td className="px-6 py-5 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                    {new Date(item.fecha_registro).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-5 text-gray-600 dark:text-gray-400">
                                                    <span className="font-semibold block text-gray-800 dark:text-gray-200 mb-0.5">Competencia #{item.competencia_id}</span>
                                                </td>
                                                <td className="px-6 py-5 text-gray-600 dark:text-gray-400">
                                                    Prueba #{item.prueba_id}
                                                </td>
                                                <td className="px-6 py-5 font-mono font-bold text-[#b30c25]">
                                                    {item.resultado} <span className="text-xs text-gray-500 font-normal ml-0.5">{item.unidad_medida}</span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className={`
                                                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize
                                                        ${getPosicionStyles(item.posicion_final)}
                                                    `}>
                                                        {item.posicion_final}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${item.estado
                                                        ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30'
                                                        : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${item.estado ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                        {item.estado ? 'Validado' : 'Anulado'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <AlertCircle size={40} className="text-gray-300 dark:text-gray-600" />
                                                <span className="text-gray-500 dark:text-gray-400 font-medium">Este atleta aún no tiene resultados registrados.</span>
                                            </div>
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

export default DetalleAtletaPage;
