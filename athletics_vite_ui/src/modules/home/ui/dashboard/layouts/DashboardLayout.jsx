import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-100 transition-colors duration-300">
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
                <div className="p-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
