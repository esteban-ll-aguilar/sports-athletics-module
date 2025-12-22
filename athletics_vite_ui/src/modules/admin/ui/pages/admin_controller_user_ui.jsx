import { useEffect, useState, useMemo } from "react";
import adminService from "../../services/adminService";
import { Shield, Mail, UserCog, FileText } from "lucide-react";
import EditUserModal from "./EditUserModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers();
      setUsers(response.users || []);
    } catch (err) {
      setError("No se pudo cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Usuarios filtrados
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter ? user.role === roleFilter : true;

      const matchesStatus =
        statusFilter === ""
          ? true
          : statusFilter === "activo"
          ? user.is_active
          : !user.is_active;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

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
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserCog className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Usuarios del Sistema
            </h2>
          </div>

          <button
            onClick={exportPDF}
            className="flex items-center gap-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
          >
            <FileText size={16} />
            Exportar PDF
          </button>
        </div>

        {/* Filtros */}
        <div className="px-6 py-4 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre o correo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring focus:ring-indigo-200"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring focus:ring-indigo-200"
          >
            <option value="">Todos los roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring focus:ring-indigo-200"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        {/* Tabla */}
        <table className="w-full table-fixed divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Correo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Rol
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium truncate">
                  {user.username}
                </td>

                <td className="px-4 py-3 text-sm text-gray-600 truncate">
                  <div className="flex items-center">
                    <Mail size={14} className="mr-2 text-gray-400" />
                    {user.email}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
                    <Shield size={12} className="mr-1" />
                    {user.role}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      user.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.is_active ? "Activo" : "Inactivo"}
                  </span>
                </td>

                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="text-sm font-medium text-indigo-600 hover:underline"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdated={fetchUsers}
        />
      )}
    </>
  );
};

export default AdminUsersTable;
