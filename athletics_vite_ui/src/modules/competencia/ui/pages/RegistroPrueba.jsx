import { useEffect, useState } from "react";
import resultadoPruebaService from "../../services/resultado_prueba_service";
import competenciaService from "../../services/competencia_service";
import AtletaService from "../../../atleta/services/AtletaService";
import PruebaRepository from "../../services/prueba_service";
import baremoService from "../../services/baremo_service";
import RegistroPruebaModal from "../widgets/RegistroPruebaModal";
import Swal from "sweetalert2";
import { Plus, Search, Filter, Calendar, User, Trophy, Activity, Clipboard, CheckCircle, Power, Edit2, AlertCircle } from 'lucide-react';

const RegistroPruebasPage = () => {
    const [resultados, setResultados] = useState([]);
    const [atletas, setAtletas] = useState([]);
    const [pruebas, setPruebas] = useState([]);
    const [baremos, setBaremos] = useState([]);
    const [competencias, setCompetencias] = useState([]);

    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Cargar Datos
    const fetchData = async () => {
        setLoading(true);
        try {
            const [resResultados, resAtletas, resPruebas, resBaremos, resComp] = await Promise.all([
                resultadoPruebaService.getAll(),
                AtletaService.getAthletes(1, 200),
                PruebaRepository.getAll(),
                baremoService.getAll(),
                competenciaService.getAll()
            ]);

            setResultados(Array.isArray(resResultados) ? resResultados : resResultados.data || []);
            setAtletas(Array.isArray(resAtletas) ? resAtletas : resAtletas.items || resAtletas.data || []);
            setPruebas(Array.isArray(resPruebas) ? resPruebas : resPruebas?.data || []);
            setBaremos(Array.isArray(resBaremos) ? resBaremos : resBaremos?.data || []);
            setCompetencias(Array.isArray(resComp) ? resComp : resComp.data || []);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Helpers para resolver Nombres
    const getAtletaName = (atletaId, atletaUserId) => {
        if (atletaUserId) {
            const user = atletas.find(x => x.id === atletaUserId || x.auth_user_id === atletaUserId);
            if (user && user.first_name && user.last_name) {
                return `${user.first_name} ${user.last_name}`;
            }
        }
        const a = atletas.find(x =>
            x.id === atletaId ||
            x.external_id === atletaId ||
            x.auth_user_id === atletaId
        );
        const atletaByIndex = !a && atletaId <= atletas.length ? atletas[atletaId - 1] : null;
        const atleta = a || atletaByIndex;

        if (!atleta) return `ID: ${atletaId}`;
        return atleta.first_name && atleta.last_name ? `${atleta.first_name} ${atleta.last_name}` : `ID: ${atletaId}`;
    };

    const getPruebaName = (id) => {
        const p = pruebas.find(x => x.id === id || x.external_id === id);
        return p ? p.nombre : `ID: ${id}`;
    };

    const getBaremoInfo = (id) => {
        const b = baremos.find(x => x.id === id);
        return b ? `Baremo #${b.id} ` : `ID: ${id}`;
    };

    const getPruebaUnit = (id) => {
        const p = pruebas.find(x => x.id === id || x.external_id === id);
        if (!p) return "";
        if (p.tipo_medicion === "TIEMPO") {
            return "SEGUNDOS";
        } else if (p.tipo_medicion === "DISTANCIA") {
            return "METROS";
        }
        return p.unidad_medida || "";
    };

    const handleSave = async (data) => {
        try {
            if (selectedItem) {
                await resultadoPruebaService.update(selectedItem.external_id, data);
            } else {
                await resultadoPruebaService.create(data);
            }
            fetchData();
            return true;
        } catch (error) {
            console.error("Error completo:", error);
            const errorMsg = error.response?.data?.detail || error.message || "No se pudo guardar";
            Swal.fire({
                title: "Error",
                text: errorMsg,
                icon: "error",
                confirmButtonColor: '#b30c25',
                background: '#1a1a1a',
                color: '#fff'
            });
            return false;
        }
    };

    const handleEdit = (row) => {
        let atleta = null;
        if (row.atleta_user_id) {
            atleta = atletas.find(a => a.id === row.atleta_user_id || a.auth_user_id === row.atleta_user_id);
        }
        if (!atleta) {
            atleta = atletas.find(a => a.id === row.atleta_id);
        }
        if (!atleta && row.atleta_id <= atletas.length) {
            atleta = atletas[row.atleta_id - 1];
        }

        const prueba = pruebas.find(p => p.id === row.prueba_id);

        const enrichedRow = {
            ...row,
            atleta_external_id: atleta?.external_id || "",
            prueba_external_id: prueba?.external_id || row.prueba_id
        };

        setSelectedItem(enrichedRow);
        setShowModal(true);
    };


    const handleDelete = async (item) => {
        const nuevoEstado = !item.estado;
        try {
            await resultadoPruebaService.update(item.external_id, { ...item, estado: nuevoEstado });
            fetchData();
            Swal.fire({
                title: 'Actualizado',
                text: `Estado cambiado a ${nuevoEstado ? 'Activo' : 'Inactivo'}`,
                icon: 'success',
                confirmButtonColor: '#b30c25',
                background: '#1a1a1a',
                color: '#fff'
            });
        } catch (e) {
            Swal.fire({
                title: 'Error',
                text: "No se pudo cambiar estado",
                icon: 'error',
                confirmButtonColor: '#b30c25',
                background: '#1a1a1a',
                color: '#fff'
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] p-6 font-['Lexend'] text-gray-900 dark:text-gray-200 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
                    <div className="space-y-1">
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                            Resultados de Pruebas
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg mt-1">
                            Vista detallada de los registros y marcas de los atletas.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <button
                            onClick={() => { setSelectedItem(null); setShowModal(true); }}
                            className="
                                group flex items-center justify-center gap-2
                                px-6 py-3 rounded-xl
                                text-sm font-bold text-white
                                bg-linear-to-r from-[#b30c25] to-[#80091b]
                                hover:brightness-110
                                shadow-lg shadow-red-900/20 active:scale-95
                                transition-all duration-300
                            "
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            Nuevo Resultado
                        </button>
                    </div>
                </div>

                {/* Search Bar (Optional, added for UI consistency) */}
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por atleta o prueba..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="
                            w-full pl-12 pr-4 py-3 rounded-xl 
                            bg-white dark:bg-[#212121]
                            border border-gray-200 dark:border-[#332122]
                            text-gray-900 dark:text-gray-100
                            placeholder-gray-400 dark:placeholder-gray-500
                             focus:border-[#b30c25] focus:ring-1 focus:ring-[#b30c25]/30
                            outline-none transition-all shadow-sm
                        "
                    />
                </div>

                {/* Tabla */}
                <div className="bg-white dark:bg-[#212121] rounded-2xl border border-gray-200 dark:border-[#332122] shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#332122]">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Atleta</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prueba</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Baremo</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Marca</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clasif.</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Estado</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-[#332122]">
                                {loading ? (
                                    <tr><td colSpan="9" className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando datos...</td></tr>
                                ) : resultados.length === 0 ? (
                                    <tr><td colSpan="9" className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Clipboard size={32} />
                                            <span>No hay resultados registrados</span>
                                        </div>
                                    </td></tr>
                                ) : (
                                    resultados.filter(r =>
                                        !searchTerm ||
                                        getAtletaName(r.atleta_id, r.atleta_user_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        getPruebaName(r.prueba_id).toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map(row => (
                                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2829] transition-colors">
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-500">#{row.id}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                <User size={16} className="text-gray-400" />
                                                {getAtletaName(row.atleta_id, row.atleta_user_id)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <Activity size={16} className="text-gray-400" />
                                                    {getPruebaName(row.prueba_id)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{getBaremoInfo(row.baremo_id)}</td>
                                            <td className="px-6 py-4 font-mono text-[#b30c25] font-bold">{row.marca_obtenida} {getPruebaUnit(row.prueba_id)}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-[#333] rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-[#444]">
                                                    {row.clasificacion_final}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {row.fecha ? new Date(row.fecha).toLocaleDateString() : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border
                                                    ${row.estado
                                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-900/30'
                                                        : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-900/30'
                                                    }`}>
                                                    {row.estado ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleEdit(row)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(row)} className={`p-2 rounded-lg transition-colors ${row.estado
                                                        ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                        : 'text-green-500 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                        }`}>
                                                        {row.estado ? <Power size={16} /> : <CheckCircle size={16} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Modal Especializado de Registro de Pruebas */}
            <RegistroPruebaModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSave}
                editingItem={selectedItem}
                competencias={competencias}
                atletas={atletas}
                pruebas={pruebas}
            />
        </div>
    );
};

export default RegistroPruebasPage;
