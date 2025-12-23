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
    <div className="min-h-screen bg-white font-['Lexend'] text-[#181111]">
      <div className="max-w-[1000px] mx-auto py-10 px-6">
        
        {/* BOTÓN REGRESAR */}
        <Link 
          to="/dashboard/pruebas" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#ec1313] font-black text-[11px] mb-8 transition-colors group uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Volver a Gestión de Pruebas
        </Link>

        {/* Encabezado */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">Administración de Baremos</h1>
            <p className="text-gray-400 font-medium">Gestiona puntuaciones y estados.</p>
          </div>

          <button 
            onClick={() => { setSelectedBaremo(null); setIsModalOpen(true); }}
            className="flex items-center justify-center rounded-2xl h-14 px-8 bg-[#ec1313] text-white gap-3 font-black text-xs uppercase hover:scale-105 active:scale-95 transition-all shadow-xl shadow-red-100"
          >
            <span className="material-symbols-outlined">add</span>
            Añadir Baremo
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-3xl border border-[#e6dbdb] overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-[#e6dbdb]">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Clasificación</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6dbdb]">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center text-gray-300 font-bold uppercase text-xs animate-pulse tracking-widest">Cargando Baremos...</td>
                </tr>
              ) : (
                baremos.map((b) => (
                  <tr key={b.external_id} className={`transition-colors ${!b.estado ? 'bg-gray-50/60 opacity-70' : 'hover:bg-gray-50/40'}`}>
                    <td className={`px-6 py-5 font-black text-xl ${!b.estado ? 'text-gray-400' : 'text-[#181111]'}`}>
                      {b.valor_baremo}
                    </td>
                    <td className={`px-6 py-5 font-medium ${!b.estado ? 'text-gray-400' : 'text-[#896161]'}`}>
                      {b.clasificacion}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${b.estado ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {b.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-3">
                        
                        {/* EDITAR (Icono original - Color Azul) */}
                        <button 
                          onClick={() => handleOpenEdit(b)} 
                          className="text-[#3b82f6] hover:scale-110 transition-transform"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>

                        {/* DESACTIVAR/ACTIVAR (Icono original - Toggle lógico) */}
                        <button 
                          onClick={() => toggleStatus(b)} 
                          className={`hover:scale-110 transition-transform ${b.estado ? 'text-[#ec1313]' : 'text-green-600'}`}
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