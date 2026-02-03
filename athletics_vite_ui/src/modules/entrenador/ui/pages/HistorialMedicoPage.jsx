import React, { useState, useEffect } from 'react';
import { Search, Plus, AlertCircle, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AtletaService from '@modules/atleta/services/AtletaService';

const HistorialMedicoPage = () => {
  const [atletas, setAtletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHistorial, setSelectedHistorial] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAtletas();
  }, []);

  const fetchAtletas = async () => {
    try {
      setLoading(true);
      const response = await AtletaService.getAthletes();

      // Mapear los datos reales del backend
      const items = response.items || [];
      const atletasReales = items.map((user) => ({
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

  const handleViewHistorial = async (id) => {
    try {
      const historial = await AtletaService.getHistorialByUserId(id);
      setSelectedHistorial(historial);
      setShowModal(true);
      toast.success('Historial cargado correctamente');
    } catch (error) {
      console.error("Error fetching historial:", error);
      if (error.response && error.response.status === 404) {
        toast.error("Aún no se ha registrado el historial médico");
      } else {
        toast.error("Error al obtener el historial médico");
      }
    }
  };



  const filteredAtletas = atletas.filter(a =>
    a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );



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
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 font-['Lexend'] transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-gray-100">Directorio de Atletas - Historial Médico</h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Administra y consulta los registros médicos de tu plantilla.</p>
          </div>

        </div>

        {/* Search Bar */}
        <div className="space-y-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar atleta por nombre o equipo..."
            value={searchTerm}
            onChange={handleSearch}
            className="  w-full pl-12 pr-4 py-3 rounded-xl 
                bg-white dark:bg-[#212121]
                border border-gray-200 dark:border-[#332122]
                text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                focus:border-[#b30c25] focus:ring-1 focus:ring-[#b30c25]/30
                outline-none transition-all shadow-sm
              "
          />
        </div>

        {/* Table */}
        {filteredAtletas.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AlertCircle className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay atletas</h3>
            <p className="text-gray-500">
              {searchTerm
                ? 'No se encontraron resultados para tu búsqueda'
                : 'No hay atletas registrados aún'}
            </p>
          </div>
        ) : (
          <div className="mt-6 bg-white dark:bg-[#212121] rounded-2xl border border-gray-200 dark:border-[#332122] shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#332122]">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ATLETA</th>
                  <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">CATEGORÍA / EQUIPO</th>

                  <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#332122]">
                {paginatedAtletas.map((atleta) => {
                  return (
                    <tr key={atleta.id} className="hover:bg-gray-50 dark:hover:bg-black/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={atleta.foto}
                            alt={atleta.nombre}
                            className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{atleta.nombre}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-600">ID: PATH-1281</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{atleta.categoria}</td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewHistorial(atleta.id)}
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
              <div className="bg-white dark:bg-black px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-red-900/30">
                <p className="text-sm text-gray-500">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredAtletas.length)} de {filteredAtletas.length} atletas
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-white dark:bg-black border border-gray-300 dark:border-red-900 text-gray-500 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-red-900/20 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded font-medium transition-colors ${currentPage === page
                        ? 'bg-red-600 dark:bg-red-800 text-white'
                        : 'border border-gray-300 dark:border-red-900 text-gray-500 dark:text-gray-400 hover:border-red-600 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-white'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-white dark:bg-black border border-gray-300 dark:border-red-900 text-gray-500 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-red-900/20 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    &gt;
                  </button>
                </div>
              </div>


            )}
          </div>

        )}
      </div>

      {/* Modal Historial */}
      {showModal && selectedHistorial && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-red-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-red-900/30 flex justify-between items-center bg-gray-50 dark:bg-black">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="bg-red-600 dark:bg-red-800 p-2 rounded-lg">
                  <Check size={20} className="text-white" />
                </div>
                Historial Médico
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-red-900/20">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Peso</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedHistorial.peso} kg</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-red-900/20">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Talla</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedHistorial.talla} m</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-red-900/20">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">IMC</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedHistorial.imc?.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Información Médica</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-100 dark:border-none">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Alergias</p>
                    <p className="text-gray-900 dark:text-white">
                      {selectedHistorial.alergias || "Ninguna reportada"}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-100 dark:border-none">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Enfermedades Hereditarias</p>
                    <p className="text-gray-900 dark:text-white">
                      {selectedHistorial.enfermedades_hereditarias || "Ninguna reportada"}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-100 dark:border-none">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Otras Enfermedades</p>
                    <p className="text-gray-900 dark:text-white">
                      {selectedHistorial.enfermedades || "Ninguna reportada"}
                    </p>
                  </div>

                  {/* Contacto de Emergencia */}
                  {(selectedHistorial.contacto_emergencia_nombre || selectedHistorial.contacto_emergencia_telefono) && (
                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/20">
                      <h4 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-3 border-b border-red-100 dark:border-red-900/20 pb-2">
                        Contacto de Emergencia
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedHistorial.contacto_emergencia_nombre && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre</p>
                            <p className="text-gray-900 dark:text-white font-medium">{selectedHistorial.contacto_emergencia_nombre}</p>
                          </div>
                        )}
                        {selectedHistorial.contacto_emergencia_telefono && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Teléfono</p>
                            <p className="text-gray-900 dark:text-white font-medium">{selectedHistorial.contacto_emergencia_telefono}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-red-900/30 flex justify-end bg-gray-50 dark:bg-black rounded-b-lg">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
};
export default HistorialMedicoPage;
