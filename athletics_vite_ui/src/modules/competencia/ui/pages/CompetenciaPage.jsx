import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import competenciaService from "../../services/competencia_service";
import CompetenciaModal from "../widgets/CompetenciaModal";

const CompetenciasPage = () => {
  const [competencias, setCompetencias] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompetencia, setSelectedCompetencia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
    const mensaje = nuevoEstado
      ? `¿Deseas activar la competencia "${competencia.nombre}"?`
      : `¿Deseas desactivar la competencia "${competencia.nombre}"?`;

    if (!confirm(mensaje)) return;

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
      fetchCompetencias();
    } catch (err) {
      alert("Error al cambiar el estado");
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
  const filteredCompetencias = competencias.filter(comp =>
    comp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.lugar.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 font-['Lexend'] text-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
              Gestión de Competencias
            </h1>
            <p className="text-gray-600 text-lg">
              Administra el calendario, lugares y estados de los eventos oficiales
            </p>
          </div>

          <button
            onClick={() => { setSelectedCompetencia(null); setIsModalOpen(true); }}
            className="group relative flex items-center justify-center gap-2 rounded-2xl h-14 px-8 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-sm uppercase tracking-wide hover:shadow-2xl hover:shadow-red-200 hover:scale-105 active:scale-100 transition-all duration-200"
          >
            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300">
              add
            </span>
            Crear Nueva Competencia
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, lugar o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:border-red-500 outline-none transition-all bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Nombre de Competencia
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Lugar
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
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xl">
                              emoji_events
                            </span>
                          </div>
                          <div>
                            <p className={`font-bold ${!comp.estado ? 'text-gray-400' : 'text-gray-900'}`}>
                              {comp.nombre}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                              ID: {comp.external_id?.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-5 ${!comp.estado ? 'text-gray-400' : 'text-gray-700'}`}>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          <span className="font-medium">{formatDate(comp.fecha)}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-5 ${!comp.estado ? 'text-gray-400' : 'text-gray-700'}`}>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          <span className="font-medium">{comp.lugar}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase ${comp.estado
                          ? 'bg-green-100 text-green-700 ring-2 ring-green-200'
                          : 'bg-red-100 text-red-700 ring-2 ring-red-200'
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
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
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
    </div>
  );
};

export default CompetenciasPage;