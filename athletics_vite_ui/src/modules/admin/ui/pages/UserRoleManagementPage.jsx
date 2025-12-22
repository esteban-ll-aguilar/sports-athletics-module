import React, { useState, useEffect } from 'react';
import { Search, Save, User, ChevronLeft, ChevronRight } from 'lucide-react';
import adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';
import { getUserEmail } from '../../../auth/utils/roleUtils';

const UserRoleManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(20);
    const [roleChanges, setRoleChanges] = useState({});
    const currentUserEmail = getUserEmail();

    const roles = ['ADMINISTRADOR', 'ENTRENADOR', 'ATLETA', 'REPRESENTANTE'];

    const fetchUsers = React.useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminService.getUsers(currentPage, itemsPerPage);
            setUsers(data.items);
            setTotalPages(data.pages);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Error al cargar usuarios");
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = (userId, newRole) => {
        setRoleChanges(prev => ({
            ...prev,
            [userId]: newRole
        }));
    };

    const handleCancelChange = (userId) => {
        setRoleChanges(prev => {
            const newState = { ...prev };
            delete newState[userId];
            return newState;
        });
    };

    const handleSaveRole = async (userId) => {
        const newRole = roleChanges[userId];
        if (!newRole) return;

        try {
            // userId is the external_id (UUID) from the backend
            const updatedUser = await adminService.updateUserRole(userId, newRole);
            toast.success("Rol actualizado correctamente");

            // Update local state with the FULL updated user object (including new external_id)
            setUsers(users.map(u => u.id === userId ? updatedUser : u));

            setRoleChanges(prev => {
                const newState = { ...prev };
                delete newState[userId];
                return newState;
            });
        } catch (error) {
            console.error("Error updating role:", error);
            toast.error("Error al actualizar el rol");
        }
    };

    const handleSaveAll = async () => {
        const promises = Object.entries(roleChanges).map(([userId, role]) =>
            adminService.updateUserRole(userId, role)
        );

        try {
            await Promise.all(promises);
            toast.success("Todos los roles actualizados");
            fetchUsers();
            setRoleChanges({});
        } catch {
            toast.error("Error al guardar algunos cambios");
        }
    };

    // Filter users locally (within the current page) and exclude current user
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()));
        const isNotCurrentUser = user.email !== currentUserEmail;
        return matchesSearch && isNotCurrentUser;
    });

    if (loading) return <div className="p-6">Cargando...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Roles de Usuario</h1>
                <p className="mt-1 text-sm text-gray-500">Asigna o modifica los permisos de los usuarios en la plataforma.</p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Buscar usuario por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Usuario
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rol Actual
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className={roleChanges[user.id] ? 'bg-red-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="shrink-0 h-10 w-10">
                                            {user.profile_image ? (
                                                <img className="h-10 w-10 rounded-full" src={user.profile_image} alt="" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <User className="h-6 w-6 text-gray-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.username || 'Usuario sin nombre'}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={roleChanges[user.id] || user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    >
                                        {roles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleSaveRole(user.id)}
                                            disabled={!roleChanges[user.id]}
                                            className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm ${roleChanges[user.id]
                                                ? 'text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                                                : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            Guardar
                                        </button>
                                        {roleChanges[user.id] && (
                                            <button
                                                onClick={() => handleCancelChange(user.id)}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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

            {/* Pagination & Save All */}
            <div className="py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Anterior
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Siguiente
                    </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                                <span className="sr-only">Anterior</span>
                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </button>
                            {/* Simple pagination numbers */}
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1
                                        ? 'z-10 bg-red-50 border-red-500 text-red-600'
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                                <span className="sr-only">Siguiente</span>
                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>

                        {Object.keys(roleChanges).length > 0 && (
                            <button
                                onClick={handleSaveAll}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Guardar todo
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserRoleManagementPage;
