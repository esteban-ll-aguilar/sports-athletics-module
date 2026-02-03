import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Plus, Search, Dumbbell, Ruler, Clock, Star, Edit, Trash2, Filter } from 'lucide-react';
import EntrenamientoService from '../../services/EntrenamientoService';
import resultadoEntrenamientoService from '../../services/resultado_entrenamiento_service';
import atletaService from '../../../atleta/services/AtletaService';
import RegistroResultadoEntrenamientoModal from '../widgets/RegistroResultadoEntrenamientoModal';
import Swal from 'sweetalert2';
import { Power, CheckCircle } from 'lucide-react';


const ResultadosEntrenamientoPage = () => {
    const { id } = useParams(); // Optional ID: if present, filter by it.
    const navigate = useNavigate();

    // Data States
    const [allEntrenamientos, setAllEntrenamientos] = useState([]);
    const [allResultados, setAllResultados] = useState([]);
    const [atletas, setAtletas] = useState([]);

    // UI States
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedResultado, setSelectedResultado] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeEntrenamiento, setActiveEntrenamiento] = useState(null); // Filter by entrenamiento

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [resEntrenamientos, resResultados, resAtletas] = await Promise.all([
                EntrenamientoService.getAll(),
                resultadoEntrenamientoService.getAll(),
                atletaService.getAll() // Fetch ATLETA entities (not users) to get correct external_id
            ]);

            setAllEntrenamientos(Array.isArray(resEntrenamientos) ? resEntrenamientos : []);

            console.log("🏋️ Resultados Entrenamiento:", resResultados);
            if (resResultados && resResultados.length > 0) {
                console.log("🏋️ Primer Resultado:", resResultados[0]);
                console.log("🏋️ Atleta en Resultado:", resResultados[0].atleta);
            }

            setAllResultados(Array.isArray(resResultados) ? resResultados : []);

            const atletasData = Array.isArray(resAtletas) ? resAtletas : resAtletas.items || resAtletas.data || [];
            setAtletas(atletasData);

            // If ID URL param exists, set it as active filter
            if (id && resEntrenamientos) {
                const ent = resEntrenamientos.find(e => e.id.toString() === id || e.external_id === id);
                if (ent) setActiveEntrenamiento(ent);
            }

        } catch (error) {
            console.error(error);
            toast.error('Error al cargar datos');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleCreate = () => {
        setSelectedResultado(null);
        setShowModal(true);
    };

    const handleEdit = (resultado) => {
        setSelectedResultado(resultado);
        setShowModal(true);
    };

    const handleDelete = async (resultId) => {
        if (!window.confirm('¿Eliminar resultado?')) return;
        try {
            await resultadoEntrenamientoService.delete(resultId);
            toast.success('Resultado eliminado');
            loadData();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const handleSave = async (data) => {
        try {
            if (selectedResultado) {
                await resultadoEntrenamientoService.update(selectedResultado.external_id, data);
            } else {
                await resultadoEntrenamientoService.create(data);
            }
            loadData();
            return true;
        } catch (error) {
            console.error("Error al guardar:", error);
            const detail = error.response?.data?.detail || 'Error al guardar';
            toast.error(detail);
            return false;
        }
    };

    // --- Filtering Logic ---
    const filteredResults = allResultados.filter(r => {
        // 1. Text Search (Athlete Name)
        const resultAthlete = atletas.find(a => a.id === r.atleta_id);
        let name = '';
        if (resultAthlete?.user) {
            name = `${resultAthlete.user.first_name} ${resultAthlete.user.last_name}`;
        } else if (resultAthlete) {
            name = `Atleta ${resultAthlete.id}`;
        }
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());

        // 2. Entrenamiento Filter (if active)
        // Adjust ID comparison logic depending on backend response (internal vs external IDs)
        // Usually results have internal `entrenamiento_id`.
        // The `activeEntrenamiento` object has internal `id` and `external_id`.
        let matchesEntrenamiento = true;

        if (activeEntrenamiento) {
            matchesEntrenamiento = (r.entrenamiento_id === activeEntrenamiento.id);
        }

        return matchesSearch && matchesEntrenamiento;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 font-['Lexend'] transition-colors duration-300">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                    <div className="space-y-1">
                        
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                            Resultados de Entrenamientos
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {activeEntrenamiento
                                ? `Filtrado por: ${activeEntrenamiento.tipo_entrenamiento} (${new Date(activeEntrenamiento.fecha_entrenamiento).toLocaleDateString()})`
                                : "Vista general de todos los resultados registrados"
                            }
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {activeEntrenamiento && (
                            <button
                                onClick={() => { setActiveEntrenamiento(null); navigate('/dashboard/entrenamientos/resultados'); }}
                                className="px-4 py-2 bg-gray-200 dark:bg-[#333] hover:bg-gray-300 dark:hover:bg-[#444] rounded-xl text-sm font-semibold transition"
                            >
                                Ver Todos
                            </button>
                        )}
                        <button
                            onClick={handleCreate}
                            className="
                                flex items-center gap-2 px-6 py-3 rounded-xl
                                text-sm font-bold text-white
                                bg-linear-to-r from-[#b30c25] to-[#80091b]
                                hover:brightness-110 shadow-lg shadow-red-900/20
                                active:scale-95 transition-all
                            "
                        >
                            <Plus size={20} />
                            Registrar Resultado
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar atleta..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="
                                w-full pl-12 pr-4 py-3 rounded-xl
                                bg-white dark:bg-[#212121]
                                border border-gray-200 dark:border-[#332122]
                                text-gray-900 dark:text-white
                                focus:ring-2 focus:ring-[#b30c25] outline-none transition-all
                            "
                        />
                    </div>

                    {/* Entrenamiento Filter Dropdown (Optional visual filter helper) */}
                    <div className="relative md:w-1/3">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            value={activeEntrenamiento ? activeEntrenamiento.external_id : ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (!val) {
                                    setActiveEntrenamiento(null);
                                    navigate('/dashboard/entrenamientos/resultados');
                                } else {
                                    const ent = allEntrenamientos.find(x => x.external_id === val);
                                    setActiveEntrenamiento(ent);
                                    // Optional: update URL to match filter, but keep it simple for now
                                }
                            }}
                            className="
                                w-full pl-10 pr-4 py-3 rounded-xl
                                bg-white dark:bg-[#212121]
                                border border-gray-200 dark:border-[#332122]
                                text-gray-900 dark:text-white
                                focus:ring-2 focus:ring-[#b30c25] outline-none appearance-none cursor-pointer
                            "
                        >
                            <option value="">Todos los Entrenamientos</option>
                            {allEntrenamientos.map(ent => (
                                <option key={ent.id} value={ent.external_id}>
                                    {ent.tipo_entrenamiento} ({new Date(ent.fecha_entrenamiento).toLocaleDateString()})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Results List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredResults.map(res => {
                        // Prefer nested objects from backend (Eager Loading), fallback to manual lookup
                        const athlete = res.atleta || atletas.find(a => a.id === res.atleta_id);
                        const entrenamientoReferencia = res.entrenamiento || allEntrenamientos.find(e => e.id === res.entrenamiento_id);

                        return (
                            <div key={res.id} className="bg-white dark:bg-[#212121] p-5 rounded-2xl border border-gray-200 dark:border-[#332122] shadow-sm hover:shadow-md transition-all group relative">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-gray-600 dark:text-white font-bold border border-gray-200 dark:border-gray-700 shadow-sm">
                                            {athlete?.user?.first_name ? athlete.user.first_name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">
                                                {athlete?.user
                                                    ? `${athlete.user.first_name} ${athlete.user.last_name}`
                                                    : 'Atleta Desconocido'
                                                }
                                            </h3>
                                            <p className="text-xs text-gray-400">ID: {athlete?.user?.identificacion || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(res)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#2a2829] rounded-lg text-blue-500"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(res.external_id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#2a2829] rounded-lg text-red-500"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                <div className="mb-3 text-xs font-semibold text-[#b30c25] bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded w-fit">
                                    {entrenamientoReferencia?.tipo_entrenamiento || "Entrenamiento (Sin datos)"}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm py-1 border-b border-gray-100 dark:border-[#332122]">
                                        <span className="text-gray-500 flex items-center gap-2"><Ruler size={14} /> Distancia</span>
                                        <span className="font-semibold">{res.distancia ? `${res.distancia} ${res.unidad_medida}` : '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm py-1 border-b border-gray-100 dark:border-[#332122]">
                                        <span className="text-gray-500 flex items-center gap-2"><Clock size={14} /> Tiempo</span>
                                        <span className="font-semibold">{res.tiempo ? `${res.tiempo} s` : '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm py-1">
                                        <span className="text-gray-500 flex items-center gap-2"><Star size={14} /> Evaluación</span>
                                        <span className="font-bold text-[#b30c25]">{res.evaluacion || '-'} / 10</span>
                                    </div>
                                    {res.observaciones && (
                                        <div className="mt-2 text-xs text-gray-500 bg-gray-50 dark:bg-[#1a1a1a] p-2 rounded-lg italic">
                                            "{res.observaciones}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {filteredResults.length === 0 && (
                        <div className="col-span-full py-10 text-center text-gray-500">
                            {isLoading ? "Cargando..." : "No hay resultados registrados con los filtros actuales."}
                        </div>
                    )}
                </div>

                <RegistroResultadoEntrenamientoModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSave}
                    editingItem={selectedResultado}
                    entrenamiento={activeEntrenamiento} // Pre-select if active
                    entrenamientos={allEntrenamientos} // Pass all options
                    atletas={atletas}
                />
            </div>
        </div>
    );
};

export default ResultadosEntrenamientoPage;
