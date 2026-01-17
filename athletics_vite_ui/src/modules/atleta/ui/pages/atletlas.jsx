import { useEffect, useState, useMemo } from "react";
import AtletaService from "../../services/AtletaService";
import { Mail, FileText, User, UserPlus } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import EditUserModal from "../widgets/atletasModal";

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
      <div className="flex justify-center items-center min-h-[300px]">
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
    <div className="bg-[#212121] rounded-2xl shadow-xl border border-[#332122] overflow-auto text-gray-200">

      {/* Header */}
      <div className="px-6 py-5 border-b border-[#332122] flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="text-green-600" />
          <h2 className="text-lg font-semibold text-white">Listado de Atletas</h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
            bg-gradient-to-r from-[#b30c25] to-[#5a0f1d] hover:brightness-110 transition"
          >
            <UserPlus size={16} />
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
      <div className="px-6 py-4 flex flex-wrap gap-4 bg-[#1a1a1a] border-b border-[#332122]">
        <input
          type="text"
          placeholder="Buscar por nombre, correo o identificación"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="
            bg-[#121212] border border-[#332122] rounded-lg px-4 py-2
            text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-[#b30c25]
        "
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="
            bg-[#121212] border border-[#332122] rounded-lg px-4 py-2
            text-gray-200 focus:ring-2 focus:ring-[#b30c25]
        "
        >
          <option value="">Todos</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      {/* Tabla */}
      <table className="w-full divide-y table-auto min-w-[900px]">
        <thead className="bg-[#1a1a1a] border-b border-[#332122]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Usuario</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Nombre</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Apellido</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Correo</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Tipo ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Estamento</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Teléfono</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Dirección</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Estado</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id} className="hover:bg-[#242223] transition-colors">
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
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${user.is_active
                    ? "bg-green-900/30 text-green-400 border-green-700"
                    : "bg-red-900/30 text-red-400 border-red-700"
                    }`}
                >
                  {user.is_active ? "Activo" : "Inactivo"}
                </span>

              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => openEditModal(user)}
                  className="text-sm font-medium text-[#b30c25] hover:underline"
                >
                  Editar
                </button>

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
        <EditUserModal
          user={selectedUser}
          onClose={closeModal}
          onUpdated={fetchAthletes}
        />
      )}
    </div>
  );
};

export default AthletesTable;
