import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Shield, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import adminRepository from '../../repositories/admin_repository';
import Swal from 'sweetalert2';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(0);
    const [roleFilter, setRoleFilter] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState(null);
    // Actually I can just add it to the top. I'll split this chunk.

    const ROLES = ['ATLETA', 'ENTRENADOR', 'REPRESENTANTE', 'ADMIN'];
    const PAGE_SIZE = 20;

    useEffect(() => {
        fetchUsers();
    }, [page, roleFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await adminRepository.listUsers(page, PAGE_SIZE, roleFilter || null);

            // Backend returns APIResponse wrapping PaginatedUsers
            if (response.success && response.data) {
                setUsers(response.data.items || []);
                setTotal(response.data.total || 0);
                setPages(response.data.pages || 0);
            } else {
                toast.error(response.message || 'Error al cargar usuarios');
                setUsers([]);
            }
        } catch (error) {
            const msg = error.message || error.detail || 'Error al cargar usuarios';
            toast.error(msg);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId, currentRole) => {
        const { value: newRole } = await Swal.fire({
            title: 'Actualizar Rol',
            input: 'select',
            inputOptions: ROLES.reduce((acc, role) => {
                acc[role] = role;
                return acc;
            }, {}),
            inputValue: currentRole,
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#b30c25',
            cancelButtonColor: '#332122',
            background: '#242223',
            color: '#fff',
            inputValidator: (value) => {
                if (!value) {
                    return 'Debes seleccionar un rol';
                }
            }
        });

        if (!newRole || newRole === currentRole) return;

        setUpdatingUserId(userId);
        try {
            const response = await adminRepository.updateUserRole(userId, newRole);

            if (response.success && response.data) {
                toast.success('Rol actualizado exitosamente');
                fetchUsers(); // Refresh list
            } else {
                toast.error(response.message || 'Error al actualizar rol');
            }
        } catch (error) {
            const msg = error.message || error.detail || 'Error al actualizar rol';
            toast.error(msg);
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pages) {
            setPage(newPage);
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#111] p-6 transition-colors duration-300">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-[#332122] rounded w-1/3 mb-4"></div>
                        <div className="h-64 bg-white dark:bg-[#212121] rounded-2xl border border-gray-100 dark:border-none"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#111] p-6 transition-colors duration-300 relative">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="text-[#b30c25]" size={32} />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Gestión de Usuarios</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 transition-colors">Administra roles y permisos de usuarios</p>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-[#212121] rounded-2xl p-6 mb-6 border border-gray-200 dark:border-[#332122] shadow-sm transition-colors duration-300">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                                Filtrar por Rol
                            </label>
                            <select
                                value={roleFilter}
                                onChange={(e) => {
                                    setRoleFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-[#332122] rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-[#b30c25] focus:outline-none transition-colors"
                            >
                                <option value="">Todos los roles</option>
                                {ROLES.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => fetchUsers()}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-100 dark:bg-[#332122] hover:bg-gray-200 dark:hover:bg-[#402a2c] text-gray-700 dark:text-white rounded-lg transition-colors flex items-center gap-2 border border-gray-200 dark:border-transparent"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-[#212121] rounded-2xl border border-gray-200 dark:border-[#332122] overflow-hidden shadow-sm transition-colors duration-300">
                    {users.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>No hay usuarios registrados</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#332122] transition-colors">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Username</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rol</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estado</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-[#332122] transition-colors">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{user.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.username}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-900/30 text-purple-400 border border-purple-700' :
                                                        user.role === 'ENTRENADOR' ? 'bg-blue-900/30 text-blue-400 border border-blue-700' :
                                                            user.role === 'ATLETA' ? 'bg-green-900/30 text-green-400 border border-green-700' :
                                                                'bg-gray-900/30 text-gray-400 border border-gray-700'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.is_active
                                                        ? 'bg-green-900/30 text-green-400 border border-green-700'
                                                        : 'bg-red-900/30 text-red-400 border border-red-700'
                                                        }`}>
                                                        {user.is_active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        onClick={() => handleRoleUpdate(user.id, user.role)}
                                                        disabled={updatingUserId === user.id}
                                                        className="px-3 py-1 bg-[#b30c25] hover:bg-[#8a0a1d] text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                                    >
                                                        {updatingUserId === user.id ? (
                                                            <RefreshCw className="w-3 h-3 animate-spin inline" />
                                                        ) : (
                                                            'Cambiar Rol'
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-[#332122] flex items-center justify-between transition-colors">
                                    <div className="text-sm text-gray-400">
                                        Mostrando página {page} de {pages} ({total} usuarios totales)
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page === 1}
                                            className="px-3 py-1 bg-gray-100 dark:bg-[#332122] hover:bg-gray-200 dark:hover:bg-[#402a2c] text-gray-700 dark:text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Anterior
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(page + 1)}
                                            disabled={page === pages}
                                            className="px-3 py-1 bg-gray-100 dark:bg-[#332122] hover:bg-gray-200 dark:hover:bg-[#402a2c] text-gray-700 dark:text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagementPage;
