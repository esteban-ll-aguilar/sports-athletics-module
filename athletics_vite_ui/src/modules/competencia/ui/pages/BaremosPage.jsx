import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import baremoService from "../../services/baremo_service";
import pruebaService from "../../services/prueba_service";
import BaremoModal from "../widgets/BaremoModal";
import Swal from "sweetalert2";


const BaremosPage = () => {
  const [baremos, setBaremos] = useState([]);
  const [pruebas, setPruebas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBaremo, setSelectedBaremo] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [baremosData, pruebasData] = await Promise.all([
        baremoService.getAll(),
        pruebaService.getAll()
      ]);
      setBaremos(Array.isArray(baremosData) ? baremosData : baremosData.data || []);
      setPruebas(Array.isArray(pruebasData) ? pruebasData : pruebasData.data || []);
    } catch (err) {
      console.error("Error fetching Baremos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPruebaName = (id) => {
    const p = pruebas.find(p => p.external_id === id || p.id === id); // Handle UUID or Int
    return p ? `${p.nombre} (${p.tipo_medicion})` : id;
  };

  const handleOpenEdit = (baremo) => {
    // Find the prueba to get its external_id
    const prueba = pruebas.find(p => p.id === baremo.prueba_id || p.external_id === baremo.prueba_id);
    const enrichedBaremo = {
      ...baremo,
      prueba_external_id: prueba?.external_id || baremo.prueba_id
    };
    setSelectedBaremo(enrichedBaremo);
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

      fetchData();
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Prueba</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Contexto (Sexo / Edad)</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Rangos</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                        <span className="text-gray-500 font-semibold">Cargando Baremos...</span>
                      </div>
                    </td>
                  </tr>
                ) : baremos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-6xl text-gray-300">inventory_2</span>
                        <span className="text-gray-400 font-semibold">No hay baremos registrados</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  baremos.map((b) => (
                    <tr
                      key={b.external_id}
                      className={`transition - all duration - 200 ${!b.estado
                        ? "bg-gray-50/70 opacity-60"
                        : "hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent"
                        } `}
                    >
                      {/* PRUEBA */}
                      <td className="px-6 py-5">
                        <div className="font-bold text-gray-200 text-lg">
                          {b.items && b.items.length > 0 ? "Baremo Compuesto" : "Baremo Simple"}
                          <span className="block text-sm text-[#b30c25]">{getPruebaName(b.prueba_id)}</span>
                        </div>
                      </td>

                      {/* CONTEXTO */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-lg flex items-center gap-2">
                            {b.sexo === 'M' ? 'Masculino' : 'Femenino'}
                            <span className={`text - xs px - 2 py - 0.5 rounded ${b.sexo === 'M' ? 'bg-blue-900/40 text-blue-300' : 'bg-pink-900/40 text-pink-300'} `}>
                              {b.sexo}
                            </span>
                          </span>
                          <span className="text-sm text-gray-500">
                            {b.edad_min} - {b.edad_max} años
                          </span>
                        </div>
                      </td>

                      {/* RANGOS */}
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 rounded-lg bg-[#252525] border border-[#444] text-gray-300 font-mono text-sm">
                          {b.items?.length || 0} Rangos
                        </span>
                      </td>

                      {/* ESTADO */}
                      <td className="px-6 py-5">
                        <span className={`inline - flex items - center justify - center px - 3 py - 1 rounded - lg text - sm font - bold ${b.estado
                          ? "bg-[rgba(179,12,37,0.15)] text-[#b30c25] border border-[#332122]"
                          : "bg-[#1a1a1a] text-gray-500 border border-[#332122]"
                          } `}>
                          {b.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      {/* ACCIONES */}
                      <td className="px-6 py-5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="p-2.5 text-blue-400 hover:bg-blue-900/20 rounded-lg transition"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>

                          <button
                            onClick={() => toggleStatus(b)}
                            className={`p - 2.5 rounded - lg transition ${b.estado
                              ? "text-red-400 hover:bg-red-900/20"
                              : "text-green-400 hover:bg-green-900/20"
                              } `}
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
          fetchData();
        }}
        editingBaremo={selectedBaremo}
      />
    </div>
  );
};

export default BaremosPage;