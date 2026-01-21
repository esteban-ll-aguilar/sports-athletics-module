import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import baremoService from "../../services/baremo_service";
import BaremoModal from "../widgets/BaremoModal";
import Swal from "sweetalert2";


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

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: nuevoEstado
        ? `¿Desea activar el baremo: ${baremo.clasificacion}?`
        : `¿Desea desactivar el baremo: ${baremo.clasificacion}?`,
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
      await baremoService.update(baremo.external_id, {
        ...baremo,
        estado: nuevoEstado
      });

      // 🔹 Actualización local inmediata (no desaparece de la tabla)
      setBaremos(prev =>
        prev.map(b =>
          b.external_id === baremo.external_id
            ? { ...b, estado: nuevoEstado }
            : b
        )
      );

      Swal.fire({
        title: '¡Éxito!',
        text: nuevoEstado ? 'Baremo activado exitosamente' : 'Baremo desactivado exitosamente',
        icon: 'success',
        confirmButtonColor: '#b30c25',
        background: '#212121',
        color: '#fff'
      });

      fetchBaremos();
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Error al cambiar el estado del baremo',
        icon: 'error',
        confirmButtonColor: '#b30c25',
        background: '#212121',
        color: '#fff'
      });
    }
  };


  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 font-['Lexend']">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb Navigation */}
        <Link
          to="/dashboard/pruebas"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#b30c25] font-medium text-sm mb-6 transition group"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform duration-200">
            arrow_back
          </span>
          Volver a Gestión de Pruebas
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Administración de Baremos
            </h1>
            <p className="text-gray-400">Gestiona puntuaciones y clasificaciones</p>
          </div>

          <button
            onClick={() => { setSelectedBaremo(null); setIsModalOpen(true); }}
            className="
      flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
      bg-gradient-to-r from-[#b30c25] to-[#5a0f1d]
      hover:brightness-110 transition
    "          >
            <span className="material-symbols-outlined">
              add
            </span>
            Añadir Baremo
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-[#212121] rounded-2xl shadow-xl border border-[#332122] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1a1a1a] border-b border-[#332122]">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                    Clasificación
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
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
                      className={`transition-all duration-200 ${!b.estado
                        ? "bg-gray-50/70 opacity-60"
                        : "hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent"
                        }`}
                    >
                      <td className={`px-6 py-5 font-bold text-2xl ${!b.estado ? 'text-gray-400' : 'text-gray-900'}`}>
                        {b.valor_baremo}
                        <span className="text-sm text-gray-500 ml-1 font-normal">pts</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-bold ${b.estado
                          ? "bg-[rgba(179,12,37,0.15)] text-[#b30c25] border border-[#332122]"
                          : "bg-[#1a1a1a] text-gray-500 border border-[#332122]"
                          }`}>
                          {b.clasificacion}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-bold text-2xl text-white">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-bold ${b.estado
                          ? "bg-[rgba(179,12,37,0.15)] text-[#b30c25] border border-[#332122]"
                          : "bg-[#1a1a1a] text-gray-500 border border-[#332122]"
                          }`}>
                          {b.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-bold text-2xl text-white">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="p-2.5 text-blue-400 hover:bg-blue-900/20 rounded-lg transition"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>

                          <button
                            onClick={() => toggleStatus(b)}
                            className={`p-2.5 rounded-lg transition ${b.estado
                              ? "text-red-400 hover:bg-red-900/20"
                              : "text-green-400 hover:bg-green-900/20"
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