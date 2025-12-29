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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 font-['Lexend'] text-gray-900">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <Link
          to="/dashboard/pruebas"
          className="group inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white border-2 border-gray-200 rounded-xl 
             text-gray-600 font-semibold hover:border-red-500 hover:text-red-600 
             transition-all duration-200 hover:shadow-md"
        >
          <span className="material-symbols-outlined text-lg transition-transform duration-200 group-hover:-translate-x-1">
            arrow_back
          </span>
          Volver a Gestión de Pruebas
        </Link>


        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
              Tipos de Disciplina
            </h1>
            <p className="text-gray-600 text-lg">
              Administra las categorías generales de las competencias deportivas
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="group flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-red-200 transition-all hover:shadow-2xl hover:scale-105 active:scale-100 duration-200"
          >
            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300">
              add
            </span>
            Agregar Disciplina
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600 tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600 tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600 tracking-wider text-center">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-600 tracking-wider text-right">
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
                        <span className="text-gray-500 font-semibold">Sincronizando Disciplinas...</span>
                      </div>
                    </td>
                  </tr>
                ) : tipos.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-6xl text-gray-300">
                          sports
                        </span>
                        <span className="text-gray-400 font-semibold">No hay disciplinas registradas</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tipos.map((t) => (
                    <tr
                      key={t.external_id}
                      className={`transition-all duration-200 ${!t.estado
                          ? 'bg-gray-50/70 opacity-60'
                          : 'hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent'
                        }`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-12 h-12 rounded-xl font-bold ${!t.estado
                              ? 'bg-gray-200 text-gray-400'
                              : 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg'
                            }`}>
                            {t.nombre?.substring(0, 2).toUpperCase()}
                          </div>
                          <span className={`font-bold text-lg ${!t.estado ? 'text-gray-400' : 'text-gray-900'
                            }`}>
                            {t.nombre}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-5 text-sm max-w-md ${!t.estado ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                        {t.descripcion || "Sin descripción"}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase ${t.estado
                            ? 'bg-green-100 text-green-700 ring-2 ring-green-200'
                            : 'bg-red-100 text-red-700 ring-2 ring-red-200'
                          }`}>
                          {t.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>

                          <button
                            onClick={() => toggleStatus(t)}
                            className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${t.estado
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                              }`}
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