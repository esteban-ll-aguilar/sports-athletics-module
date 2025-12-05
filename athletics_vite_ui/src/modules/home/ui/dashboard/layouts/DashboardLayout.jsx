import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

const DashboardLayout = ({ children }) => {
    // We can lift the state up if we need to adjust the margin based on sidebar state,
    // but for simplicity we'll assume a fixed margin for the expanded/collapsed state or use a context.
    // For now, let's add a left margin that matches the sidebar width (default expanded).
    // A better approach is to have the Sidebar control the layout context, but let's keep it simple.

    // To make it responsive and dynamic, we might want to know if the sidebar is open.
    // However, since the sidebar handles its own state, we can use a standard margin 
    // and let the sidebar overlay or push content. 
    // For this implementation, we will use a margin-left that accommodates the sidebar.
    // Since the sidebar is fixed, we need padding-left.

    // NOTE: In a real app, use a Context to share `isOpen` state between Sidebar and Layout 
    // to adjust the padding dynamically. For now, we'll use a safe padding for the expanded state 
    // or just the collapsed state on mobile.

    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar />
            <div className="transition-all duration-300 ease-in-out md:ml-64 p-8">
                {children}
            </div>
        </div>
    );
};

export default DashboardLayout;
