import { useEffect, useState, useMemo } from "react";
import AtletaService from "../../services/AtletaService";
import { Mail, FileText, User, UserPlus, Search, Filter, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import RegisterPage from "../../../auth/ui/pages/RegisterPage";
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
      const response = await AtletaService.getAthletes();
      const athletes = response?.items || response || [];

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
        fecha_nacimiento: u.fecha_nacimiento || "",
        sexo: u.sexo || "M",
        is_active: u.is_active ?? true,
        id: u.id,
        role: u.role || "ATLETA",
      }));

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
    return filtered;
  }, [users, searchTerm, statusFilter]);

  const exportPDF = () => {
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
      headStyles: { fillColor: [179, 12, 37] }, // Red brand color
    });

    doc.save("atletas.pdf");
  };




  const openCreateModal = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center font-['Lexend'] transition-colors duration-300">
        <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-[#b30c25]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] p-8 flex justify-center items-start transition-colors duration-300">
        <div className="bg-white dark:bg-[#212121] rounded-2xl shadow-xl border border-gray-200 dark:border-[#332122] p-6 max-w-lg w-full text-center">
          <div className="p-3 bg-red-100 text-red-600 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <span className="material-symbols-outlined">error</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Error</h3>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
          <button
            onClick={fetchAthletes}
            className="mt-6 px-4 py-2 bg-[#b30c25] text-white rounded-lg hover:bg-[#8f091d] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 font-['Lexend'] transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                Gestión de Atletas
              </h1>
            </div>

            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Administra el listado de atletas registrados en el sistema.
            </p>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="w-full sm:w-auto flex gap-3">
            <button
              onClick={openCreateModal}
              className="
                            flex items-center gap-2 justify-center
                            px-6 py-3 rounded-xl w-full sm:w-auto
                            text-sm font-semibold text-white
                            bg-gradient-to-r from-[#b30c25] via-[#a00b21] to-[#80091b]
                            hover:shadow-lg hover:shadow-red-900/20 hover:-translate-y-0.5
                            active:translate-y-0 active:shadow-none
                            transition-all duration-300
                            "
            >
              <UserPlus size={18} />
              Nuevo Atleta
            </button>

            <button
              onClick={exportPDF}
              className="
                            flex items-center gap-2 justify-center
                            px-4 py-3 rounded-xl w-full sm:w-auto
                            text-sm font-medium
                            bg-white dark:bg-[#212121]
                            text-gray-700 dark:text-gray-300
                            border border-gray-200 dark:border-[#332122]
                            hover:bg-gray-50 dark:hover:bg-[#2a2829]
                            transition-colors
                            "
            >
              <FileText size={18} />
              Exportar PDF
            </button>
          </div>
        </div>


        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Buscador */}
          <div className="col-span-1 md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              id="athlete-search"
              aria-label="Buscar atletas"
              type="text"
              placeholder="Buscar por nombre, correo o identificación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                            w-full pl-12 pr-4 py-3 rounded-xl
                            bg-white dark:bg-[#212121]
                            text-gray-900 dark:text-gray-100
                            placeholder-gray-400 dark:placeholder-gray-500
                            border border-gray-200 dark:border-[#332122]
                            focus:border-[#b30c25] focus:ring-1 focus:ring-[#b30c25]/30
                            outline-none transition-all shadow-sm
                            "
            />
          </div>

          {/* Filtro Estado */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              id="status-filter"
              aria-label="Filtrar por estado"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="
                            w-full pl-12 pr-10 py-3 rounded-xl
                            bg-white dark:bg-[#212121]
                            text-gray-900 dark:text-gray-100
                            border border-gray-200 dark:border-[#332122]
                            focus:border-[#b30c25] focus:ring-1 focus:ring-[#b30c25]/30
                            outline-none transition-all shadow-sm appearance-none cursor-pointer
                            "
            >
              <option value="">Todos los Estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined">
              expand_more
            </span>
          </div>
        </div>

        {/* TABLA */}
        <div className="bg-white dark:bg-[#212121] rounded-2xl border border-gray-200 dark:border-[#332122] shadow-sm overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#332122]">
                <tr>
                  {["Usuario", "Nombre", "Apellido", "Correo", "Tipo ID", "ID", "Estamento", "Teléfono", "Dirección", "Estado", "Acciones"].map((head) => (
                    <th key={head} className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-[#332122]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2829] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.first_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.last_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-[#b30c25]" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">{user.tipo_identificacion}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">{user.identificacion}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                        {user.tipo_estamento}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{user.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm max-w-[150px] truncate">{user.direccion}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${user.is_active
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-900/30'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-900/30'
                          }`}
                      >
                        {user.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-gray-400 hover:text-[#b30c25] hover:bg-red-50 dark:hover:bg-[#332122] rounded-lg transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="11" className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <User className="h-10 w-10 opacity-20" />
                        <p>No se encontraron atletas.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="edit-user-modal">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={closeModal}
              role="presentation"
            />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full bg-white dark:bg-[#212121] hover:bg-gray-100 dark:hover:bg-[#2a2829] text-gray-500 dark:text-gray-400 shadow-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <RegisterPage
                isModal={true}
                userData={selectedUser}
                onClose={closeModal}
                onSuccess={() => {
                  fetchAthletes();
                  closeModal();
                }}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AthletesTable;
