import { useEffect, useState } from "react";
import registroPruebaCompetenciaService from "../../services/registro_prueba_service";
import pruebaService from "../../services/prueba_service";
import AdminService from "../../../admin/services/adminService";
import RegistroPruebaModal from "../widgets/RegistroPruebaModal";

const RegistroPruebaPage = () => {
  const [registros, setRegistros] = useState([]);
  const [pruebas, setPruebas] = useState([]);
  const [atletas, setAtletas] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState(null);

  // 🔄 FETCH DATA
  const fetchData = async () => {
    setLoading(true);
    try {
      const [registrosRes, pruebasRes, usersRes] = await Promise.all([
        registroPruebaCompetenciaService.getAll(),
        pruebaService.getAll(),
        AdminService.getUsers()
      ]);

      console.log("📦 Usuarios recibidos:", usersRes);

      // 👉 REGISTROS
      setRegistros(
        Array.isArray(registrosRes?.items)
          ? registrosRes.items
          : []
      );

      // 👉 PRUEBAS
      setPruebas(
        Array.isArray(pruebasRes?.data)
          ? pruebasRes.data
          : Array.isArray(pruebasRes)
          ? pruebasRes
          : []
      );

      // 👉 ATLETAS
      const atletasFiltrados = (usersRes.users || []).filter(
        (u) => u.role === "ATLETA"
      );

      console.log("🏃 Atletas filtrados:", atletasFiltrados);

      setAtletas(atletasFiltrados);

    } catch (err) {
      console.error("❌ Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-['Lexend']">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black">
            Registro de Pruebas
          </h1>

          <button
            onClick={() => {
              setEditingRegistro(null);
              setIsModalOpen(true);
            }}
            className="bg-[#ec1313] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition"
          >
            + Nuevo Registro
          </button>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-xl shadow overflow-hidden text-sm">
          <table className="w-full">
            <thead className="bg-gray-100 text-[11px] uppercase">
              <tr>
                <th className="px-3 py-2 text-left">Atleta</th>
                <th className="px-3 py-2 text-left">Prueba</th>
                <th className="px-3 py-2 text-left">Valor</th>
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-400">
                    Cargando registros...
                  </td>
                </tr>
              ) : registros.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-400">
                    No existen registros
                  </td>
                </tr>
              ) : (
                registros.map((r) => {
                  const atleta = atletas.find(a => a.id === r.auth_user_id);
                  const prueba = pruebas.find(p => p.id === r.prueba_id);

                  return (
                    <tr
                      key={r.external_id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-3 py-2 font-semibold">
                        {atleta
                          ? `${atleta.first_name} ${atleta.last_name}`
                          : "N/D"}
                      </td>
                      <td className="px-3 py-2">
                        {prueba?.siglas || "-"}
                      </td>
                      <td className="px-3 py-2">{r.valor}</td>
                      <td className="px-3 py-2 text-gray-500">{r.fecha_registro}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => {
                            setEditingRegistro(r);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 text-xs font-bold hover:underline"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <RegistroPruebaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingData={editingRegistro}
        pruebas={pruebas}
        atletas={atletas}
        onSubmit={async (data) => {
          if (editingRegistro) {
            await registroPruebaCompetenciaService.update(
              editingRegistro.external_id,
              data
            );
          } else {
            await registroPruebaCompetenciaService.create(data);
          }
          setIsModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
};

export default RegistroPruebaPage;
