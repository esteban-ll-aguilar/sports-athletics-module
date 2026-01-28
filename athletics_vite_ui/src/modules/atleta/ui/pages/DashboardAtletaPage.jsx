import React, { useEffect, useState } from 'react';
import AtletaService from '../../services/AtletaService';
import { Table, Card, Spinner, Badge, Timeline } from 'flowbite-react';
import { Trophy, Medal, MapPin, Calendar, Activity, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardAtletaPage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [historial, setHistorial] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsData, historialData] = await Promise.all([
                AtletaService.getEstadisticas(),
                AtletaService.getHistorial()
            ]);
            setStats(statsData.data || { medallas: { oro: 0, plata: 0, bronce: 0 }, total_competencias: 0, experiencia: 0 });
            setHistorial(historialData.data || []);
        } catch (error) {
            console.error("Error cargando dashboard:", error);
            // toast.error("Error al cargar los datos del dashboard"); // Optional suppress
            // Fallback data
            setStats({ medallas: { oro: 0, plata: 0, bronce: 0 }, total_competencias: 0, experiencia: 0 });
            setHistorial([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-[#121212]">
                <Spinner size="xl" color="failure" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] transition-colors duration-300">
            <div className="container mx-auto p-4 space-y-6 pt-6">

                {/* Header with Toggle */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Mi Dashboard Deportivo
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Resumen de tu rendimiento y competencias
                        </p>
                    </div>
                </div>

                {/* Resumen de Estadísticas */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Gold */}
                        <div className="bg-white dark:bg-[#212121] p-6 rounded-2xl shadow-sm border-l-4 border-yellow-400 transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Medallas de Oro</p>
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.medallas?.oro || 0}</h3>
                                </div>
                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                                    <Medal className="h-8 w-8 text-yellow-500" />
                                </div>
                            </div>
                        </div>

                        {/* Silver */}
                        <div className="bg-white dark:bg-[#212121] p-6 rounded-2xl shadow-sm border-l-4 border-gray-400 transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Medallas de Plata</p>
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.medallas?.plata || 0}</h3>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                    <Medal className="h-8 w-8 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Bronze */}
                        <div className="bg-white dark:bg-[#212121] p-6 rounded-2xl shadow-sm border-l-4 border-orange-400 transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Medallas de Bronce</p>
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.medallas?.bronce || 0}</h3>
                                </div>
                                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                                    <Medal className="h-8 w-8 text-orange-500" />
                                </div>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="bg-white dark:bg-[#212121] p-6 rounded-2xl shadow-sm border-l-4 border-blue-500 transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Competencias</p>
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total_competencias}</h3>
                                </div>
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                    <Trophy className="h-8 w-8 text-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* Long Card */}
                        <div className="md:col-span-2 lg:col-span-4 bg-white dark:bg-[#212121] p-6 rounded-2xl shadow-sm border-t-4 border-green-500 transition-colors">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
                                        <Activity className="h-8 w-8 text-green-600 dark:text-green-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Experiencia Acumulada</h4>
                                        <p className="text-gray-500 dark:text-gray-400">{stats.experiencia} años activos en el club</p>
                                    </div>
                                </div>

                                <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                                        <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Rendimiento General</h4>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                                            {stats.total_competencias > 0
                                                ? `${Math.round(((stats.medallas.oro + stats.medallas.plata + stats.medallas.bronce) / stats.total_competencias) * 100)}% de podio`
                                                : "Sin datos suficientes"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Historial Reciente */}
                <div className="bg-white dark:bg-[#212121] rounded-2xl shadow-sm border border-gray-200 dark:border-[#332122] overflow-hidden transition-colors">
                    <div className="p-6 border-b border-gray-200 dark:border-[#332122] flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Calendar className="h-6 w-6 text-[#b30c25]" />
                            Historial de Competencias
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        {historial.length > 0 ? (
                            <Table hoverable theme={{
                                root: {
                                    shadow: "none",
                                    wrapper: "rounded-none"
                                },
                                body: {
                                    cell: {
                                        base: "px-6 py-4 dark:bg-[#212121] dark:text-white"
                                    }
                                }
                            }}>
                                <Table.Head className="bg-gray-50 dark:bg-[#2a2829] text-gray-500 dark:text-gray-400">
                                    <Table.HeadCell className="hover:bg-gray-50 dark:hover:bg-[#2a2829]">Fecha</Table.HeadCell>
                                    <Table.HeadCell className="hover:bg-gray-50 dark:hover:bg-[#2a2829]">Competencia</Table.HeadCell>
                                    <Table.HeadCell className="hover:bg-gray-50 dark:hover:bg-[#2a2829]">Prueba</Table.HeadCell>
                                    <Table.HeadCell className="hover:bg-gray-50 dark:hover:bg-[#2a2829]">Resultado</Table.HeadCell>
                                    <Table.HeadCell className="hover:bg-gray-50 dark:hover:bg-[#2a2829]">Posición</Table.HeadCell>
                                    <Table.HeadCell className="hover:bg-gray-50 dark:hover:bg-[#2a2829]">Estado</Table.HeadCell>
                                </Table.Head>
                                <Table.Body className="divide-y divide-gray-200 dark:divide-[#332122]">
                                    {historial.map((item) => (
                                        <Table.Row key={item.id} className="bg-white dark:bg-[#212121] hover:bg-gray-50 dark:hover:bg-[#2a2829] transition-colors">
                                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                {new Date(item.fecha_registro).toLocaleDateString()}
                                            </Table.Cell>
                                            <Table.Cell className="text-gray-700 dark:text-gray-300">
                                                Competencia #{item.competencia_id}
                                            </Table.Cell>
                                            <Table.Cell className="text-gray-700 dark:text-gray-300">Prueba #{item.prueba_id}</Table.Cell>
                                            <Table.Cell className="text-gray-900 dark:text-white font-mono">{item.resultado} {item.unidad_medida}</Table.Cell>
                                            <Table.Cell>
                                                <Badge color={
                                                    item.posicion_final.includes('primero') ? 'warning' :
                                                        item.posicion_final.includes('segundo') ? 'gray' :
                                                            item.posicion_final.includes('tercero') ? 'failure' : 'info'
                                                } className="text-xs font-bold uppercase w-fit">
                                                    {item.posicion_final}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell>
                                                {item.estado ? (
                                                    <Badge color="success" className="w-fit">Validado</Badge>
                                                ) : (
                                                    <Badge color="failure" className="w-fit">Anulado</Badge>
                                                )}
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        ) : (
                            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                <p>No hay resultados registrados aún.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Próximas Pruebas */}
                <div className="bg-white dark:bg-[#212121] rounded-2xl shadow-sm border border-gray-200 dark:border-[#332122] p-8 transition-colors">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Próximos Eventos</h2>
                    <Timeline>
                        <Timeline.Item>
                            <Timeline.Point icon={Calendar} />
                            <Timeline.Content>
                                <Timeline.Time className="text-gray-500 dark:text-gray-400">Próximamente</Timeline.Time>
                                <Timeline.Title className="text-gray-900 dark:text-white">Calendario de Competencias</Timeline.Title>
                                <Timeline.Body className="text-gray-600 dark:text-gray-400">
                                    El módulo de calendario y horarios estará disponible en breve para que puedas planificar tu temporada.
                                </Timeline.Body>
                            </Timeline.Content>
                        </Timeline.Item>
                    </Timeline>
                </div>

            </div>
        </div>
    );
};

export default DashboardAtletaPage;
