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

