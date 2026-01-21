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

      const response = await adminService.getUsers();
      const usersArray =
        response?.items ||
        response?.data ||
        response?.results ||
        response?.users ||
        (Array.isArray(response) ? response : []);

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
    <div className="min-h-screen bg-[#121212] text-gray-200 font-['Lexend']">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-100">
              Gestión de Roles
            </h1>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por email o nombre"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="
                w-full pl-12 pr-4 py-4 rounded-2xl bg-[#1f1c1d]
                border border-[#332122]
                text-gray-100 placeholder-gray-500
                focus:border-[#b30c25]
                focus:ring-1 focus:ring-[#b30c25]/40
                outline-none transition-all
                shadow-inner
              "
            />
          </div>
        </div>

        {/* EMPTY STATE */}
        {filteredUsers.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No hay usuarios para mostrar
          </div>
        )}

        {/* TABLE */}
        {filteredUsers.length > 0 && (
          <div className="bg-[#212121] rounded-2xl border border-[#332122] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#1a1a1a] border-b border-[#332122]">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#332122]">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className={roleChanges[user.id] ? 'bg-red-50/10' : 'hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent'}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {user.profile_image ? (
                            <img
                              src={user.profile_image}
                              alt=""
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gradient-to-br from-[#b30c25] to-[#5a1a22] rounded-xl flex items-center justify-center">
                              <User className="h-6 w-6 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-200">
                              {user.username || 'Sin nombre'}
                            </p>
                            <p className="text-sm text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <select
                          value={roleChanges[user.id] || user.role}
                          onChange={e => handleRoleChange(user.id, e.target.value)}
                          className="
                            border border-[#332122] rounded px-3 py-2 w-full
                            bg-[#1f1c1d] text-gray-100
                            focus:border-[#b30c25] focus:ring-1 focus:ring-[#b30c25]/40
                            outline-none transition-all
                          "
                        >
                          {roles.map(role => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex gap-2">
                          <button
                            disabled={!roleChanges[user.id]}
                            onClick={() => handleSaveRole(user.id)}
                            className={`px-3 py-2 rounded text-white transition-all duration-200 ${
                              roleChanges[user.id]
                                ? 'bg-gradient-to-r from-[#b30c25] via-[#362022] to-[#332122] hover:brightness-110 shadow-lg shadow-[#b30c25]/40'
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Guardar
                          </button>

                          {roleChanges[user.id] && (
                            <button
                              onClick={() => handleCancelChange(user.id)}
                              className="px-3 py-2 border border-[#332122] rounded text-gray-200 hover:bg-[#1f1c1d] transition-all duration-200"
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
          </div>
        )}

        {/* SAVE ALL */}
        {Object.keys(roleChanges).length > 0 && (
          <div className="mt-6 text-right">
            <button
              onClick={handleSaveAll}
              className="
                px-8 py-4 rounded-2xl
                text-sm font-semibold text-white
                bg-gradient-to-r from-[#b30c25] via-[#362022] to-[#332122]
                hover:brightness-110
                focus:outline-none focus:ring-2 focus:ring-[#b30c25]
                transition-all duration-300
                shadow-lg shadow-[#b30c25]/40
                active:scale-95
              "
            >
              Guardar todo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRoleManagementPage;

