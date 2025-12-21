import { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import { Shield, Mail, UserCog } from "lucide-react";
import EditUserModal from "./EditUserModal";

const AdminUsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers();
      console.log("Data desde del bankend",response);
      setUsers(response.users || []);
    } catch {
      setError("No se pudo cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin h-10 w-10 rounded-full border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center">
          <UserCog className="text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">
            Usuarios del Sistema
          </h2>
        </div>

        {/* Table */}
        <table className="w-full table-fixed divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Correo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {users.map((user) => (
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

                {/* Estado (visual igual al modal) */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium
                      ${user.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"}`}
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

            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-sm text-gray-500">
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


