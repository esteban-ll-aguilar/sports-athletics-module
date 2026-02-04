import { useEffect, useState } from "react";
// import { Link } from "react-router-dom"; // Se eliminó Link ya que no se usa directamente en el cuerpo del componente
import competenciaService from "../../services/competencia_service";
import CompetenciaModal from "../widgets/CompetenciaModal";
import Swal from "sweetalert2";
import { Search, Filter, Plus, Calendar, MapPin, Trophy, Edit2, Power, CheckCircle, AlertCircle } from 'lucide-react';

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
      background: '#1a1a1a',
      color: '#fff',
      customClass: {
        popup: 'dark:bg-[#1a1a1a] dark:text-white dark:border dark:border-[#332122]'
      }
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
        background: '#1a1a1a',
        color: '#fff'
      });

      fetchCompetencias();
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

  // Formatear fecha a formato legible
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    // Ajustar zona horaria si es necesario, o usar date-fns
    const date = new Date(dateString);
    // Fix timezone offset issue simple hack or use UTC methods if backend sends UTC
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);

    return adjustedDate.toLocaleDateString('es-ES', {
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 font-['Lexend'] transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-gray-100">
              Gestión de Competencias
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Administra los eventos deportivos y su estado.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">

            <button
              onClick={() => { setSelectedCompetencia(null); setIsModalOpen(true); }}
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
              Nueva Competencia
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, lugar..."
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

          {/* Filtro por Estado */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="
                w-full pl-12 pr-4 py-3 rounded-xl 
                bg-white dark:bg-[#212121]
                border border-gray-200 dark:border-[#332122]
                text-gray-900 dark:text-gray-100
                focus:border-[#b30c25] focus:ring-1 focus:ring-[#b30c25]/30
                outline-none transition-all shadow-sm
                cursor-pointer appearance-none
              "
            >
              <option value="">Todos los Estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-[#212121] rounded-2xl border border-gray-200 dark:border-[#332122] shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#332122]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Competencia
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Lugar
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#332122]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#b30c25] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Cargando competencias...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCompetencias.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle size={48} className="text-gray-300 dark:text-gray-600" />
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                          {searchTerm ? 'No se encontraron resultados.' : 'No hay competencias registradas.'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCompetencias.map((comp) => (
                    <tr
                      key={comp.external_id}
                      className={`transition-colors duration-200 ${!comp.estado
                        ? 'bg-gray-50/50 dark:bg-[#1a1a1a]/50 opacity-60'
                        : 'hover:bg-gray-50 dark:hover:bg-[#2a2829]'
                        }`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 w-10 h-10 bg-red-50 dark:bg-red-900/20 text-[#b30c25] rounded-xl flex items-center justify-center">
                            <Trophy size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-gray-100">
                              {comp.nombre}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          <span className="font-medium">{formatDate(comp.fecha)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="font-medium">{comp.lugar}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${comp.estado
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-900/30'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-900/30'
                          }`}>
                          {comp.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(comp)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>

                          <button
                            onClick={() => toggleStatus(comp)}
                            className={`p-2 rounded-lg transition-colors ${comp.estado
                              ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-green-500 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                              }`}
                            title={comp.estado ? "Desactivar" : "Activar"}
                          >
                            {comp.estado ? <Power size={18} /> : <CheckCircle size={18} />}
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
            fetchCompetencias();
            return true;
          } catch (error) {
            console.error("Error al guardar:", error.response?.data || error);
            Swal.fire({
              title: 'Error',
              text: 'Error al guardar la competencia',
              icon: 'error',
              confirmButtonColor: '#b30c25',
              background: '#1a1a1a',
              color: '#fff'
            });
            return false;
          }
        }}
        editingCompetencia={selectedCompetencia}
      />
    </div >
  );
};

export default CompetenciasPage;