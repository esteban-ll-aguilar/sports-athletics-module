import React, { useState, useEffect } from 'react';
import { Search, Plus, AlertCircle, Check, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AtletaService from '@modules/atleta/services/AtletaService';

const HistorialMedicoPage = () => {
  const [atletas, setAtletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAtletas();
  }, []);

  const fetchAtletas = async () => {
    try {
      setLoading(true);
      const response = await AtletaService.getAthletes();
      
      // Mapear los datos reales del backend
      const atletasReales = (response.items || []).map((user) => ({
        id: user.id,
        nombre: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
        categoria: user.tipo_estamento || 'Sin categoría',
        estadoMedico: 'apto', // TODO: Obtener del backend cuando esté disponible
        foto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || user.id}`
      }));
      
      setAtletas(atletasReales);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar atletas:', error);
      toast.error('Error al cargar los atletas');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleViewHistorial = (id) => {
    toast.success('Abriendo historial médico...');
    // TODO: Navegación a detalles del historial
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'apto':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: Check, label: 'Apto' };
      case 'lesionado':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle, label: 'Lesionado' };
      case 'en_revision':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'En Observación' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: AlertCircle, label: 'Sin evaluar' };
    }
  };

  const filteredAtletas = atletas.filter(a =>
    a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cálculo de estadísticas
  const stats = {
    apto: atletas.filter(a => a.estadoMedico === 'apto').length,
    lesionado: atletas.filter(a => a.estadoMedico === 'lesionado').length,
    en_revision: atletas.filter(a => a.estadoMedico === 'en_revision').length,
  };

  // Paginación
  const totalPages = Math.ceil(filteredAtletas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAtletas = filteredAtletas.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Cargando historial médico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6 px-6 max-w-7xl mx-auto pt-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Directorio de Atletas - Historial Médico</h1>
          <p className="text-gray-500 mt-1">Administra y consulta los registros médicos de tu plantilla.</p>
        </div>
        <button
          onClick={() => toast.info('Función de nuevo atleta en desarrollo')}
          className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors font-medium"
        >
          <Plus size={20} />
          Nuevo Atleta
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Buscar atleta por nombre o equipo..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2 bg-black border border-red-900 rounded-lg text-gray-400 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-800"
        />
      </div>

      {/* Table */}
      {filteredAtletas.length === 0 ? (
        <div className="bg-black border border-red-900 rounded-lg shadow p-12 text-center">
          <AlertCircle className="mx-auto text-gray-600 mb-4" size={48} />
          <h3 className="text-lg font-medium text-white mb-2">No hay atletas</h3>
          <p className="text-gray-500">
            {searchTerm
              ? 'No se encontraron resultados para tu búsqueda'
              : 'No hay atletas registrados aún'}
          </p>
        </div>
      ) : (
        <div className="bg-black border border-red-900 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-black border-b border-red-900/30">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">ATLETA</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">CATEGORÍA / EQUIPO</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">ESTADO MÉDICO</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900/20">
              {paginatedAtletas.map((atleta) => {
                const estado = getEstadoColor(atleta.estadoMedico);
                const IconEstado = estado.icon;
                return (
                  <tr key={atleta.id} className="hover:bg-black/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={atleta.foto}
                          alt={atleta.nombre}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-white">{atleta.nombre}</p>
                          <p className="text-xs text-gray-600">ID: PATH-1281</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{atleta.categoria}</td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 w-fit px-3 py-1 rounded-full ${estado.bg}`}>
                        <IconEstado size={16} className={estado.text} />
                        <span className={`text-sm font-medium ${estado.text}`}>{estado.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewHistorial(atleta.id)}
                        className="px-4 py-2 bg-red-800 text-white text-sm font-medium rounded hover:bg-red-900 transition-colors inline-flex items-center gap-2"
                      >
                        VER HISTORIAL
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-black px-6 py-4 flex items-center justify-between border-t border-red-900/30">
              <p className="text-sm text-gray-500">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredAtletas.length)} de {filteredAtletas.length} atletas
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-black border border-red-900 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-900/20 hover:text-white transition-colors"
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-red-800 text-white'
                        : 'border border-red-900 text-gray-400 hover:border-red-800 hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-black border border-red-900 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-900/20 hover:text-white transition-colors"
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-black border border-red-900 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-3">
            <Check className="text-green-500" size={32} />
          </div>
          <p className="text-2xl font-bold text-white">{stats.apto}</p>
          <p className="text-gray-500 text-sm mt-1">Atletas Aptos</p>
        </div>
        <div className="bg-black border border-red-900 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-3">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          <p className="text-2xl font-bold text-white">{stats.lesionado}</p>
          <p className="text-gray-500 text-sm mt-1">En Rehabilitación</p>
        </div>
        <div className="bg-black border border-red-900 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-3">
            <Clock className="text-yellow-500" size={32} />
          </div>
          <p className="text-2xl font-bold text-white">{stats.en_revision}</p>
          <p className="text-gray-500 text-sm mt-1">Revisiones Pendientes</p>
        </div>
      </div>
    </div>
  );
};

export default HistorialMedicoPage;
