import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Trophy,
    Calendar,
    Activity,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import authService from '@modules/auth/services/auth_service';
import { getUserRole, getUserEmail, getUserName } from '../../../../auth/utils/roleUtils';
import rolePermissions from '../const/rolePermissions';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const toggleSidebar = () => setIsOpen(!isOpen);
    const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

    const handleLogout = () => {
        authService.logout();
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
                    className="p-2 rounded-md bg-indigo-600 text-white shadow-lg focus:outline-none"
                >
                    {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div
                className={`
                    fixed top-0 left-0 h-full bg-white shadow-xl z-40 transition-all duration-300 ease-in-out
                    ${isOpen ? 'w-64' : 'w-20'}
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                {/* Logo Section */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                    <div className={`flex items-center ${!isOpen && 'justify-center w-full'}`}>
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            A
                        </div>
                        {isOpen && (
                            <span className="ml-3 text-lg font-bold text-gray-800 truncate">
                                Athletics
                            </span>
                        )}
                    </div>
                    {/* Desktop Toggle Button */}
                    <button
                        onClick={toggleSidebar}
                        className="hidden md:flex p-1 rounded-full hover:bg-gray-100 text-gray-500"
                    >
                        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="mt-6 px-2 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                                flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                                ${isActive(item.path)
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                                ${!isOpen && 'justify-center px-2'}
                            `}
                        >
                            <item.icon size={24} />
                            {isOpen && (
                                <span className="ml-3 font-medium">{item.label}</span>
                            )}
                            {!isOpen && isActive(item.path) && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-indigo-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* User Section & Logout */}
                <div className="absolute bottom-0 w-full border-t border-gray-200 p-4 bg-gray-50">
                    <div className={`flex items-center ${!isOpen && 'justify-center'}`}>
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            U
                        </div>
                        {isOpen && (
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 truncate">{getUserName() || 'Cargando...'}</p>
                                <p className="text-xs text-gray-500 truncate">{getUserEmail() || 'Cargando...'}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className={`
                            mt-4 w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors
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
