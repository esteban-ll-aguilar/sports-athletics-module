/**
 * MainLayout Component
 * --------------------
 * Este layout define la estructura general de la interfaz principal fuera del dashboard.
 * Incluye:
 *  - Un encabezado con título del módulo y espacio para navegación.
 *  - Un contenedor principal donde se renderizan las rutas hijas utilizando <Outlet />.
 *
 * Estilos:
 *  - Fondo gris claro para toda la interfaz.
 *  - Tipografía estándar y contenedores responsivos mediante Tailwind CSS.
 */

import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-indigo-600">Athletics Module</h1>
                    <nav>
                        {/* Navigation links will go here */}
                    </nav>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
