import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RepresentanteService from '../../services/RepresentanteService';
import AtletaService from '@modules/atleta/services/AtletaService'; // Para info basica si se necesita
import { Table, Card, Spinner, Badge, Button, Timeline } from 'flowbite-react';
import { Trophy, Medal, ArrowLeft, Calendar, Activity, TrendingUp } from 'lucide-react';
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
            <div className="flex justify-center items-center h-screen">
                <Spinner size="xl" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Button color="light" size="sm" onClick={() => navigate("/dashboard/representante/mis-atletas")}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Volver
                </Button>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                    Detalle de Rendimiento
                </h1>
            </div>

            {/* Resumen de Estadísticas */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="border-l-4 border-yellow-400">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Oro</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.medallas.oro}</h3>
                            </div>
                            <Medal className="h-10 w-10 text-yellow-400" />
                        </div>
                    </Card>
                    <Card className="border-l-4 border-gray-400">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Plata</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.medallas.plata}</h3>
                            </div>
                            <Medal className="h-10 w-10 text-gray-400" />
                        </div>
                    </Card>
                    <Card className="border-l-4 border-orange-400">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Bronce</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.medallas.bronce}</h3>
                            </div>
                            <Medal className="h-10 w-10 text-orange-400" />
                        </div>
                    </Card>
                    <Card className="border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Competencias</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.total_competencias}</h3>
                            </div>
                            <Trophy className="h-10 w-10 text-blue-500" />
                        </div>
                    </Card>

                    <Card className="md:col-span-2 lg:col-span-4 border-t-4 border-purple-500">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Activity className="h-8 w-8 text-green-500" />
                                <div>
                                    <h4 className="text-lg font-semibold">Experiencia</h4>
                                    <p className="text-gray-600">{stats.experiencia} años activos</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-8 w-8 text-purple-500" />
                                <div>
                                    <h4 className="text-lg font-semibold">Efectividad de Podio</h4>
                                    <p className="text-gray-600">
                                        {stats.total_competencias > 0
                                            ? `${Math.round(((stats.medallas.oro + stats.medallas.plata + stats.medallas.bronce) / stats.total_competencias) * 100)}%`
                                            : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Historial */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="h-6 w-6" />
                        Historial de Resultados
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    {historial.length > 0 ? (
                        <Table hoverable>
                            <Table.Head>
                                <Table.HeadCell>Fecha</Table.HeadCell>
                                <Table.HeadCell>Competencia</Table.HeadCell>
                                <Table.HeadCell>Prueba</Table.HeadCell>
                                <Table.HeadCell>Resultado</Table.HeadCell>
                                <Table.HeadCell>Posición</Table.HeadCell>
                                <Table.HeadCell>Estado</Table.HeadCell>
                            </Table.Head>
                            <Table.Body className="divide-y">
                                {historial.map((item) => (
                                    <Table.Row key={item.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                            {new Date(item.fecha_registro).toLocaleDateString()}
                                        </Table.Cell>
                                        <Table.Cell>Competencia #{item.competencia_id}</Table.Cell>
                                        <Table.Cell>Prueba #{item.prueba_id}</Table.Cell>
                                        <Table.Cell>{item.resultado} {item.unidad_medida}</Table.Cell>
                                        <Table.Cell>
                                            <Badge color={
                                                item.posicion_final.includes('primero') ? 'yellow' :
                                                    item.posicion_final.includes('segundo') ? 'gray' :
                                                        item.posicion_final.includes('tercero') ? 'orange' : 'info'
                                            }>
                                                {item.posicion_final.toUpperCase()}
                                            </Badge>
                                        </Table.Cell>
                                        <Table.Cell>
                                            {item.estado ? (
                                                <Badge color="success">Validado</Badge>
                                            ) : (
                                                <Badge color="failure">Anulado</Badge>
                                            )}
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            Este atleta aún no tiene resultados registrados.
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default DetalleAtletaPage;
