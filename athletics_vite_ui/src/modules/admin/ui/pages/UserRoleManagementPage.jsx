import React, { useState, useEffect } from 'react';
import { Search, User, Save, X, Shield } from 'lucide-react';
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
    'PASANTE',
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
        setUsers(usersArray);
      }
    } catch (error) {
      console.error('🔴 [ADMIN] ERROR FETCH USERS:', error);
      toast.error('Error al cargar usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
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

      // Validar que el usuario actualizado tenga los campos necesarios
      if (updatedUser && updatedUser.id) {
        setUsers(prev =>
          prev.map(u => (u.id === userId ? updatedUser : u))
        );
        handleCancelChange(userId);
        toast.success('Rol actualizado');
      } else {
        // Si la respuesta no es válida, recargar la lista completa
        console.warn('Updated user format invalid, reloading users');
        await fetchUsers();
        handleCancelChange(userId);
        toast.success('Rol actualizado');
      }
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
    // Validar que el usuario existe y tiene los campos necesarios
    if (!user || !user.email) return false;
    
    const matches =
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    return matches;
  });

  if (loading) {
    return (
      <div data-testid="loading-state" className="flex justify-center items-center h-screen bg-gray-50 dark:bg-[#121212] transition-colors duration-300">
        <div className="animate-spin h-10 w-10 rounded-full border-t-2 border-b-2 border-[#b30c25]" />
      </div>
    );
  }

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 font-['Lexend'] transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-gray-100">
              Gestión de Roles
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Asigna y modifica roles de usuario del sistema.
            </p>
          </div>
        </div>

        {/* SEARCH & ACTIONS */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por email o nombre..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
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

          {/* SAVE ALL */}
          {Object.keys(roleChanges).length > 0 && (
            <div className="w-full sm:w-auto text-right">
              <button
                onClick={handleSaveAll}
                className="
                    flex items-center gap-2 justify-center
                    px-6 py-3 rounded-xl w-full sm:w-auto
                    text-sm font-semibold text-white
                    bg-linear-to-r from-[#b30c25] via-[#a00b21] to-[#80091b]
                    hover:brightness-110 shadow-lg shadow-red-900/20 active:scale-95
                    transition-all duration-300
                "
              >
                <Save size={18} />
                Guardar cambios ({Object.keys(roleChanges).length})
              </button>
            </div>
          )}
        </div>

        {/* EMPTY STATE */}
        {filteredUsers.length === 0 && (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-[#212121] rounded-2xl border border-gray-200 dark:border-[#332122]">
            No hay usuarios para mostrar.
          </div>
        )}

        {/* TABLE */}
        {filteredUsers.length > 0 && (
          <div className="bg-white dark:bg-[#212121] rounded-2xl border border-gray-200 dark:border-[#332122] shadow-sm overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#332122]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rol Actual
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nuevo Rol
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-[#332122]">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className={`transition-colors ${roleChanges[user.id] ? 'bg-red-50 dark:bg-red-900/10' : 'hover:bg-gray-50 dark:hover:bg-[#2a2829]'}`}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {user.profile_image ? (
                            <img
                              src={user.profile_image}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900 dark:text-gray-200">
                              {user.username || 'Sin nombre'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                          <Shield size={12} className="mr-1" />
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="relative w-full max-w-[200px]">
                          <select
                            value={roleChanges[user.id] || user.role}
                            onChange={e => handleRoleChange(user.id, e.target.value)}
                            className="
                                w-full px-3 py-2 rounded-lg appearance-none cursor-pointer
                                bg-white dark:bg-[#1f1c1d] 
                                border border-gray-300 dark:border-[#332122]
                                text-gray-900 dark:text-gray-100
                                focus:border-[#b30c25] focus:ring-1 focus:ring-[#b30c25]/40
                                outline-none transition-all text-sm
                            "
                          >
                            {roles.map(role => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex gap-2">
                          {roleChanges[user.id] && (
                            <>
                              <button
                                onClick={() => handleSaveRole(user.id)}
                                className="p-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
                                title="Guardar cambio"
                              >
                                <Save size={18} />
                              </button>
                              <button
                                onClick={() => handleCancelChange(user.id)}
                                className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title="Cancelar"
                              >
                                <X size={18} />
                              </button>
                            </>
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
      </div>
    </div>
  );
};

export default UserRoleManagementPage;
