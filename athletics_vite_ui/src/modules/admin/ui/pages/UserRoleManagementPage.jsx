import React, { useState, useEffect } from 'react';
import { Search, User } from 'lucide-react';
import adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';
import { getUserEmail } from '../../../auth/utils/roleUtils';

const UserRoleManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleChanges, setRoleChanges] = useState({});

  const currentUserEmail = getUserEmail();

  const roles = [
    'ADMINISTRADOR',
    'ENTRENADOR',
    'ATLETA',
    'REPRESENTANTE'
  ];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log('🔵 [ADMIN] Iniciando petición de usuarios...');
      const response = await adminService.getUsers();

      console.log('🔵 [ADMIN] RESPUESTA RAW BACKEND:', response);
      console.log('🔵 [ADMIN] response.items:', response?.items);
      console.log('🔵 [ADMIN] Tipo de response:', typeof response);
      console.log('🔵 [ADMIN] Es array response?:', Array.isArray(response));

      const usersArray =
        response?.items ||
        response?.data ||
        response?.results ||
        response?.users ||
        (Array.isArray(response) ? response : []);

      console.log('🔵 [ADMIN] USUARIOS EXTRAIDOS:', usersArray);
      console.log('🔵 [ADMIN] Cantidad de usuarios:', usersArray?.length);
      console.log('🔵 [ADMIN] Es array usersArray?:', Array.isArray(usersArray));

      if (!Array.isArray(usersArray)) {
        console.error('🔴 [ADMIN] ERROR: usersArray no es un array!');
        toast.error('Formato de usuarios inválido');
        setUsers([]);
      } else {
        console.log('🟢 [ADMIN] Estableciendo usuarios en el estado:', usersArray);
        setUsers(usersArray);
      }
    } catch (error) {
      console.error('🔴 [ADMIN] ERROR FETCH USERS:', error);
      console.error('🔴 [ADMIN] Error details:', error.message, error.stack);
      toast.error('Error al cargar usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
      console.log('🔵 [ADMIN] fetchUsers completado');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ===============================
  // ROLE HANDLERS
  // ===============================
  const handleRoleChange = (userId, role) => {
    setRoleChanges(prev => ({
      ...prev,
      [userId]: role
    }));
  };

  const handleCancelChange = (userId) => {
    setRoleChanges(prev => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });
  };

  const handleSaveRole = async (userId) => {
    const role = roleChanges[userId];
    if (!role) return;

    try {
      const updatedUser = await adminService.updateUserRole(userId, role);

      setUsers(prev =>
        prev.map(u => (u.id === userId ? updatedUser : u))
      );

      handleCancelChange(userId);
      toast.success('Rol actualizado');
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar rol');
    }
  };

  const handleSaveAll = async () => {
    try {
      await Promise.all(
        Object.entries(roleChanges).map(([id, role]) =>
          adminService.updateUserRole(id, role)
        )
      );
      toast.success('Roles actualizados');
      setRoleChanges({});
      fetchUsers();
    } catch {
      toast.error('Error al guardar todos');
    }
  };

  // ===============================
  // FILTER
  // ===============================
  const filteredUsers = users.filter(user => {
    const matches =
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());

    return matches;
  });

  console.log('🔵 [ADMIN] Users en estado:', users);
  console.log('🔵 [ADMIN] Usuarios filtrados:', filteredUsers);
  console.log('🔵 [ADMIN] searchTerm:', searchTerm);

  if (loading) {
    return <div className="p-6">Cargando usuarios...</div>;
  }

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="p-6 max-w-6xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Gestión de Roles
      </h1>

      {/* SEARCH */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por email o nombre"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border rounded"
        />
      </div>

      {/* EMPTY STATE */}
      {filteredUsers.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          No hay usuarios para mostrar
        </div>
      )}

      {/* TABLE */}
      {filteredUsers.length > 0 && (
        <div className="bg-white shadow rounded border">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredUsers.map(user => (
                <tr key={user.id} className={roleChanges[user.id] ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {user.profile_image ? (
                        <img
                          src={user.profile_image}
                          alt=""
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="font-medium">
                          {user.username || 'Sin nombre'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={roleChanges[user.id] || user.role}
                      onChange={e => handleRoleChange(user.id, e.target.value)}
                      className="border rounded px-3 py-2 w-full"
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        disabled={!roleChanges[user.id]}
                        onClick={() => handleSaveRole(user.id)}
                        className={`px-3 py-2 rounded text-white ${roleChanges[user.id]
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-gray-400 cursor-not-allowed'
                          }`}
                      >
                        Guardar
                      </button>

                      {roleChanges[user.id] && (
                        <button
                          onClick={() => handleCancelChange(user.id)}
                          className="px-3 py-2 border rounded"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SAVE ALL */}
      {Object.keys(roleChanges).length > 0 && (
        <div className="mt-4 text-right">
          <button
            onClick={handleSaveAll}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Guardar todo
          </button>
        </div>
      )}
    </div>
  );
};

export default UserRoleManagementPage;
