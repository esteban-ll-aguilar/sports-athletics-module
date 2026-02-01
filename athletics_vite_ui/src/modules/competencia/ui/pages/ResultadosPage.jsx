import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import resultadoCompetenciaService from "../../services/resultado_competencia_service";
import competenciaService from "../../services/competencia_service";
import AtletaService from "../../../atleta/services/AtletaService";
import PruebaRepository from "../../services/prueba_service";
import ResultadoModal from "../widgets/ResultadoModal";
import Swal from "sweetalert2";
import { Plus, Search, Filter, Calendar, User, Trophy, CheckCircle, Power, Edit2, ArrowLeft } from 'lucide-react';

const ResultadosPage = () => {
  const [resultados, setResultados] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [atletas, setAtletas] = useState([]);
  const [pruebas, setPruebas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResultado, setSelectedResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompetencia, setFilterCompetencia] = useState("");

  const fetchResultados = async () => {
    setLoading(true);
    try {
      const response = await resultadoCompetenciaService.getAll();
      let items = [];
      if (Array.isArray(response)) {
        items = response;
      } else if (response.data && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (response.data && Array.isArray(response.data)) {
        items = response.data;
      } else if (response.items && Array.isArray(response.items)) {
        items = response.items;
      }
      setResultados(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompetencias = async () => {
    try {
      const data = await competenciaService.getAll();
      setCompetencias(Array.isArray(data) ? data : data.data || []);
    } catch (err) { }
  };

  const fetchAtletas = async () => {
    try {
      const response = await AtletaService.getAthletes(1, 200);
      setAtletas(response.items || []);
    } catch (err) { }
  };

  const fetchPruebas = async () => {
    try {
      const data = await PruebaRepository.getAll();
      setPruebas(data || []);
    } catch (err) { }
  };

  useEffect(() => {
    fetchResultados();
    fetchCompetencias();
    fetchAtletas();
    fetchPruebas();
  }, []);

  const handleOpenEdit = (resultado) => {
    setSelectedResultado(resultado);
    setIsModalOpen(true);
  };

  const toggleStatus = async (resultado) => {
    const nuevoEstado = !resultado.estado;

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: nuevoEstado
        ? `¿Deseas activar este resultado?`
        : `¿Deseas desactivar este resultado?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#b30c25',
      cancelButtonColor: '#6b7280',
      confirmButtonText: nuevoEstado ? 'Sí, activar' : 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      background: '#1a1a1a',
      color: '#fff',
      customClass: {
        popup: 'dark:bg-[#1a1a1a] dark:text-white dark:border dark:border-[#332122]'
      }
    });

    if (!result.isConfirmed) return;

    try {
      await resultadoCompetenciaService.update(resultado.external_id, {
        ...resultado,
        estado: nuevoEstado
      });
      setResultados(prev => prev.map(item =>
        item.external_id === resultado.external_id
          ? { ...item, estado: nuevoEstado }
          : item
      ));

      Swal.fire({
        title: '¡Éxito!',
        text: nuevoEstado ? 'Activado exitosamente' : 'Desactivado exitoso',
        icon: 'success',
        confirmButtonColor: '#b30c25',
        background: '#1a1a1a',
        color: '#fff'
      });

      fetchResultados();
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Error al cambiar el estado',
        icon: 'error',
        confirmButtonColor: '#b30c25',
        background: '#1a1a1a',
        color: '#fff'
      });
    }
  };

  const getCompetenciaNombre = (competenciaId) => {
    const comp = competencias.find(c => c.id === competenciaId);
    return comp ? comp.nombre : `ID: ${competenciaId}`;
  };

  const getAtletaNombre = (atletaId) => {
    const atleta = atletas.find(a => a.id === atletaId || a.external_id === atletaId);
    return atleta ? `${atleta.first_name || atleta.username} ${atleta.last_name || ""}` : `Atleta: ${atletaId}`;
  };

  const getPruebaNombre = (pruebaId) => {
    const prueba = pruebas.find(p => p.id === pruebaId || p.external_id === pruebaId);
    return prueba ? `${prueba.siglas} - ${prueba.tipo_prueba}` : `Prueba: ${pruebaId}`;
  };

  const getPosicionEmoji = (posicion) => {
    const emojis = {
      'primero': '🥇',
      'segundo': '🥈',
      'tercero': '🥉',
      'cuarto': '4️⃣',
      'quinto': '5️⃣',
      'sexto': '6️⃣',
      'septimo': '7️⃣',
      'octavo': '8️⃣',
      'participante': '👤',
      'descalificado': '❌'
    };
    return emojis[posicion] || '📊';
  };

  const filteredResultados = resultados.filter(res => {
    const matchSearch =
      getAtletaNombre(res.atleta_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCompetenciaNombre(res.competencia_id).toLowerCase().includes(searchTerm.toLowerCase());

    const matchCompetencia = !filterCompetencia || res.competencia_id === parseInt(filterCompetencia);

    return matchSearch && matchCompetencia;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] p-6 font-['Lexend'] text-gray-900 dark:text-gray-200 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
          <div className="space-y-1">
            <Link
              to="/dashboard/competencias"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 font-semibold text-sm mb-2 transition-all duration-200 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-200">
                <ArrowLeft size={18} />
              </span>
              Volver a Gestión Principal
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-gray-100">
              Registro de Resultados
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg mt-1">
              Administra los resultados de las competencias oficiales.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <button
              onClick={() => { setSelectedResultado(null); setIsModalOpen(true); }}
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
              Registrar Resultado
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por atleta o competencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                                w-full pl-12 pr-4 py-4 rounded-2xl
                                bg-white dark:bg-[#1f1c1d]
                                border border-gray-200 dark:border-[#332122]
                                text-gray-900 dark:text-gray-100
                                placeholder-gray-400 dark:placeholder-gray-500
                                focus:border-[#b30c25]
                                focus:ring-1 focus:ring-[#b30c25]/40
                                outline-none transition-all
                                shadow-sm
                            "
            />
          </div>

          {/* Filtro por Competencia */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterCompetencia}
              onChange={(e) => setFilterCompetencia(e.target.value)}
              className="
                                w-full pl-12 pr-4 py-4 rounded-2xl
                                bg-white dark:bg-[#1f1c1d]
                                border border-gray-200 dark:border-[#332122]
                                text-gray-900 dark:text-gray-100
                                focus:border-[#b30c25]
                                focus:ring-1 focus:ring-[#b30c25]/40
                                outline-none transition-all
                                shadow-sm appearance-none
                            "
            >
              <option value="">Todas las Competencias</option>
              {competencias.map(comp => (
                <option key={comp.id} value={comp.id}>
                  {comp.nombre}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Últimos Registros Card */}
        <div className="bg-white dark:bg-[#212121] rounded-2xl border border-gray-200 dark:border-[#332122] shadow-sm overflow-hidden transition-colors">
          <div className="p-6 border-b border-gray-100 dark:border-[#332122] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 dark:bg-red-900/10 rounded-lg text-[#b30c25]">
                <Calendar size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Últimos Registros</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total filtrado: {filteredResultados.length}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#332122]">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Competencia</th>
                  <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Participante</th>
                  <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prueba</th>
                  <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resultado</th>
                  <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Posición</th>
                  <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Estado</th>
                  <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#332122]">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#b30c25] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Cargando Resultados...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredResultados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Trophy size={48} className="text-gray-300 dark:text-gray-600" />
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                          {searchTerm || filterCompetencia
                            ? 'No se encontraron resultados'
                            : 'No hay resultados registrados'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredResultados.map((resultado) => (
                    <tr
                      key={resultado.external_id}
                      className={`transition-colors duration-200 ${!resultado.estado
                        ? 'bg-gray-50/50 dark:bg-[#1a1a1a]/50 opacity-60'
                        : 'hover:bg-gray-50 dark:hover:bg-[#2a2829]'
                        }`}
                    >
                      <td className="px-6 py-5">
                        <div className={`font-bold ${!resultado.estado ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                          {getCompetenciaNombre(resultado.competencia_id)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <span className={`font-medium ${!resultado.estado ? 'text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}>
                            {getAtletaNombre(resultado.atleta_id)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={` ${!resultado.estado ? 'text-gray-500 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                          {getPruebaNombre(resultado.prueba_id)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`font-mono font-bold text-base ${!resultado.estado ? 'text-gray-400 dark:text-gray-500' : 'text-[#b30c25]'}`}>
                          {resultado.resultado} {resultado.unidad_medida}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-xl">
                          {getPosicionEmoji(resultado.posicion_final)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${resultado.estado
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-900/30'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-900/30'
                          }`}>
                          {resultado.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(resultado)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>

                          <button
                            onClick={() => toggleStatus(resultado)}
                            className={`p-2 rounded-lg transition-colors ${resultado.estado
                              ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-green-500 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                              }`}
                            title={resultado.estado ? "Desactivar" : "Activar"}
                          >
                            {resultado.estado ? <Power size={18} /> : <CheckCircle size={18} />}
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

      <ResultadoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          try {
            if (selectedResultado) {
              await resultadoCompetenciaService.update(selectedResultado.external_id, data);
            } else {
              await resultadoCompetenciaService.create(data);
            }
            Swal.fire({
              title: "Éxito",
              text: "Resultado guardado correctamente",
              icon: "success",
              confirmButtonColor: '#b30c25',
              background: '#1a1a1a',
              color: '#fff'
            });
            setIsModalOpen(false);
            fetchResultados();
          } catch (error) {
            console.error("Error al guardar:", error);
            Swal.fire({
              title: "Error",
              text: "No se pudo guardar el resultado",
              icon: "error",
              confirmButtonColor: '#b30c25',
              background: '#1a1a1a',
              color: '#fff'
            });
          }
        }}
        editingResultado={selectedResultado}
        competencias={competencias}
        atletas={atletas}
        pruebas={pruebas}
      />
    </div >
  );
};

export default ResultadosPage;