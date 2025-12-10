/**
 * DashboardLayout Component
 * -------------------------
 * Este componente define la estructura principal del panel (dashboard).
 * Incluye un Sidebar fijo y una sección principal donde se renderizan
 * las rutas hijas mediante <Outlet /> de React Router.
 *
 * Estructura:
 *  - Sidebar: componente lateral de navegación.
 *  - Main: área donde se cargan las vistas según la ruta seleccionada.
 */

import React from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
    
const DashboardLayout = () => {
    return (
        <div className="dashboard-container">
            <Sidebar />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;

