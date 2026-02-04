import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-[#212121] text-white font-sans">
            
            {/* Header */}
            <header className="bg-[#242223] border-b border-[#332122] shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    
                    <h1 className="text-xl font-bold text-[#b30c25] tracking-wide">
                        Athletics Module
                    </h1>

                    <nav className="text-gray-400 text-sm">
                        {/* Navigation links */}
                    </nav>

                </div>
            </header>

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-[#242223] border border-[#332122] rounded-xl p-6 shadow-lg">
                    <Outlet />
                </div>
            </main>

        </div>
    );
};

export default MainLayout;
