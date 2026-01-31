import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import tipoDisciplinaService from "../../services/tipo_disciplina_service";
import TipoDisciplinaModal from "../widgets/TipoDisciplinaModal";
import Swal from "sweetalert2";
import { Plus, Search, Filter, Activity, Edit2, Power, CheckCircle, ArrowLeft, Trophy } from 'lucide-react';

const TipoDisciplinaPage = () => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await tipoDisciplinaService.getAll();
      setTipos(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
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
      // alert(err.detail || "Error al procesar la solicitud");
      Swal.fire({
        title: 'Error',
        text: err.detail || "Error al procesar la solicitud",
        icon: 'error',
        confirmButtonColor: '#b30c25',
        background: '#1a1a1a',
        color: '#fff'
      });
    }
  };

  const toggleStatus = async (item) => {
    const nuevoEstado = !item.estado;

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: nuevoEstado
        ? `¿Desea activar la disciplina: ${item.nombre}?`
        : `¿Desea desactivar la disciplina: ${item.nombre}?`,
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
      await tipoDisciplinaService.update(item.external_id, { ...item, estado: nuevoEstado });

      setTipos(prev => prev.map(t =>
        t.external_id === item.external_id ? { ...t, estado: nuevoEstado } : t
      ));

      Swal.fire({
        title: '¡Éxito!',
        text: nuevoEstado ? 'Activado exitosamente' : 'Desactivado exitoso',
        icon: 'success',
        confirmButtonColor: '#b30c25',
        background: '#1a1a1a',
        color: '#fff'
      });

      fetchData();
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Error al cambiar el estado del registro',
        icon: 'error',
        confirmButtonColor: '#b30c25',
        background: '#1a1a1a',
        color: '#fff'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] font-['Lexend'] text-gray-900 dark:text-gray-200 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Header and Nav */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
          <div className="space-y-1">
            <Link
              to="/dashboard/competencias"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 font-semibold text-sm mb-2 transition-all duration-200 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-200">
                <ArrowLeft size={18} />
              </span>
              Volver
            </Link>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                Tipos de Disciplina
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg mt-1">
                Administra las categorías generales de las competencias.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <button
              onClick={handleOpenCreate}
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
              Agregar Disciplina
            </button>
          </div>
        </div>


        {/* Tabla */}
        <div className="bg-white dark:bg-[#212121] rounded-2xl border border-gray-200 dark:border-[#332122] shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#332122]">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider text-center">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#332122]">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#b30c25] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Cargando Disciplinas...</span>
                      </div>
                    </td>
                  </tr>
                ) : tipos.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Activity size={48} className="text-gray-300 dark:text-gray-600" />
                        <span className="text-gray-500 dark:text-gray-400 font-medium">No hay disciplinas registradas.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tipos.map((t) => (
                    <tr
                      key={t.external_id}
                      className={`transition-colors duration-200 ${!t.estado
                        ? 'bg-gray-50/50 dark:bg-[#1a1a1a]/50 opacity-60'
                        : 'hover:bg-gray-50 dark:hover:bg-[#2a2829]'
                        }`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold ${!t.estado
                            ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                            : 'bg-red-50 dark:bg-red-900/20 text-[#b30c25]'
                            }`}>
                            <Trophy size={20} />
                          </div>
                          <span className={`font-bold text-lg ${!t.estado ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'
                            }`}>
                            {t.nombre}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-5 text-sm max-w-md ${!t.estado ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'
                        }`}>
                        {t.descripcion || "Sin descripción"}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${t.estado
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-900/30'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-900/30'
                          }`}>
                          {t.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>

                          <button
                            onClick={() => toggleStatus(t)}
                            className={`p-2 rounded-lg transition-colors ${t.estado
                              ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-green-500 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                              }`}
                            title={t.estado ? "Desactivar" : "Activar"}
                          >
                            {t.estado ? <Power size={18} /> : <CheckCircle size={18} />}
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