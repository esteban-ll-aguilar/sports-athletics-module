import { useEffect, useState, useMemo } from "react";
import adminService from "../../services/adminService";
import { Shield, Mail, UserCog, FileText, Search, Filter, UserPlus, X } from "lucide-react";
import EditUserModal from "./EditUserModal";
import RegisterPage from "../../../auth/ui/pages/RegisterPage";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Link } from "react-router-dom";


const AdminUsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  // Register Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // 🔍 Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(1, 20, roleFilter);
      const usersData = response?.items || response?.users || [];
      setUsers(usersData);
    } catch (err) {
      console.error('🔴 [ADMIN CONTROLLER] ERROR:', err);
      setError("No se pudo cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Usuarios filtrados (solo búsqueda y estado en frontend, rol en backend)
  const filteredUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

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

  // 📄 Exportar PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Listado de Usuarios del Sistema", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [["Nombre", "Correo", "Rol", "Estado"]],
      body: filteredUsers.map((user) => [
        user.username,
        user.email,
        user.role,
        user.is_active ? "Activo" : "Inactivo",
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [179, 12, 37] }, // Red brand
      alternateRowStyles: { fillColor: [245, 247, 255] },
    });

    doc.save("usuarios.pdf");
  };

  // ⏳ Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-[#121212] transition-colors duration-300">
        <div className="animate-spin h-10 w-10 rounded-full border-t-2 border-b-2 border-[#b30c25]" />
      </div>
    );
  }

  // ❌ Error
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-[#121212]">
        <div className="bg-white dark:bg-[#212121] border-l-4 border-red-500 p-6 rounded-lg shadow-lg">
          <p className="text-gray-800 dark:text-gray-200">{error}</p>
          <button onClick={fetchUsers} className="mt-4 text-[#b30c25] hover:underline">Reintentar</button>
        </div>
      </div>
    );
  }

  // Roles únicos
  const roles = Array.from(new Set(users.map((u) => u.role)));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 font-['Lexend'] transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb - Optional logic */}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                Usuarios del Sistema
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Administración general de usuarios y roles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="
                                group flex items-center gap-3
                                px-6 py-3 rounded-xl
                                text-sm font-semibold text-white
                                bg-gradient-to-r from-[#b30c25] via-[#a00b21] to-[#80091b]
                                hover:shadow-lg hover:shadow-red-900/20 hover:-translate-y-0.5
                                active:translate-y-0 active:shadow-none
                                transition-all duration-300
                            "
            >
              <UserPlus size={18} />
              <span>Registrar Usuario</span>
            </button>

            <button
              onClick={exportPDF}
              className="
                                group flex items-center gap-3
                                px-6 py-3 rounded-xl
                                text-sm font-semibold text-[#b30c25]
                                bg-red-50 dark:bg-red-900/10
                                border border-red-100 dark:border-red-900/30
                                hover:bg-red-100 dark:hover:bg-red-900/20
                                hover:-translate-y-0.5
                                active:translate-y-0 active:shadow-none
                                transition-all duration-300
                            "
            >
              <FileText size={18} />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>


        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                                w-full pl-12 pr-4 py-3 rounded-xl
                                bg-white dark:bg-[#212121]
                                border border-gray-200 dark:border-[#332122]
                                text-gray-900 dark:text-gray-100
                                placeholder-gray-400 dark:placeholder-gray-500
                                focus:border-[#b30c25] focus:ring-1 focus:ring-[#b30c25]/30
                                outline-none transition-all shadow-sm
                            "
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="
                                w-full pl-12 pr-10 py-3 rounded-xl
                                bg-white dark:bg-[#212121]
                                border border-gray-200 dark:border-[#332122]
                                text-gray-900 dark:text-gray-100
                                focus:border-[#b30c25] focus:ring-1 focus:ring-[#b30c25]/30
                                outline-none transition-all shadow-sm appearance-none cursor-pointer
                            "
            >
              <option value="">Todos los roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined">
              expand_more
            </span>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white dark:bg-[#212121] rounded-2xl border border-gray-200 dark:border-[#332122] shadow-sm overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#332122]">
                <tr>
                  {["Nombre", "Correo", "Rol", "Estado", "Acciones"].map((head) => (
                    <th key={head} className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-[#332122]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2829] transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200 whitespace-nowrap">
                      {user.username}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Mail size={14} className="text-[#b30c25]" />
                        {user.email}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-700/30">
                        <Shield size={12} className="mr-1" />
                        {user.role}
                      </span>
                    </td>

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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setIsRegisterModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-[#b30c25] hover:bg-red-50 dark:hover:bg-[#332122] rounded-lg transition-colors"
                          title="Editar usuario"
                        >
                          <UserCog size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-gray-500 dark:text-gray-400">
                      No hay usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>


      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setIsRegisterModalOpen(false);
              setEditingUser(null);
            }}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => {
                  setIsRegisterModalOpen(false);
                  setEditingUser(null);
                }}
                className="p-2 rounded-full bg-white dark:bg-[#212121] hover:bg-gray-100 dark:hover:bg-[#2a2829] text-gray-500 dark:text-gray-400 shadow-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <RegisterPage
              isModal={true}
              userData={editingUser}
              onClose={() => {
                setIsRegisterModalOpen(false);
                setEditingUser(null);
              }}
              onSuccess={() => {
                fetchUsers();
                setIsRegisterModalOpen(false);
                setEditingUser(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersTable;
