import { useEffect, useState, useMemo } from "react";
import AtletaService from "../../services/AtletaService";
import { Mail, FileText, User, UserPlus } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import EditUserModal from "../../../auth/ui/pages/RegisterPage";
import { Link } from "react-router-dom";


const AthletesTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      setLoading(true);
      console.log("🔄 Cargando atletas desde el backend...");
      const response = await AtletaService.getAthletes();

      console.log("📦 Datos recibidos de AtletaService:", response);

      // El backend ahora filtra por rol y devuelve PaginatedUsers
      const athletes = response.items || [];

      console.log("🏃‍♂️ Atletas filtrados:", athletes);

      // Asegurar que todos los campos existan
      const sanitizedAthletes = athletes.map((u) => ({
        username: u.username || "",
        first_name: u.first_name || "",
        last_name: u.last_name || "",
        email: u.email || "",
        tipo_identificacion: u.tipo_identificacion || "",
        identificacion: u.identificacion || "",
        tipo_estamento: u.tipo_estamento || "",
        phone: u.phone || "",
        direccion: u.direccion || "",
        is_active: u.is_active ?? true,
        id: u.id,
        role: u.role || "ATLETA",
      }));

      console.log("✅ Atletas sanitizados para tabla:", sanitizedAthletes);

      setUsers(sanitizedAthletes);
    } catch (err) {
      console.error("❌ Error cargando usuarios:", err);
      setError("No se pudo cargar la lista de atletas.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar la lista de atletas.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar por búsqueda y estado
  const filteredUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.first_name.toLowerCase().includes(searchLower) ||
        user.last_name.toLowerCase().includes(searchLower) ||
        user.identificacion.toLowerCase().includes(searchLower);

      const matchesStatus =
        statusFilter === ""
          ? true
          : statusFilter === "activo"
            ? user.is_active
            : !user.is_active;

      return matchesSearch && matchesStatus;
    });

    console.log("🔍 Usuarios filtrados por búsqueda y estado:", filtered);
    return filtered;
  }, [users, searchTerm, statusFilter]);

  const exportPDF = () => {
    console.log("📄 Exportando PDF con usuarios:", filteredUsers);
    const doc = new jsPDF();
    doc.text("Listado de Atletas", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [
        [
          "Usuario",
          "Nombre",
          "Apellido",
          "Correo",
          "Tipo ID",
          "Identificación",
          "Estamento",
          "Teléfono",
          "Dirección",
          "Estado",
        ],
      ],
      body: filteredUsers.map((user) => [
        user.username,
        user.first_name,
        user.last_name,
        user.email,
        user.tipo_identificacion,
        user.identificacion,
        user.tipo_estamento,
        user.phone,
        user.direccion,
        user.is_active ? "Activo" : "Inactivo",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 197, 94] },
    });

    doc.save("atletas.pdf");
  };

  const openCreateModal = () => {
    console.log("🟢 Abriendo modal para crear usuario");
    setSelectedUser(null);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    console.log("🟡 Abriendo modal para editar usuario:", user);
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    console.log("🔴 Cerrando modal");
    setShowModal(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] font-['Lexend'] text-gray-200 px-6 py-8">
        <div className="animate-spin h-10 w-10 rounded-full border-t-2 border-b-2 border-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#212121] rounded-2xl shadow-xl border border-[#332122] overflow-auto text-gray-200">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 font-['Lexend']">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link to="/dashboard/atleta"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 font-semibold text-sm mb-6 transition-all duration-200 group"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform duration-200">
          </span>
        </Link>


        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-100">
              Gestión de Atletas
            </h1>
            <p className="text-gray-400 text-lg">
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={openCreateModal}
              className="
        group flex items-center gap-3
        px-8 py-4 rounded-2xl
        text-sm font-semibold text-white
        bg-gradient-to-r from-[#b30c25] via-[#362022] to-[#332122]
        hover:brightness-110
        focus:outline-none focus:ring-2 focus:ring-[#b30c25]
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-300
        shadow-lg shadow-[#b30c25]/40
        active:scale-95
    "      >
              <UserPlus size={18} />
              Nuevo Atleta
            </button>

            <button
              onClick={exportPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
            bg-[#1a1a1a] border border-[#332122] hover:bg-[#242223] transition"
            >
              <FileText size={16} />
              Exportar PDF
            </button>
          </div>
        </div>


        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          {/* Buscador */}
          <div className="relative ">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 material-symbols-outlined">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, correo o identificación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
        w-full pl-12 pr-4 py-4 rounded-2xl
        bg-[#1f1c1d]
        border border-[#332122]
        text-gray-100 placeholder-gray-500
        focus:border-[#b30c25]
        focus:ring-1 focus:ring-[#b30c25]/40
        outline-none transition-all
        shadow-inner
      "
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="
    w-full pl-12 pr-4 py-4 rounded-2xl
    bg-[#1f1c1d]
    border border-[#332122]
    text-gray-100 placeholder-gray-500
    focus:border-[#b30c25]
    focus:ring-1 focus:ring-[#b30c25]/40
    outline-none transition-all
    shadow-inner
  "            >
              <option value="">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
            {/* Flecha custom */}
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 material-symbols-outlined">
              expand_more
            </span>
          </div>

        </div>

        {/* CARD */}
        <div className="bg-[#212121] rounded-2xl border border-[#332122] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">

            {/* Tabla */}

            <table className="w-full text-left">


              <thead className="bg-[#1a1a1a] border-b border-[#332122]">
                <tr className="bg-[#1a1a1a] border-b border-[#332122]">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Apellido</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Correo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Tipo ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Estamento</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Teléfono</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Dirección</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent">
                    <td className="px-4 py-3">{user.username}</td>
                    <td className="px-4 py-3">{user.first_name}</td>
                    <td className="px-4 py-3">{user.last_name}</td>
                    <td className="px-4 py-3 flex items-center gap-2 text-gray-300">
                      <Mail size={14} className="text-[#b30c25]" />
                      {user.email}
                    </td>

                    <td className="px-4 py-3">{user.tipo_identificacion}</td>
                    <td className="px-4 py-3">{user.identificacion}</td>
                    <td className="px-4 py-3">{user.tipo_estamento}</td>
                    <td className="px-4 py-3">{user.phone}</td>
                    <td className="px-4 py-3">{user.direccion}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase ${user.is_active
                          ? 'bg-green-500/10 text-green-400 ring-1 ring-green-500/30'
                          : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/30'
                          }`}
                      >
                        {user.is_active ? "Activo" : "Inactivo"}
                      </span>

                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="11" className="text-center py-10 text-gray-500">
                      No hay atletas registrados.
                    </td>

                  </tr>
                )}
              </tbody>
            </table>

            {/* Modal */}
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Overlay */}
                <div
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                  onClick={closeModal}
                />

                {/* Modal container */}
                <div className="relative z-10 w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden shadow-2xl">
                  <EditUserModal
                    asModal
                    user={selectedUser}
                    onClose={closeModal}
                    onUpdated={fetchAthletes}
                  />
                </div>
              </div>

            )}
          </div>

        </div >
      </div>
    </div>
  );
};



export default AthletesTable;
