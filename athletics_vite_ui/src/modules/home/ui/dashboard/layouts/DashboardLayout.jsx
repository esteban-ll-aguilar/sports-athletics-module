import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import { checkSession } from '@core/utils/authGuard';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gray-50 pl-4">
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            {/* Main Content Area */}
            <main
                className={`
                    transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}
                    min-h-screen
                `}
            >
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
