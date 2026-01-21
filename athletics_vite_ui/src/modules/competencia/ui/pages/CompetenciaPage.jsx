import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import competenciaService from "../../services/competencia_service";
import CompetenciaModal from "../widgets/CompetenciaModal";
import Swal from "sweetalert2";

const CompetenciasPage = () => {
  const [competencias, setCompetencias] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompetencia, setSelectedCompetencia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("");

  const fetchCompetencias = async () => {
    setLoading(true);
    try {
      const data = await competenciaService.getAll();
      setCompetencias(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Error al obtener competencias:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetencias();
  }, []);

  const handleOpenEdit = (competencia) => {
    setSelectedCompetencia(competencia);
    setIsModalOpen(true);
  };

  const toggleStatus = async (competencia) => {
    const nuevoEstado = !competencia.estado;

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: nuevoEstado
        ? `¿Deseas activar la competencia "${competencia.nombre}"?`
        : `¿Deseas desactivar la competencia "${competencia.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#b30c25',
      cancelButtonColor: '#6b7280',
      confirmButtonText: nuevoEstado ? 'Sí, activar' : 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      background: '#212121',
      color: '#fff'
    });

    if (!result.isConfirmed) return;

    try {
      await competenciaService.update(competencia.external_id, {
        ...competencia,
        estado: nuevoEstado
      });
      setCompetencias(prev => prev.map(item =>
        item.external_id === competencia.external_id
          ? { ...item, estado: nuevoEstado }
          : item
      ));

      Swal.fire({
        title: '¡Éxito!',
        text: nuevoEstado ? 'Activado exitosamente' : 'Desactivado exitoso',
        icon: 'success',
        confirmButtonColor: '#b30c25',
        background: '#212121',
        color: '#fff'
      });

      fetchCompetencias();
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Error al cambiar el estado',
        icon: 'error',
        confirmButtonColor: '#b30c25',
        background: '#212121',
        color: '#fff'
      });
    }
  };

  // Formatear fecha a formato legible
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filtrar competencias por búsqueda
  const filteredCompetencias = competencias.filter(comp => {
    const matchSearch = comp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.lugar.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filterEstado === "" || comp.estado.toString() === filterEstado;
    return matchSearch && matchEstado;
  });

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 font-['Lexend']">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          to="/dashboard/competencias"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 font-semibold text-sm mb-6 transition-all duration-200 group"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform duration-200">

          </span>
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-100">
              Gestión de Competencias
            </h1>
          </div>

          <button
            onClick={() => { setSelectedCompetencia(null); setIsModalOpen(true); }}
            className="
        group flex items-center gap-3
        px-8 py-4 rounded-2xl
        text-sm font-semibold text-white
        bg-gradient-to-r from-[#b30c25] via-[#362022] to-[#332122]
        hover:brightness-110
        focus:outline-none focus:ring-2 focus:ring-[#b30c25]
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-300
        shadow-lg shadow-[#b30c25]/40
        active:scale-95
    "            >
            <span className="material-symbols-outlined transition-transform duration-300 group-hover:rotate-90">
              add
            </span>
            Crear Nueva Competencia
          </button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 material-symbols-outlined">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, lugar o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
              w-full pl-12 pr-4 py-4 rounded-2xl bg-[#1f1c1d]
              border border-[#332122]
              text-gray-100 placeholder-gray-500
              focus:border-[#b30c25]
              focus:ring-1 focus:ring-[#b30c25]/40
              outline-none transition-all
              shadow-inner
                "
            />
          </div>

          {/* Filtro por Estado */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined">
              filter_list
            </span>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="
              w-full pl-12 pr-4 py-4 rounded-2xl
              bg-[#1f1c1d]
              border border-[#332122]
              text-gray-100 placeholder-gray-500
              focus:border-[#b30c25]
              focus:ring-1 focus:ring-[#b30c25]/40
              outline-none transition-all
              shadow-inner
  "            >
              <option value="">Todos los Estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-[#212121] rounded-2xl border border-[#332122] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">

            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#1a1a1a] border-b border-[#332122]">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Nombre de Competencia
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Lugar
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#332122]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                        <span className="text-gray-500 font-semibold">Cargando Competencias...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCompetencias.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-6xl text-gray-300">
                          event_busy
                        </span>
                        <span className="text-gray-400 font-semibold">
                          {searchTerm ? 'No se encontraron competencias' : 'No hay competencias registradas'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCompetencias.map((comp) => (
                    <tr
                      key={comp.external_id}
                      className={`transition-all duration-200 ${!comp.estado
                        ? 'bg-gray-50/70 opacity-60'
                        : 'hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent'
                        }`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#b30c25] to-[#5a1a22] rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xl">
                              emoji_events
                            </span>
                          </div>
                          <div>
                            <p className={`font-bold ${!comp.estado ? 'text-gray-400' : 'text-gray-200'}`}>
                              {comp.nombre}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                              ID: {comp.external_id?.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-5 ${!comp.estado ? 'text-gray-500' : 'text-gray-100'}`}>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          <span className="font-medium">{formatDate(comp.fecha)}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-5 ${!comp.estado ? 'text-gray-500' : 'text-gray-300'}`}>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          <span className="font-medium">{comp.lugar}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase ${comp.estado
                          ? 'bg-green-500/10 text-green-400 ring-1 ring-green-500/30'
                          : ' bg-red-500/10 text-red-400 ring-1 ring-red-500/30'
                          }`}>
                          {comp.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(comp)}
                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>

                          <button
                            onClick={() => toggleStatus(comp)}
                            className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${comp.estado
                              ? 'text-red-400 hover:bg-red-500/10'
                              : 'text-green-400 hover:bg-green-500/100'
                              }`}
                            title={comp.estado ? "Desactivar" : "Activar"}
                          >
                            <span className="material-symbols-outlined">
                              {comp.estado ? 'block' : 'check_circle'}
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

      <CompetenciaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          try {
            if (selectedCompetencia) {
              await competenciaService.update(selectedCompetencia.external_id, data);
            } else {
              await competenciaService.create(data);
            }
            setIsModalOpen(false);
            fetchCompetencias();
          } catch (error) {
            console.error("Error al guardar:", error);
            alert("Error al guardar la competencia");
          }
        }}
        editingCompetencia={selectedCompetencia}
      />
    </div >
  );
};

export default CompetenciasPage;