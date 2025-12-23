import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Importante para la navegación
import tipoDisciplinaService from "../../services/tipo_disciplina_service";
import TipoDisciplinaModal from "../widgets/TipoDisciplinaModal";

const TipoDisciplinaPage = () => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await tipoDisciplinaService.getAll();
      // Obtenemos todos los registros para que no desaparezcan los inactivos
      setTipos(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Error al cargar los tipos de disciplina", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedItem) {
        await tipoDisciplinaService.update(selectedItem.external_id, formData);
      } else {
        await tipoDisciplinaService.create(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.detail || "Error al procesar la solicitud");
    }
  };

  // Función actualizada para Activar/Desactivar sin que desaparezca
  const toggleStatus = async (item) => {
    const nuevoEstado = !item.estado;
    const mensaje = nuevoEstado 
      ? `¿Desea activar la disciplina: ${item.nombre}?` 
      : `¿Desea desactivar la disciplina: ${item.nombre}?`;

    if (!confirm(mensaje)) return;

    try {
      await tipoDisciplinaService.update(item.external_id, { ...item, estado: nuevoEstado });
      
      // Actualización local para persistencia visual inmediata
      setTipos(prev => prev.map(t => 
        t.external_id === item.external_id ? { ...t, estado: nuevoEstado } : t
      ));
      
      fetchData();
    } catch (err) {
      alert("Error al cambiar el estado del registro");
    }
  };

  return (
    <div className="min-h-screen bg-white font-['Lexend'] text-[#181111]">
      <div className="max-w-[1200px] mx-auto py-10 px-6">
        
        {/* BOTÓN REGRESAR (Flecha hacia atrás) */}
        <Link 
          to="/dashboard/pruebas" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#ec1313] font-black text-[11px] mb-8 transition-colors group uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Volver a Gestión de Pruebas
        </Link>

        {/* Cabecera */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 text-[#181111]">
              Tipos de Disciplina
            </h1>
            <p className="text-gray-500 font-medium">Administra las categorías generales de las competencias deportivas.</p>
          </div>
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-[#ec1313] hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase transition-all shadow-xl shadow-red-100 active:scale-95"
          >
            <span className="material-symbols-outlined">add</span>
            Agregar Disciplina
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Nombre</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Descripción</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Estado</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="4" className="py-20 text-center text-gray-300 font-bold uppercase text-xs animate-pulse">Sincronizando Disciplinas...</td></tr>
              ) : tipos.length === 0 ? (
                <tr><td colSpan="4" className="py-20 text-center text-gray-400">No hay disciplinas registradas.</td></tr>
              ) : (
                tipos.map((t) => (
                  <tr key={t.external_id} className={`transition-colors ${!t.estado ? 'bg-gray-50/60 opacity-70' : 'hover:bg-gray-50/30'}`}>
                    <td className={`px-6 py-5 font-black text-lg uppercase ${!t.estado ? 'text-gray-400' : 'text-[#181111]'}`}>{t.nombre}</td>
                    <td className={`px-6 py-5 text-sm max-w-xs truncate ${!t.estado ? 'text-gray-300' : 'text-gray-600'}`} title={t.descripcion}>
                      {t.descripcion || "Sin descripción"}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        t.estado ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {t.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-3">
                        {/* BOTÓN EDITAR (AZUL) */}
                        <button 
                          onClick={() => handleOpenEdit(t)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        
                        {/* BOTÓN TOGGLE ESTADO (ROJO/VERDE) */}
                        <button 
                          onClick={() => toggleStatus(t)}
                          className={`p-2 rounded-xl transition-all ${t.estado ? 'text-[#ec1313] hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={t.estado ? "Desactivar" : "Activar"}
                        >
                          <span className="material-symbols-outlined">
                            {t.estado ? 'block' : 'check_circle'}
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

      <TipoDisciplinaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSubmit}
        editingData={selectedItem}
      />
    </div>
  );
};

export default TipoDisciplinaPage;