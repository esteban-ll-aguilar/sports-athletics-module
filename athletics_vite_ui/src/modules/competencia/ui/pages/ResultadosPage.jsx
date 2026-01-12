import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import resultadoCompetenciaService from "../../services/resultado_competencia_service";
import competenciaService from "../../services/competencia_service";
import AtletaService from "../../../atleta/services/AtletaService";
import PruebaRepository from "../../services/prueba_service";
import ResultadoModal from "../widgets/ResultadoModal";

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
      const data = await resultadoCompetenciaService.getAll();
      setResultados(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Error al obtener resultados:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompetencias = async () => {
    try {
      const data = await competenciaService.getAll();
      setCompetencias(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Error al obtener competencias:", err);
    }
  };

  // TODO: Implementar servicios de atletas y pruebas
  const fetchAtletas = async () => {
    try {
      const response = await AtletaService.getAthletes(1, 200);
      setAtletas(response.items || []);
    } catch (err) {
      console.error("Error al obtener atletas:", err);
    }
  };

  const fetchPruebas = async () => {
    try {
      const data = await PruebaRepository.getAll();
      setPruebas(data || []);
    } catch (err) {
      console.error("Error al obtener pruebas:", err);
    }
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
    const mensaje = nuevoEstado
      ? `¿Deseas activar este resultado?`
      : `¿Deseas desactivar este resultado?`;

    if (!confirm(mensaje)) return;

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
      fetchResultados();
    } catch (err) {
      alert("Error al cambiar el estado");
    }
  };

  // Obtener nombre de la competencia
  const getCompetenciaNombre = (competenciaId) => {
    const comp = competencias.find(c => c.id === competenciaId);
    return comp ? comp.nombre : `ID: ${competenciaId}`;
  };

  // Obtener nombre del atleta
  const getAtletaNombre = (atletaId) => {
    const atleta = atletas.find(a => a.id === atletaId || a.external_id === atletaId);
    return atleta ? `${atleta.first_name || atleta.username} ${atleta.last_name || ""}` : `Atleta: ${atletaId}`;
  };

  // Obtener nombre de la prueba
  const getPruebaNombre = (pruebaId) => {
    const prueba = pruebas.find(p => p.id === pruebaId || p.external_id === pruebaId);
    return prueba ? `${prueba.siglas} - ${prueba.tipo_prueba}` : `Prueba: ${pruebaId}`;
  };

  // Obtener emoji según posición
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

  // Filtrar resultados
  const filteredResultados = resultados.filter(res => {
    const matchSearch =
      getAtletaNombre(res.atleta_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCompetenciaNombre(res.competencia_id).toLowerCase().includes(searchTerm.toLowerCase());

    const matchCompetencia = !filterCompetencia || res.competencia_id === parseInt(filterCompetencia);

    return matchSearch && matchCompetencia;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 font-['Lexend'] text-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <Link
          to="/dashboard/competencias"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 font-semibold text-sm mb-6 transition-all duration-200 group"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform duration-200">
            arrow_back
          </span>
          Volver a Gestión de Competencias
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
              Registro de Resultados
            </h1>
            <p className="text-gray-600 text-lg">
            </p>
          </div>

          <button
            onClick={() => { setSelectedResultado(null); setIsModalOpen(true); }}
            className="group relative flex items-center justify-center gap-2 rounded-2xl h-14 px-8 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-sm uppercase tracking-wide hover:shadow-2xl hover:shadow-red-200 hover:scale-105 active:scale-100 transition-all duration-200"
          >
            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300">
              add
            </span>
            Registrar Resultado
          </button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Búsqueda */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por atleta o competencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:border-red-500 outline-none transition-all bg-white shadow-sm"
            />
          </div>

          {/* Filtro por Competencia */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined">
              filter_list
            </span>
            <select
              value={filterCompetencia}
              onChange={(e) => setFilterCompetencia(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:border-red-500 outline-none transition-all bg-white shadow-sm appearance-none cursor-pointer"
            >
              <option value="">Todas las Competencias</option>
              {competencias.map(comp => (
                <option key={comp.id} value={comp.id}>
                  {comp.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>


        {/* Últimos Registros Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-red-600 text-3xl">
                today
              </span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Últimos Registros</h2>
                <p className="text-sm text-gray-500">Total de registros hoy: {filteredResultados.length}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Competencia
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Participante
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Prueba
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Resultado
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Posición
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                        <span className="text-gray-500 font-semibold">Cargando Resultados...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredResultados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-6xl text-gray-300">
                          leaderboard
                        </span>
                        <span className="text-gray-400 font-semibold">
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
                      className={`transition-all duration-200 ${!resultado.estado
                        ? 'bg-gray-50/70 opacity-60'
                        : 'hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent'
                        }`}
                    >
                      <td className="px-6 py-5">
                        <div className={`font-semibold ${!resultado.estado ? 'text-gray-400' : 'text-gray-900'}`}>
                          {getCompetenciaNombre(resultado.competencia_id)}
                        </div>
                      </td>
                      <td className={`px-6 py-5 ${!resultado.estado ? 'text-gray-400' : 'text-gray-700'}`}>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">person</span>
                          <span className="font-medium">{getAtletaNombre(resultado.atleta_id)}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-5 ${!resultado.estado ? 'text-gray-400' : 'text-gray-700'}`}>
                        {getPruebaNombre(resultado.prueba_id)}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`font-bold text-lg ${!resultado.estado ? 'text-gray-400' : 'text-red-600'}`}>
                          {resultado.resultado} {resultado.unidad_medida}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-2xl">
                          {getPosicionEmoji(resultado.posicion_final)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase ${resultado.estado
                          ? 'bg-green-100 text-green-700 ring-2 ring-green-200'
                          : 'bg-red-100 text-red-700 ring-2 ring-red-200'
                          }`}>
                          {resultado.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(resultado)}
                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>

                          <button
                            onClick={() => toggleStatus(resultado)}
                            className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${resultado.estado
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                              }`}
                            title={resultado.estado ? "Desactivar" : "Activar"}
                          >
                            <span className="material-symbols-outlined">
                              {resultado.estado ? 'block' : 'check_circle'}
                            </span>
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
            setIsModalOpen(false);
            fetchResultados();
          } catch (error) {
            console.error("Error al guardar:", error);
            alert("Error al guardar el resultado");
          }
        }}
        editingResultado={selectedResultado}
        competencias={competencias}
        atletas={atletas}
        pruebas={pruebas}
      />
    </div>
  );
};

export default ResultadosPage;