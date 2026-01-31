import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    User,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    ChevronDown
} from 'lucide-react';
import authService from '@modules/auth/services/auth_service';
import { getUserRole, getUserEmail, getUserName } from '../../../../auth/utils/roleUtils';
import rolePermissions from '../../../../../core/router/const/rolePermissions';
import Settings from '../../../../../config/enviroment';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

    const [expandedItems, setExpandedItems] = useState({});

    const toggleExpand = (path) => {
        setExpandedItems(prev => ({
            ...prev,
            [path]: !prev[path]
        }));
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await authService.getProfile();
                if (response.data) {
                    setUserProfile(response.data);
                }
            } catch (error) {
                console.error("Error loading sidebar profile", error);
            }
        };
        fetchUserProfile();
    }, []);

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    const menuItems = []
    const role = getUserRole();
    if (role) {
        menuItems.push(...rolePermissions[role]);
    }

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={toggleMobileSidebar}
                    className="p-2 rounded-lg bg-[#b30c25] text-white shadow-lg focus:outline-none hover:bg-[#8f0a1e] transition-colors"
                >
                    {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div
                className={`
        fixed top-0 left-0 h-full bg-white dark:bg-[#1f1c1d] shadow-2xl z-40 transition-all duration-300 ease-in-out
        border-r border-gray-200 dark:border-[#332122]
        ${isOpen ? 'w-64' : 'w-20'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}
            >

                {/* Logo Section */}
                <div className="flex items-center justify-between h-20 px-4 border-b border-gray-100 dark:border-[#332122]">
                    <div className={`flex items-center ${!isOpen && 'justify-center w-full'}`}>
                        <div className="w-10 h-10 bg-linear-to-br from-[#b30c25] to-[#80091b] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-900/20">
                            A
                        </div>
                        {isOpen && (
                            <span className="ml-3 text-lg font-black text-gray-900 dark:text-white tracking-tight truncate">
                                Athletics
                            </span>
                        )}
                    </div>
                    {/* Desktop Toggle Button */}
                    <button
                        onClick={toggleSidebar}
                        className="hidden md:flex p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#332122] text-gray-500 dark:text-gray-400 transition-colors"
                    >
                        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="mt-6 px-3 space-y-1.5 overflow-y-auto h-[calc(100vh-180px)] thin-scrollbar">
                    {menuItems.map((item) => {
                        // Logic for items with children (Accordion view)
                        if (item.children && isOpen) {
                            const isChildActive = [item.path, ...item.children.map(c => c.path)].includes(location.pathname);
                            const isExpanded = expandedItems[item.path];

                            return (
                                <div key={item.path} className="flex flex-col">
                                    <div
                                        className={`
                                            w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer
                                            ${isChildActive
                                                ? 'bg-red-50 dark:bg-[rgba(179,12,37,0.1)] text-[#b30c25]'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2829] hover:text-gray-900 dark:hover:text-white'}
                                        `}
                                        onClick={() => toggleExpand(item.path)}
                                    >
                                        <div className="flex items-center flex-grow">
                                            <item.icon size={22} className={isChildActive ? 'text-[#b30c25]' : ''} />
                                            <span className="ml-3 font-medium text-sm">{item.label}</span>
                                        </div>
                                        <button className="p-0.5">
                                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        </button>
                                    </div>

                                    {isExpanded && (
                                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 dark:border-[#332122] pl-2">
                                            {item.children.map(child => (
                                                <Link
                                                    key={child.path}
                                                    to={child.path}
                                                    className={`
                                                        block px-3 py-2 text-sm rounded-lg transition-colors duration-200
                                                        ${location.pathname === child.path
                                                            ? 'text-[#b30c25] bg-red-50 dark:bg-[rgba(179,12,37,0.05)] font-semibold'
                                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#2a2829]'}
                                                    `}
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
        flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative
        ${isActive(item.path)
                                        ? 'bg-red-50 dark:bg-[rgba(179,12,37,0.1)] text-[#b30c25]'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2829] hover:text-gray-900 dark:hover:text-white'}
        ${!isOpen && 'justify-center'}
    `}
                            >
                                <item.icon size={22} className={isActive(item.path) ? 'text-[#b30c25]' : ''} />
                                {isOpen && (
                                    <span className="ml-3 font-medium text-sm">{item.label}</span>
                                )}
                                {!isOpen && (
                                    <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                    {/* Perfil de usuario */}
                    <div className="pt-4 mt-2 border-t border-gray-100 dark:border-[#332122]">
                        <Link
                            to="/profile"
                            className={`
                                flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative
                                ${isActive('/profile')
                                    ? 'bg-red-50 dark:bg-[rgba(179,12,37,0.1)] text-[#b30c25]'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2829] hover:text-gray-900 dark:hover:text-white'}
                                ${!isOpen && 'justify-center'}
                            `}
                        >
                            <User size={22} className={isActive('/profile') ? 'text-[#b30c25]' : ''} />
                            {isOpen && <span className="ml-3 font-medium text-sm">Mi Perfil</span>}
                            {!isOpen && (
                                <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                                    Mi Perfil
                                </div>
                            )}
                        </Link>
                    </div>
                </nav>

                {/* User Section & Logout */}
                <div className="absolute bottom-0 w-full border-t border-gray-100 dark:border-[#332122] p-4 bg-gray-50 dark:bg-[#1f1c1d]">
                    <div className={`flex items-center ${!isOpen && 'justify-center'}`}>
                        <div className="relative">
                            {userProfile?.profile_image ? (
                                <img
                                    src={`${Settings.API_URL}/${userProfile.profile_image}`}
                                    alt="User"
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-[#332122] shadow-sm"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + (userProfile.first_name || 'U') + "&background=random"; }}
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-[#b30c25]/20 flex items-center justify-center text-[#b30c25] font-bold border-2 border-white dark:border-[#332122] shadow-sm">
                                    {getUserName() ? getUserName().charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#1f1c1d] rounded-full"></span>
                        </div>

                        {isOpen && (
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                    {getUserName() || 'Usuario'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{getUserEmail()}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className={`
                            mt-4 w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors
                            ${!isOpen && 'justify-center px-0'}
                        `}
                    >
                        <LogOut size={20} />
                        {isOpen && <span className="ml-3">Cerrar Sesión</span>}
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
