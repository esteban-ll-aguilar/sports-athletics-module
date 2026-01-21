import { useEffect, useState, useMemo } from "react";
import adminService from "../../services/adminService";
import { Shield, Mail, UserCog, FileText } from "lucide-react";
import EditUserModal from "./EditUserModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Link } from "react-router-dom";


const AdminUsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

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
      console.log('🔵 [ADMIN CONTROLLER] Iniciando petición de usuarios con rol:', roleFilter || 'Todos');
      const response = await adminService.getUsers(1, 20, roleFilter);

      console.log('🔵 [ADMIN CONTROLLER] RESPUESTA RAW:', response);

      const usersData = response.items || response.users || [];
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
    console.log('🔵 [ADMIN CONTROLLER] Filtrando usuarios en frontend. Total:', users.length);
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
    console.log('🔵 [ADMIN CONTROLLER] Usuarios después del filtro:', filtered.length);
    return filtered;
  }, [users, searchTerm, statusFilter]);

  // 📄 Exportar PDF (Vite compatible)
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
      headStyles: { fillColor: [79, 70, 229] }, // Indigo
      alternateRowStyles: { fillColor: [245, 247, 255] },
    });

    doc.save("usuarios.pdf");
  };

  // ⏳ Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin h-10 w-10 rounded-full border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // ❌ Error
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  // Roles únicos
  const roles = Array.from(new Set(users.map((u) => u.role)));

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 font-['Lexend']">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          to="/dashboard/pruebas"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 font-semibold text-sm mb-6 transition-all duration-200 group"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform duration-200">

          </span>
        </Link>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl font-black text-gray-100">
              Usuarios del Sistema
            </h1>

          </div>

          <button
            onClick={exportPDF}
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
    "    >
            <FileText size={16} />
            Exportar PDF
          </button>
        </div>


        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre o correo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
                w-full pl-12 pr-4 py-4 rounded-2xl
                bg-[#1f1c1d]
                border border-[#332122]
                text-gray-100
                focus:border-[#b30c25]
                focus:ring-1 focus:ring-[#b30c25]/40
                outline-none
              "    />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="
              w-full px-4 py-4 rounded-2xl
              bg-[#1f1c1d]
              border border-[#332122]
              text-gray-100
              focus:border-[#b30c25]
              focus:ring-1 focus:ring-[#b30c25]/40
              outline-none
            ">
            <option value="">Todos los roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>


        </div>

        {/* Tabla */}
        <div className="bg-[#212121] rounded-2xl border border-[#332122] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">

            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#1a1a1a] border-b border-[#332122]">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">

                    Nombre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Correo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">   
                                 Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">   
                                 Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">             
                       Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#332122]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/30">
                   
                      <td className="px-6 py-5 font-bold text-gray-200">
                      {user.username}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/30">
                        <Shield size={12} className="mr-1" />
                        {user.role}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase ${user.is_active
                          ? 'bg-green-500/10 text-green-400 ring-1 ring-green-500/30'
                          : ' bg-red-500/10 text-red-400 ring-1 ring-red-500/30'
                          }`}
                      >
                        {user.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                          title="Editar usuario"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan="5" className="py-20 text-center text-gray-400">
                      No hay usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </div>
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdated={fetchUsers}
        />
      )}
    </div>


  );

};

export default AdminUsersTable;
