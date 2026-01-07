import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import baremoService from "../../services/baremo_service"; 
import BaremoModal from "../widgets/BaremoModal"; 

const BaremosPage = () => {
  const [baremos, setBaremos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBaremo, setSelectedBaremo] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBaremos = async () => {
    setLoading(true);
    try {
      const data = await baremoService.getAll();
     // Obtenemos todos los datos sin filtrar para que los inactivos permanezcan visibles
      setBaremos(Array.isArray(data) ? data : data.data || []);
    } catch (err) { 
      console.error("Error al obtener baremos:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchBaremos(); 
  }, []);

  const handleOpenEdit = (baremo) => {
    setSelectedBaremo(baremo);
    setIsModalOpen(true);
  };

  const toggleStatus = async (baremo) => {
    const nuevoEstado = !baremo.estado;
    const mensaje = nuevoEstado 
      ? `¿Deseas activar el baremo "${baremo.clasificacion}"?` 
      : `¿Deseas desactivar el baremo "${baremo.clasificacion}"?`;

    if (!confirm(mensaje)) return;

    try {
      await baremoService.update(baremo.external_id, { 
        ...baremo, 
        estado: nuevoEstado 
      });
       // Actualización local inmediata para asegurar que no desaparezca de la lista
      setBaremos(prev => prev.map(item => 
        item.external_id === baremo.external_id 
          ? { ...item, estado: nuevoEstado } 
          : item
      ));
      
      fetchBaremos(); 
    } catch (err) { 
      alert("Error al cambiar el estado"); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 font-['Lexend'] text-gray-900">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <Link 
          to="/dashboard/pruebas" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 font-semibold text-sm mb-6 transition-all duration-200 group"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform duration-200">
            arrow_back
          </span>
          Volver a Gestión de Pruebas
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
              Administración de Baremos
            </h1>
            <p className="text-gray-600 text-lg">Gestiona puntuaciones y clasificaciones</p>
          </div>

          <button 
            onClick={() => { setSelectedBaremo(null); setIsModalOpen(true); }}
            className="group relative flex items-center justify-center gap-2 rounded-2xl h-14 px-8 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-sm uppercase tracking-wide hover:shadow-2xl hover:shadow-red-200 hover:scale-105 active:scale-100 transition-all duration-200"
          >
            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300">
              add
            </span>
            Añadir Baremo
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Clasificación
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
                    <td colSpan="4" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                        <span className="text-gray-500 font-semibold">Cargando Baremos...</span>
                      </div>
                    </td>
                  </tr>
                ) : baremos.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-6xl text-gray-300">
                          inventory_2
                        </span>
                        <span className="text-gray-400 font-semibold">No hay baremos registrados</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  baremos.map((b) => (
                    <tr 
                      key={b.external_id} 
                      className={`transition-all duration-200 ${
                        !b.estado 
                          ? 'bg-gray-50/70 opacity-60' 
                          : 'hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent'
                      }`}
                    >
                      <td className={`px-6 py-5 font-bold text-2xl ${!b.estado ? 'text-gray-400' : 'text-gray-900'}`}>
                        {b.valor_baremo}
                        <span className="text-sm text-gray-400 ml-1 font-normal">pts</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-bold text-lg ${
                          !b.estado 
                            ? 'bg-gray-200 text-gray-400' 
                            : 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg'
                        }`}>
                          {b.clasificacion}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase ${
                          b.estado 
                            ? 'bg-green-100 text-green-700 ring-2 ring-green-200' 
                            : 'bg-red-100 text-red-700 ring-2 ring-red-200'
                        }`}>
                          {b.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEdit(b)} 
                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          
                          <button 
                            onClick={() => toggleStatus(b)} 
                            className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${
                              b.estado 
                                ? 'text-red-600 hover:bg-red-50' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={b.estado ? "Desactivar" : "Activar"}
                          >
                            <span className="material-symbols-outlined">
                              {b.estado ? 'block' : 'check_circle'}
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

      <BaremoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={async (data) => {
          if (selectedBaremo) await baremoService.update(selectedBaremo.external_id, data);
          else await baremoService.create(data);
          setIsModalOpen(false);
          fetchBaremos();
        }}
        editingBaremo={selectedBaremo}
      />
    </div>
  );
};

export default BaremosPage;