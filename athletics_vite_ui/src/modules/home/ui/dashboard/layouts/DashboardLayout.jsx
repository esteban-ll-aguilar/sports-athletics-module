import React from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import { checkSession } from '@core/utils/authGuard';


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
