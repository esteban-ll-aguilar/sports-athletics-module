import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import baremoService from "../../services/baremo_service";
import pruebaService from "../../services/prueba_service";
import BaremoModal from "../widgets/BaremoModal";
import Swal from "sweetalert2";
import { Plus, Ruler, Users, Activity, Edit2, Power, CheckCircle, List } from 'lucide-react';

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
      background: '#1a1a1a',
      color: '#fff',
      customClass: {
        popup: 'dark:bg-[#1a1a1a] dark:text-white dark:border dark:border-[#332122]'
      }
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
        background: '#1a1a1a',
        color: '#fff'
      });

      fetchData();
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Error al cambiar el estado del baremo',
        icon: 'error',
        confirmButtonColor: '#b30c25',
        background: '#1a1a1a',
        color: '#fff'
      });
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 font-['Lexend']">
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
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Administración de Baremos
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Gestiona los rangos de clasificación de cada baremo</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <button
              onClick={() => { setSelectedBaremo(null); setIsModalOpen(true); }}
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
              Agregar Ítems
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-[#212121] rounded-2xl border border-gray-200 dark:border-[#332122] shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#332122]">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prueba</th>
                  <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contexto (Sexo / Edad)</th>
                  <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rangos</th>
                  <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Estado</th>
                  <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#332122]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#b30c25] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Cargando Baremos...</span>
                      </div>
                    </td>
                  </tr>
                ) : baremos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <List size={48} className="text-gray-300 dark:text-gray-600" />
                        <span className="text-gray-500 dark:text-gray-400 font-medium">No hay baremos registrados.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  baremos.map((b) => (
                    <tr
                      key={b.external_id}
                      className={`transition-colors duration-200 ${!b.estado
                        ? "bg-gray-50/50 dark:bg-[#1a1a1a]/50 opacity-60"
                        : "hover:bg-gray-50 dark:hover:bg-[#2a2829]"
                        }`}
                    >
                      {/* PRUEBA */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-50 dark:bg-red-900/10 rounded-lg text-[#b30c25]">
                            <Activity size={20} />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100 text-base">
                              {b.items && b.items.length > 0 ? "Baremo Compuesto" : "Baremo Simple"}
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{getPruebaName(b.prueba_id)}</span>
                          </div>
                        </div>
                      </td>

                      {/* CONTEXTO */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-gray-900 dark:text-gray-200 flex items-center gap-2">
                            <Users size={16} className="text-gray-400" />
                            {b.sexo === 'M' ? 'Masculino' : 'Femenino'}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${b.sexo === 'M' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30' : 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-900/30'} `}>
                              {b.sexo}
                            </span>
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 pl-6">
                            {b.edad_min} - {b.edad_max} años
                          </span>
                        </div>
                      </td>

                      {/* RANGOS */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Ruler size={16} className="text-gray-400" />
                          <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#333] border border-gray-200 dark:border-[#444] text-gray-700 dark:text-gray-300 font-mono text-xs font-bold">
                            {b.items?.length || 0} Rangos
                          </span>
                        </div>
                      </td>

                      {/* ESTADO */}
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${b.estado
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-900/30'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-900/30'
                          }`}>
                          {b.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      {/* ACCIONES */}
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>

                          <button
                            onClick={() => toggleStatus(b)}
                            className={`p-2 rounded-lg transition-colors ${b.estado
                              ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-green-500 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                              }`}
                            title={b.estado ? "Desactivar" : "Activar"}
                          >
                            {b.estado ? <Power size={18} /> : <CheckCircle size={18} />}
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
        onSubmit={async (data, baremoToUpdate) => {
          try {
            // Si hay external_id en data o baremoToUpdate, es una actualización
            if (data.external_id || baremoToUpdate) {
              const externalId = data.external_id || baremoToUpdate.external_id;
              await baremoService.update(externalId, data);
            } else {
              await baremoService.create(data);
            }
            setIsModalOpen(false);
            fetchData();
          } catch (err) {
            console.error("Error al guardar baremo:", err);
          }
        }}
        editingBaremo={selectedBaremo}
        baremos={baremos}
      />
    </div>
  );
};

export default BaremosPage;