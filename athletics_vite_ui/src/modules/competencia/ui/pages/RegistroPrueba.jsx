import { useEffect, useState } from "react";
import resultadoPruebaService from "../../services/resultado_prueba_service";
import competenciaService from "../../services/competencia_service";
import AtletaService from "../../../atleta/services/AtletaService";
import PruebaRepository from "../../services/prueba_service";
import baremoService from "../../services/baremo_service";
import RegistroPruebaModal from "../widgets/RegistroPruebaModal";
import Swal from "sweetalert2";

const RegistroPruebasPage = () => {
    const [resultados, setResultados] = useState([]);
    const [atletas, setAtletas] = useState([]);
    const [pruebas, setPruebas] = useState([]);
    const [baremos, setBaremos] = useState([]);
    const [competencias, setCompetencias] = useState([]);

    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

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

            // Debug: Check data structure
            console.log("📊 Atletas data:", resAtletas.items?.[0]);
            console.log("📊 Resultado data:", resResultados[0]);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Helpers para resolver Nombres
    const getAtletaName = (atletaId, atletaUserId) => {
        // If backend provides atleta_user_id, use it to find the user
        if (atletaUserId) {
            const user = atletas.find(x => x.id === atletaUserId || x.auth_user_id === atletaUserId);
            if (user && user.first_name && user.last_name) {
                return `${user.first_name} ${user.last_name}`;
            }
        }

        // Fallback: try other matching strategies
        const a = atletas.find(x =>
            x.id === atletaId ||
            x.external_id === atletaId ||
            x.auth_user_id === atletaId
        );

        // Last resort: try by index
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

        // Return unit based on tipo_medicion
        if (p.tipo_medicion === "TIEMPO") {
            return "s"; // segundos
        } else if (p.tipo_medicion === "DISTANCIA") {
            return "m"; // metros
        }
        return p.unidad_medida || "";
    };

    // Manejadores
    const handleSave = async (data) => {
        try {
            if (selectedItem) {
                await resultadoPruebaService.update(selectedItem.external_id, data);
            } else {
                await resultadoPruebaService.create(data);
            }
            Swal.fire("Éxito", "Registro guardado", "success");
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error("Error completo:", error);
            console.error("Respuesta del servidor:", error.response?.data);
            const errorMsg = error.response?.data?.detail || error.message || "No se pudo guardar";
            Swal.fire({
                title: "Error",
                text: errorMsg,
                icon: "error",
                confirmButtonColor: '#b30c25',
                background: '#212121',
                color: '#fff'
            });
        }
    };

    const handleEdit = (row) => {
        console.log("🔧 handleEdit - Row data:", row);

        // Strategy 1: If backend provides atleta_user_id, use it to find the user
        let atleta = null;
        if (row.atleta_user_id) {
            atleta = atletas.find(a => a.id === row.atleta_user_id || a.auth_user_id === row.atleta_user_id);
            console.log("🔧 Strategy 1 (atleta_user_id) - Atleta encontrado:", atleta);
        }

        // Strategy 2: Try to find by numeric ID match
        if (!atleta) {
            atleta = atletas.find(a => a.id === row.atleta_id);
            console.log("🔧 Strategy 2 (direct ID) - Atleta encontrado:", atleta);
        }

        // Strategy 3: Fallback to index-based (atleta.id 1 = first user)
        if (!atleta && row.atleta_id <= atletas.length) {
            atleta = atletas[row.atleta_id - 1];
            console.log("🔧 Strategy 3 (index) - Atleta encontrado:", atleta);
        }

        const prueba = pruebas.find(p => p.id === row.prueba_id);
        console.log("🔧 handleEdit - Prueba encontrada:", prueba);

        const enrichedRow = {
            ...row,
            atleta_external_id: atleta?.external_id || "",
            prueba_external_id: prueba?.external_id || row.prueba_id
        };

        console.log("🔧 handleEdit - Enriched row:", enrichedRow);

        setSelectedItem(enrichedRow);
        setShowModal(true);
    };


    const handleDelete = async (item) => {
        // Logic to toggle status
        try {
            await resultadoPruebaService.update(item.external_id, { ...item, estado: !item.estado });
            fetchData();
        } catch (e) { Swal.fire("Error", "No se pudo cambiar estado", "error"); }
    };

    return (
        <div className="min-h-screen bg-[#121212] p-6 font-['Lexend'] text-gray-200">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black text-white">Resultados de Pruebas</h1>
                        <p className="text-gray-400">Vista detallada de registros (ID, Atleta, Baremo, Marca)</p>
                    </div>
                    <button
                        onClick={() => { setSelectedItem(null); setShowModal(true); }}
                        className="bg-[#b30c25] hover:bg-[#8a0a1d] text-white px-6 py-3 rounded-xl font-bold transition-all"
                    >
                        + Nuevo Resultado
                    </button>
                </div>

                {/* Tabla Estilo RAW (Como la imagen) */}
                <div className="bg-[#1e1e1e] rounded-xl border border-[#333] overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#2a2a2a] text-gray-400 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 border-b border-[#333]">ID</th>
                                    <th className="px-4 py-3 border-b border-[#333]">Atleta (FK)</th>
                                    <th className="px-4 py-3 border-b border-[#333]">Prueba (FK)</th>
                                    <th className="px-4 py-3 border-b border-[#333]">Baremo (FK)</th>
                                    <th className="px-4 py-3 border-b border-[#333]">Marca Utilizada</th>
                                    <th className="px-4 py-3 border-b border-[#333]">Clasificación Final</th>
                                    <th className="px-4 py-3 border-b border-[#333]">Fecha</th>
                                    <th className="px-4 py-3 border-b border-[#333]">Estado</th>
                                    <th className="px-4 py-3 border-b border-[#333] text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#333]">
                                {loading ? (
                                    <tr><td colSpan="9" className="p-8 text-center text-gray-500">Cargando...</td></tr>
                                ) : resultados.length === 0 ? (
                                    <tr><td colSpan="9" className="p-8 text-center text-gray-500">No hay datos</td></tr>
                                ) : (
                                    resultados.map(row => (
                                        <tr key={row.id} className="hover:bg-[#252525] transition-colors">
                                            <td className="px-4 py-3 text-gray-500">#{row.id}</td>
                                            <td className="px-4 py-3 font-medium text-white">{getAtletaName(row.atleta_id, row.atleta_user_id)}</td>
                                            <td className="px-4 py-3 text-gray-300">{getPruebaName(row.prueba_id)}</td>
                                            <td className="px-4 py-3 text-gray-400">{getBaremoInfo(row.baremo_id)}</td>
                                            <td className="px-4 py-3 font-mono text-[#b30c25] font-bold">{row.marca_obtenida} {getPruebaUnit(row.prueba_id)}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-[#333] rounded text-xs font-bold text-white border border-[#444]">
                                                    {row.clasificacion_final}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-400">
                                                {row.fecha ? new Date(row.fecha).toLocaleDateString() + ' ' + new Date(row.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full border ${row.estado ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-red-900/30 border-red-800 text-red-400'}`}>
                                                    {row.estado ? 'TRUE' : 'FALSE'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => handleEdit(row)} className="text-blue-400 hover:text-blue-300 mr-2">Editar</button>
                                                <button onClick={() => handleDelete(row)} className="text-red-400 hover:text-red-300">{row.estado ? 'Desactivar' : 'Activar'}</button>
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
